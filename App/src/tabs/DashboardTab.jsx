import "./DashboardTab.css"
import { useState, useMemo, useEffect, useRef } from 'react'
import { SpendingChart } from '../components/Charts'
import CalendarWidget from '../components/Calendar'
import FixedExpenseModal from '../modals/FixedExpenseModal'
import { Skeleton } from '../components/Skeleton'
import { motion } from 'framer-motion'
import { useAlert } from '../contexts'

export default function DashboardTab({ expenses, config, setConfig, saveConfig, selectedDate, setSelectedDate, loading }) {
    const [period, setPeriod] = useState('DAILY')
    const [isEditingFixed, setIsEditingFixed] = useState(false)
    // Persist includeFixed to config
    const [includeFixed, setIncludeFixedState] = useState(config?.include_fixed ?? false)

    // Sync state with config changes (important for initial load)
    useEffect(() => {
        if (config?.include_fixed !== undefined) {
            setIncludeFixedState(config.include_fixed)
        }
    }, [config?.include_fixed])

    const setIncludeFixed = (value) => {
        setIncludeFixedState(value)
        // Save to config
        if (saveConfig && setConfig) {
            const newConfig = { ...config, include_fixed: value }
            setConfig(newConfig)
            saveConfig(newConfig)
        }
    }

    // Alert Context
    const { showAlert } = useAlert()

    // Month Navigation State (Default: Today's month)
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Month Picker State
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear())
    const pickerRef = useRef(null)

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowMonthPicker(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth() // 0-indexed
    const currentMonthKey = `${year}-${String(month + 1).padStart(2, '0')}`

    const currentBudget = (config.monthly_budgets && config.monthly_budgets[currentMonthKey])
        || config.budget
        || 1000000

    // Stats
    const currentStats = useMemo(() => {
        // Filter expenses for this month
        const monthExpenses = expenses.filter(e => {
            if (!e.transaction_date) return false
            const d = new Date(e.transaction_date)
            return d.getFullYear() === year && d.getMonth() === month
        })

        // Calculate totals
        const totalExp = monthExpenses
            .filter(e => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0)

        const totalInc = monthExpenses
            .filter(e => e.type === 'income')
            .reduce((sum, e) => sum + e.amount, 0)

        // Calculate Actual Fixed Expenses (Simplistic check)
        const actualFixed = monthExpenses
            .filter(e => e.type === 'expense' && (e.is_fixed === 1 || e.category === '고정지출' || e.category === 'Fixed'))
            .reduce((sum, e) => sum + e.amount, 0)

        // Plan Fixed Expenses
        const planFixedList = config.fixed_expenses || []
        const planFixed = planFixedList.filter(i => i.type !== 'income').reduce((sum, i) => sum + (i.amount || 0), 0)

        // Remaining Budget Logic
        const remainingFixedCommitment = Math.max(0, planFixed - actualFixed)
        const budget = currentBudget

        // Apply includeFixed Logic
        const deductAmount = totalExp + (includeFixed ? remainingFixedCommitment : 0)
        const remaining = budget - deductAmount

        const usage = budget > 0 ? Math.round((deductAmount / budget) * 100) : 0

        return {
            totalExpense: totalExp,
            totalIncome: totalInc,
            budgetUsage: usage,
            remainingBudget: remaining,
            remainingFixedCommitment
        }
    }, [expenses, currentMonth, currentBudget, config.fixed_expenses, includeFixed])

    // Fixed Estimates (Config based)
    const fixedEstimates = useMemo(() => {
        const list = config.fixed_expenses || []
        const exp = list.filter(i => i.type !== 'income').reduce((sum, i) => sum + (i.amount || 0), 0)
        const inc = list.filter(i => i.type === 'income').reduce((sum, i) => sum + (i.amount || 0), 0)
        const hasVariableExp = list.some(i => i.type !== 'income' && i.amount === null)
        const hasVariableInc = list.some(i => i.type === 'income' && i.amount === null)
        return { exp, inc, hasVariableExp, hasVariableInc }
    }, [config.fixed_expenses])

    // Month Comparison (vs Previous Month)
    const monthComparison = useMemo(() => {
        const prevMonth = new Date(year, month - 1, 1)
        const prevYear = prevMonth.getFullYear()
        const prevMonthNum = prevMonth.getMonth()

        const prevMonthExpenses = expenses.filter(e => {
            if (!e.transaction_date) return false
            const d = new Date(e.transaction_date)
            return d.getFullYear() === prevYear && d.getMonth() === prevMonthNum
        })

        const prevTotal = prevMonthExpenses
            .filter(e => e.type === 'expense')
            .reduce((sum, e) => sum + e.amount, 0)

        const diff = currentStats.totalExpense - prevTotal
        const diffPercent = prevTotal > 0 ? Math.round((diff / prevTotal) * 100) : 0

        return {
            prevTotal,
            diff,
            diffPercent,
            isIncrease: diff > 0
        }
    }, [expenses, year, month, currentStats.totalExpense])

    // Skeleton Loading
    if (loading) return (
        <div className="dashboard">
            <div className="stats-row">
                {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="100px" />)}
            </div>
            <div className="dashboard-main">
                <Skeleton height="400px" />
                <Skeleton height="400px" />
            </div>
        </div>
    )

    const dailyExpenses = selectedDate
        ? expenses.filter(e => e.transaction_date && e.transaction_date.startsWith(selectedDate))
        : []

    const handleDateSelect = (dateStr) => {
        setSelectedDate(dateStr === selectedDate ? null : dateStr)
    }

    const handleFixedSave = async (newConfig) => {
        const res = await saveConfig(newConfig)
        if (res.success) {
            if (setConfig) setConfig(newConfig)
            setIsEditingFixed(false)
        } else {
            showAlert('오류', '설정 저장에 실패했습니다.')
        }
    }

    const handlePrevMonth = () => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        setCurrentMonth(newDate)
    }

    const handleNextMonth = () => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
        setCurrentMonth(newDate)
    }

    const handleMonthSelect = (m) => {
        setCurrentMonth(new Date(pickerYear, m - 1, 1))
        setShowMonthPicker(false)
    }

    const displayDateParts = selectedDate ? selectedDate.split('-') : null;
    const dpDisplayMonth = displayDateParts ? parseInt(displayDateParts[1]) : 0;
    const dpDisplayDay = displayDateParts ? parseInt(displayDateParts[2]) : 0;

    return (
        <motion.div
            className="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* First-time user hint when no expenses exist */}
            {expenses.length === 0 && !loading && (
                <div className="onboarding-hint" style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '24px',
                    color: 'white',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem' }}>🎉 Mino에 오신 것을 환영합니다!</h3>
                    <p style={{ margin: '0 0 16px 0', opacity: 0.9 }}>
                        아직 거래 내역이 없습니다. Gmail에서 결제 알림을 동기화해보세요.
                    </p>
                    <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8 }}>
                        💡 상단의 📥 버튼을 눌러 동기화를 시작하세요
                    </p>
                </div>
            )}

            {isEditingFixed && (
                <FixedExpenseModal
                    config={config}
                    onClose={() => setIsEditingFixed(false)}
                    onSave={handleFixedSave}
                />
            )}

            <div className="month-navigator" ref={pickerRef} style={{ position: 'relative' }}>
                <button className="month-nav-btn" onClick={handlePrevMonth} aria-label="이전 달">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>

                <h2 className="month-title"
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => {
                        setPickerYear(currentMonth.getFullYear())
                        setShowMonthPicker(!showMonthPicker)
                    }}
                >
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </h2>

                <button className="month-nav-btn" onClick={handleNextMonth} aria-label="다음 달">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>

                {showMonthPicker && (
                    <div className="month-picker-popover">
                        <div className="mp-header">
                            <button onClick={() => setPickerYear(pickerYear - 1)} aria-label="이전 년도">&lt;</button>
                            <span>{pickerYear}년</span>
                            <button onClick={() => setPickerYear(pickerYear + 1)} aria-label="다음 년도">&gt;</button>
                        </div>
                        <div className="mp-grid">
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <button
                                    key={m}
                                    onClick={() => handleMonthSelect(m)}
                                    className={currentMonth.getMonth() + 1 === m && currentMonth.getFullYear() === pickerYear ? 'active' : ''}
                                >
                                    {m}월
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-label">총 지출</span>
                    <span className="stat-value expense">{currentStats.totalExpense.toLocaleString()}원</span>
                </div>
                <div className="stat-card">
                    <span className="stat-label">총 수입</span>
                    <span className="stat-value income">{currentStats.totalIncome.toLocaleString()}원</span>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">잔여 예산</span>
                        <label className="checkbox-label-fixed" title="아직 지출되지 않은 고정 비용을 예산에서 미리 차감합니다">
                            <input
                                type="checkbox"
                                checked={includeFixed}
                                onChange={e => setIncludeFixed(e.target.checked)}
                            />
                            <span>고정비 포함</span>
                        </label>
                    </div>
                    <span className="stat-value">{currentStats.remainingBudget.toLocaleString()}원</span>
                    <div className="budget-usage-row">
                        <span className="budget-usage-text">{currentStats.budgetUsage}% 사용</span>
                        <div className="stat-gauge-container">
                            <div
                                className={`stat-gauge-fill ${currentStats.budgetUsage > 90 ? 'danger' : currentStats.budgetUsage > 70 ? 'warning' : 'safe'}`}
                                style={{ width: `${Math.min(currentStats.budgetUsage, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">고정 비용</span>
                        <button className="btn-icon-mini" onClick={() => setIsEditingFixed(true)}>✏️</button>
                    </div>
                    <div className="fixed-stat-grid">
                        <div className="fs-row">
                            <span className="fs-label">고정 지출</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span className="fs-val exp">-{fixedEstimates.exp.toLocaleString()}</span>
                                {fixedEstimates.hasVariableExp && <span className="fs-alpha">+α</span>}
                            </div>
                        </div>
                        <div className="fs-divider"></div>
                        <div className="fs-row">
                            <span className="fs-label">고정 수입</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span className="fs-val inc">+{fixedEstimates.inc.toLocaleString()}</span>
                                {fixedEstimates.hasVariableInc && <span className="fs-alpha">+α</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="stat-card comparison">
                    <span className="stat-label">전월 대비</span>
                    <div className="comparison-content">
                        <span className={`comparison-value ${monthComparison.isIncrease ? 'increase' : 'decrease'}`}>
                            {monthComparison.isIncrease ? '▲' : '▼'} {Math.abs(monthComparison.diff).toLocaleString()}원
                        </span>
                        <span className={`comparison-percent ${monthComparison.isIncrease ? 'increase' : 'decrease'}`}>
                            ({monthComparison.isIncrease ? '+' : ''}{monthComparison.diffPercent}%)
                        </span>
                    </div>
                    <span className="comparison-prev">전월: {monthComparison.prevTotal.toLocaleString()}원</span>
                </div>
            </div>

            <div className="dashboard-main">
                <div className="dashboard-card">
                    <div className="dash-card-header">
                        <h3>지출 추이</h3>
                        <div className="period-btns">
                            {['DAILY', 'WEEKLY', 'MONTHLY'].map(p => (
                                <button
                                    key={p}
                                    className={`period-btn ${period === p ? 'active' : ''}`}
                                    onClick={() => setPeriod(p)}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <SpendingChart expenses={expenses} period={period} selectedDate={selectedDate} currentMonth={currentMonth} />
                </div>

                <div className="dashboard-card">
                    <div className="dash-card-header">
                        <h3>소비 캘린더</h3>
                    </div>
                    <div className="calendar-container-fixed">
                        <CalendarWidget
                            expenses={expenses}
                            selectedDate={selectedDate}
                            onDateSelect={handleDateSelect}
                            currentMonth={currentMonth}
                            onMonthChange={setCurrentMonth}
                        />
                    </div>
                </div>
            </div>

            <div className="dashboard-list-card">
                <div className="dash-card-header">
                    <h3>{selectedDate ? `${dpDisplayMonth}월 ${dpDisplayDay}일 상세 내역` : '일별 지출 내역'}</h3>
                </div>
                <div className="daily-details-full">
                    {dailyExpenses.length > 0 ? (
                        <div className="details-grid">
                            {dailyExpenses.map(e => (
                                <div key={e.id} className="detail-item">
                                    <div className="detail-info">
                                        <div className="detail-header">
                                            <span className="detail-place">{e.place}</span>
                                            <span className={`detail-amt ${e.type}`}>{e.type === 'expense' ? '-' : '+'}{e.amount.toLocaleString()}원</span>
                                        </div>
                                        <div className="detail-sub">{e.location || '위치 정보 없음'}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            {selectedDate ? '내역이 없습니다' : '캘린더에서 날짜를 선택하여 상세 내역을 확인하세요'}
                        </div>
                    )}
                </div>
            </div>

        </motion.div>
    )
}
