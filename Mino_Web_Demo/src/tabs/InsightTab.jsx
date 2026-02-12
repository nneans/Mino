/* eslint-disable react/prop-types */
import "./InsightTab.css"
import '../components/MonthPicker.css'
import { useState, useEffect, useMemo, useRef } from 'react'
import { getKoreanCategory } from '../utils/constants'
import { aiService } from '../services/apiService'
import { motion } from 'framer-motion'
import { Skeleton } from '../components/Skeleton'
import YearlyReportModal from '../modals/YearlyReportModal'
import HeatmapCalendar from '../components/HeatmapCalendar'

export default function InsightTab({ expenses = [], loading, config }) {
    const [showYearlyModal, setShowYearlyModal] = useState(false)
    const [filter, setFilter] = useState('MONTHLY')
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [graphData, setGraphData] = useState(null)
    const [graphLoading, setGraphLoading] = useState(true)
    const [showHeatmap, setShowHeatmap] = useState(false)

    // Month Picker State (INBOX style)
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

    useEffect(() => {
        const loadGraph = async () => {
            try {
                const data = await aiService.getGraph()
                setGraphData(data)
            } catch (err) {
                console.error("Graph load failed", err)
            } finally {
                setGraphLoading(false)
            }
        }
        loadGraph()
    }, [])

    const handleMonthSelect = (m) => {
        setCurrentMonth(new Date(pickerYear, m - 1, 1))
        setShowMonthPicker(false)
        setFilter('MONTHLY')
    }

    // Filter Logic
    const filteredExpenses = useMemo(() => {
        if (filter === 'ALL') return expenses
        return expenses.filter(e => {
            if (!e.transaction_date) return false
            const d = new Date(e.transaction_date)
            return d.getFullYear() === currentMonth.getFullYear() &&
                d.getMonth() === currentMonth.getMonth()
        })
    }, [expenses, currentMonth, filter])

    // Previous Month Data for Comparison
    const prevMonthExpenses = useMemo(() => {
        const prevMonth = new Date(currentMonth)
        prevMonth.setMonth(prevMonth.getMonth() - 1)
        return expenses.filter(e => {
            if (!e.transaction_date) return false
            const d = new Date(e.transaction_date)
            return d.getFullYear() === prevMonth.getFullYear() &&
                d.getMonth() === prevMonth.getMonth()
        })
    }, [expenses, currentMonth])

    // Calculate Stats
    const stats = useMemo(() => {
        const totalExpense = filteredExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
        const totalIncome = filteredExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
        const netIncome = totalIncome - totalExpense
        const txCount = filteredExpenses.filter(e => e.type === 'expense').length

        // Previous month totals for comparison
        const prevExpense = prevMonthExpenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
        const prevIncome = prevMonthExpenses.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)

        // Change percentages
        const expenseChange = prevExpense > 0 ? ((totalExpense - prevExpense) / prevExpense * 100) : 0
        const incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100) : 0

        // Spending Score (0-100, higher is better - meaning less spending relative to income/budget)
        const budget = config?.budget || 1000000
        const budgetUsage = budget > 0 ? (totalExpense / budget * 100) : 0
        const spendingScore = Math.max(0, Math.min(100, Math.round(100 - budgetUsage)))

        // Grade
        let grade = 'F'
        if (spendingScore >= 90) grade = 'S'
        else if (spendingScore >= 80) grade = 'A+'
        else if (spendingScore >= 70) grade = 'A'
        else if (spendingScore >= 60) grade = 'B+'
        else if (spendingScore >= 50) grade = 'B'
        else if (spendingScore >= 40) grade = 'C'
        else if (spendingScore >= 30) grade = 'D'

        // Top Merchants with comparison
        const merchantMap = {}
        const prevMerchantMap = {}

        filteredExpenses.filter(e => e.type === 'expense').forEach(e => {
            merchantMap[e.place] = (merchantMap[e.place] || 0) + e.amount
        })
        prevMonthExpenses.filter(e => e.type === 'expense').forEach(e => {
            prevMerchantMap[e.place] = (prevMerchantMap[e.place] || 0) + e.amount
        })

        const topMerchants = Object.entries(merchantMap)
            .map(([name, total]) => ({
                name,
                total,
                prevTotal: prevMerchantMap[name] || 0,
                change: prevMerchantMap[name] ? ((total - prevMerchantMap[name]) / prevMerchantMap[name] * 100) : null
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5)

        // Category Stats with comparison and donut chart data
        const categoryMap = {}
        const prevCategoryMap = {}

        filteredExpenses.filter(e => e.type === 'expense').forEach(e => {
            categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
        })
        prevMonthExpenses.filter(e => e.type === 'expense').forEach(e => {
            prevCategoryMap[e.category] = (prevCategoryMap[e.category] || 0) + e.amount
        })

        const categoryStats = Object.entries(categoryMap)
            .map(([name, total]) => ({
                name,
                total,
                percentage: totalExpense > 0 ? (total / totalExpense * 100) : 0,
                prevTotal: prevCategoryMap[name] || 0,
                change: prevCategoryMap[name] ? ((total - prevCategoryMap[name]) / prevCategoryMap[name] * 100) : null
            }))
            .sort((a, b) => b.total - a.total)

        return {
            totalExpense, totalIncome, netIncome,
            prevExpense, prevIncome,
            expenseChange, incomeChange,
            spendingScore, grade, budgetUsage,
            topMerchants, categoryStats, txCount
        }
    }, [filteredExpenses, prevMonthExpenses, config])

    // AI Insights based on data patterns
    const aiInsights = useMemo(() => {
        const insights = []

        // 1. Spending trend
        if (stats.expenseChange < -10) {
            insights.push({
                icon: '📉',
                title: '지출 절감 중!',
                text: `전월 대비 ${Math.abs(stats.expenseChange).toFixed(0)}% 줄었어요`,
                type: 'success'
            })
        } else if (stats.expenseChange > 20) {
            insights.push({
                icon: '📈',
                title: '지출 증가 주의',
                text: `전월 대비 ${stats.expenseChange.toFixed(0)}% 늘었어요`,
                type: 'warning'
            })
        }

        // 2. Top category analysis
        if (stats.categoryStats.length > 0) {
            const topCat = stats.categoryStats[0]
            if (topCat.percentage > 40) {
                insights.push({
                    icon: '🎯',
                    title: `${getKoreanCategory(topCat.name)} 집중 지출`,
                    text: `전체 지출의 ${topCat.percentage.toFixed(0)}%를 차지해요`,
                    type: 'info'
                })
            }
        }

        // 3. Weekend spending pattern
        const weekendExpenses = filteredExpenses.filter(e => {
            if (!e.transaction_date || e.type !== 'expense') return false
            const day = new Date(e.transaction_date).getDay()
            return day === 0 || day === 6
        }).reduce((sum, e) => sum + e.amount, 0)

        const weekdayExpenses = stats.totalExpense - weekendExpenses
        const weekendRatio = stats.totalExpense > 0 ? (weekendExpenses / stats.totalExpense * 100) : 0

        if (weekendRatio > 40) {
            insights.push({
                icon: '🏖️',
                title: '주말 지출 비중 높음',
                text: `주말에 전체의 ${weekendRatio.toFixed(0)}%를 사용해요`,
                type: 'warning'
            })
        }

        // 4. Budget advice
        if (stats.budgetUsage > 80) {
            insights.push({
                icon: '⚠️',
                title: '예산 한도 임박',
                text: `예산의 ${stats.budgetUsage.toFixed(0)}%를 사용했어요`,
                type: 'danger'
            })
        } else if (stats.budgetUsage < 50 && stats.txCount > 5) {
            insights.push({
                icon: '🎉',
                title: '훌륭한 예산 관리!',
                text: `아직 예산의 ${(100 - stats.budgetUsage).toFixed(0)}%가 남았어요`,
                type: 'success'
            })
        }

        // 5. Frequent small purchases
        const smallPurchases = filteredExpenses.filter(e => e.type === 'expense' && e.amount < 5000)
        if (smallPurchases.length > 20) {
            const smallTotal = smallPurchases.reduce((sum, e) => sum + e.amount, 0)
            insights.push({
                icon: '☕',
                title: '소액 지출 다빈도',
                text: `5천원 미만 결제 ${smallPurchases.length}건, 총 ${smallTotal.toLocaleString()}원`,
                type: 'info'
            })
        }

        return insights.slice(0, 4)
    }, [stats, filteredExpenses])

    // Graph Insights Helper
    const getGraphInsights = () => {
        if (!graphData || !graphData.links) return []
        const sortedLinks = [...graphData.links].sort((a, b) => b.weight - a.weight)
        const insights = []
        const seen = new Set()

        sortedLinks.forEach(link => {
            const src = link.source
            const tgt = link.target
            const rel = link.relation
            const weight = link.weight
            if (weight < 2) return

            if (rel === 'VISITED_AT') {
                const place = src.replace('place_', '')
                const time = tgt.replace('time_', '')
                const key = `time-${place}`
                if (seen.has(key)) return
                seen.add(key)
                const timeMap = { 'Morning': '아침', 'Lunch': '점심', 'Afternoon': '오후', 'Dinner': '저녁', 'Night': '밤' }
                const timeStr = timeMap[time] || time
                insights.push({ type: 'time', text: `${place}는 주로 ${timeStr}에 방문해요.`, sub: `${weight}회 기록됨`, icon: '⏰' })
            } else if (rel === 'VISITED_ON') {
                const place = src.replace('place_', '')
                const day = tgt.replace('day_', '')
                const key = `day-${place}`
                if (seen.has(key)) return
                seen.add(key)
                const dayMap = { 'Monday': '월요일', 'Tuesday': '화요일', 'Wednesday': '수요일', 'Thursday': '목요일', 'Friday': '금요일', 'Saturday': '토요일', 'Sunday': '일요일' }
                const dayStr = dayMap[day] || day
                insights.push({ type: 'day', text: `${place}는 ${dayStr}에 자주 가시네요.`, sub: `${weight}회 기록됨`, icon: '📅' })
            }
        })
        return insights.slice(0, 6)
    }

    const graphInsights = getGraphInsights()

    // Grade color helper
    const getGradeColor = (grade) => {
        const colors = {
            'S': '#8b5cf6', 'A+': '#10b981', 'A': '#22c55e',
            'B+': '#84cc16', 'B': '#eab308', 'C': '#f97316',
            'D': '#ef4444', 'F': '#dc2626'
        }
        return colors[grade] || '#64748b'
    }

    if (loading) return (
        <div className="insight-container">
            <div className="insight-grid">
                <Skeleton height="300px" />
                <Skeleton height="300px" />
            </div>
        </div>
    )

    return (
        <motion.div
            className="insight-container-v2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Header */}
            <div className="insight-header-v2">
                <div className="header-left">
                    <h2>인사이트</h2>
                    <div className="header-actions">
                        <button
                            className={`action-btn ${showHeatmap ? 'active' : ''}`}
                            onClick={() => setShowHeatmap(!showHeatmap)}
                        >
                            📊 히트맵
                        </button>
                        <button
                            className="action-btn"
                            onClick={() => setShowYearlyModal(true)}
                        >
                            📈 연간 리포트
                        </button>
                    </div>
                </div>

                {/* INBOX style Month Picker */}
                <div className="inbox-filters new-style">
                    <div style={{ position: 'relative' }} ref={pickerRef}>
                        <button
                            className={`mini-filter-btn ${filter === 'MONTHLY' ? 'active' : ''}`}
                            onClick={() => {
                                if (filter !== 'MONTHLY') setFilter('MONTHLY')
                                setShowMonthPicker(!showMonthPicker)
                            }}
                        >
                            {currentMonth.getFullYear()}. {currentMonth.getMonth() + 1} ▾
                        </button>

                        {showMonthPicker && (
                            <div className="month-picker-popover mini">
                                <div className="mp-header">
                                    <button onClick={() => setPickerYear(pickerYear - 1)}>&lt;</button>
                                    <span>{pickerYear}년</span>
                                    <button onClick={() => setPickerYear(pickerYear + 1)}>&gt;</button>
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

                    <button
                        className={`mini-filter-btn ${filter === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilter('ALL')}
                    >
                        전체
                    </button>
                </div>
            </div>

            {/* Heatmap Calendar (Collapsible) */}
            {showHeatmap && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="heatmap-section"
                >
                    <HeatmapCalendar expenses={expenses} year={currentMonth.getFullYear()} />
                </motion.div>
            )}

            {/* Performance Summary Cards */}
            <div className="performance-cards">
                <div className="perf-card net-income">
                    <div className="perf-icon">💰</div>
                    <div className="perf-content">
                        <span className="perf-label">순수익</span>
                        <span className={`perf-value ${stats.netIncome >= 0 ? 'positive' : 'negative'}`}>
                            {stats.netIncome >= 0 ? '+' : ''}{stats.netIncome.toLocaleString()}원
                        </span>
                        {filter === 'MONTHLY' && (
                            <span className="perf-sub">수입 - 지출</span>
                        )}
                    </div>
                </div>

                <div className="perf-card spending-score">
                    <div className="perf-icon">📊</div>
                    <div className="perf-content">
                        <span className="perf-label">지출 지수</span>
                        <div className="score-display">
                            <span className="perf-value">{stats.spendingScore}점</span>
                            <div className="score-bar">
                                <div
                                    className="score-fill"
                                    style={{
                                        width: `${stats.spendingScore}%`,
                                        background: stats.spendingScore >= 70 ? '#10b981' : stats.spendingScore >= 40 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="perf-card grade-card">
                    <div className="perf-icon">🎖️</div>
                    <div className="perf-content">
                        <span className="perf-label">절약 등급</span>
                        <span
                            className="grade-badge"
                            style={{ background: getGradeColor(stats.grade) }}
                        >
                            {stats.grade}
                        </span>
                        <span className="perf-sub">
                            {stats.grade === 'S' ? '최상위' :
                                stats.grade.startsWith('A') ? '상위권' :
                                    stats.grade.startsWith('B') ? '평균' : '개선 필요'}
                        </span>
                    </div>
                </div>

                {filter === 'MONTHLY' && (
                    <div className="perf-card comparison">
                        <div className="perf-icon">📈</div>
                        <div className="perf-content">
                            <span className="perf-label">전월 대비</span>
                            <span className={`perf-value ${stats.expenseChange <= 0 ? 'positive' : 'negative'}`}>
                                {stats.expenseChange <= 0 ? '▼' : '▲'} {Math.abs(stats.expenseChange).toFixed(0)}%
                            </span>
                            <span className="perf-sub">
                                {stats.expenseChange <= 0 ? '지출 감소' : '지출 증가'}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Insights */}
            {aiInsights.length > 0 && (
                <div className="ai-insights-section">
                    <h3>🧠 AI 소비 인사이트</h3>
                    <div className="ai-insights-grid">
                        {aiInsights.map((insight, i) => (
                            <div key={i} className={`ai-insight-card ${insight.type}`}>
                                <span className="ai-icon">{insight.icon}</span>
                                <div className="ai-text">
                                    <strong>{insight.title}</strong>
                                    <p>{insight.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Stats Grid */}
            <div className="insight-grid-v2">
                {/* Category Analysis with Donut-style */}
                <div className="insight-card-v2">
                    <h3>📊 카테고리별 지출</h3>
                    <div className="category-list">
                        {stats.categoryStats.map((cat, i) => (
                            <div key={cat.name} className="category-row">
                                <div className="cat-rank">{i + 1}</div>
                                <div className="cat-info">
                                    <div className="cat-header">
                                        <span className="cat-name">{getKoreanCategory(cat.name)}</span>
                                        <span className="cat-amount">{cat.total.toLocaleString()}원</span>
                                    </div>
                                    <div className="cat-bar-container">
                                        <div
                                            className="cat-bar"
                                            style={{ width: `${cat.percentage}%` }}
                                        />
                                    </div>
                                    <div className="cat-meta">
                                        <span className="cat-percentage">{cat.percentage.toFixed(1)}%</span>
                                        {cat.change !== null && filter === 'MONTHLY' && (
                                            <span className={`cat-change ${cat.change <= 0 ? 'down' : 'up'}`}>
                                                {cat.change <= 0 ? '▼' : '▲'} {Math.abs(cat.change).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.categoryStats.length === 0 && (
                            <p className="empty-msg">선택한 기간의 데이터가 없습니다.</p>
                        )}
                    </div>
                </div>

                {/* Top Merchants with Comparison */}
                <div className="insight-card-v2">
                    <h3>🏆 최다 지출처 Top 5</h3>
                    <div className="merchant-list-v2">
                        {stats.topMerchants.length > 0 ? stats.topMerchants.map((m, i) => (
                            <div key={i} className="merchant-row">
                                <div className={`merchant-rank rank-${i + 1}`}>{i + 1}</div>
                                <div className="merchant-info">
                                    <div className="merchant-header">
                                        <span className="merchant-name">{m.name}</span>
                                        <span className="merchant-amount">{m.total.toLocaleString()}원</span>
                                    </div>
                                    <div className="merchant-bar-container">
                                        <div
                                            className="merchant-bar"
                                            style={{ width: `${(m.total / stats.topMerchants[0].total) * 100}%` }}
                                        />
                                    </div>
                                    {m.change !== null && filter === 'MONTHLY' && (
                                        <span className={`merchant-change ${m.change <= 0 ? 'down' : 'up'}`}>
                                            전월 대비 {m.change <= 0 ? '▼' : '▲'} {Math.abs(m.change).toFixed(0)}%
                                        </span>
                                    )}
                                </div>
                            </div>
                        )) : <p className="empty-msg">선택한 기간의 데이터가 없습니다.</p>}
                    </div>
                </div>
            </div>

            {/* Graph Insights (ALL filter only) */}
            {filter === 'ALL' && (
                <div className="graph-insights-section">
                    <h3>🔗 소비 패턴 분석</h3>
                    {graphLoading ? (
                        <Skeleton height="100px" />
                    ) : graphInsights.length > 0 ? (
                        <div className="pattern-grid">
                            {graphInsights.map((ins, i) => (
                                <div key={i} className="pattern-card">
                                    <span className="pattern-icon">{ins.icon}</span>
                                    <div className="pattern-info">
                                        <p className="pattern-text">{ins.text}</p>
                                        <span className="pattern-sub">{ins.sub}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="empty-msg" style={{ padding: '20px', textAlign: 'center' }}>
                            아직 충분한 소비 패턴 데이터가 쌓이지 않았습니다.<br />
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>데이터 동기화를 통해 이메일 데이터를 분석해보세요.</span>
                        </p>
                    )}
                </div>
            )}

            <YearlyReportModal
                isOpen={showYearlyModal}
                onClose={() => setShowYearlyModal(false)}
                expenses={expenses}
                config={config}
            />
        </motion.div>
    )
}
