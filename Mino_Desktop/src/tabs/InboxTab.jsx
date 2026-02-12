/* eslint-disable react/prop-types */
import './InboxTab.css'
import '../components/MonthPicker.css'
import { useState, useRef, useEffect } from 'react'
import { isSameDay, startOfWeek, isAfter, isSameMonth } from 'date-fns'
import { WEEK_STARTS_ON_MONDAY } from '../utils/dateUtils'
import { RowSkeleton } from '../components/Skeleton'

import RulesModal from '../modals/RulesModal'

export default function InboxTab({ expenses, config, loading, currentLocationProps, onEdit, onDelete, onReset }) {
    const [filter, setFilter] = useState('MONTHLY') // ALL, DAILY, WEEKLY, MONTHLY
    const [searchQuery, setSearchQuery] = useState('')
    const [showRulesModal, setShowRulesModal] = useState(false)

    // Use location from props (App.jsx)
    const currentLocation = currentLocationProps

    // Month Navigation State
    const [currentMonth, setCurrentMonth] = useState(new Date())

    // Month Picker State
    const [showMonthPicker, setShowMonthPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear())
    const pickerRef = useRef(null)

    // Calculate distance (Haversine formula) in meters
    const getDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity
        const R = 6371e3 // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180
        const φ2 = lat2 * Math.PI / 180
        const Δφ = (lat2 - lat1) * Math.PI / 180
        const Δλ = (lon2 - lon1) * Math.PI / 180

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowMonthPicker(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMonthSelect = (m) => {
        setCurrentMonth(new Date(pickerYear, m - 1, 1))
        setShowMonthPicker(false)
        setFilter('MONTHLY')
    }

    // Helper function to parse date safely
    const parseDate = (dateStr) => {
        if (!dateStr) return new Date(0)
        const normalized = dateStr.replace('T', ' ').slice(0, 19)
        return new Date(normalized)
    }

    // Filter expenses based on selected period and reference month
    const filteredExpenses = expenses
        .filter(e => {
            if (!e.transaction_date) return false
            const date = parseDate(e.transaction_date)
            const now = new Date()

            if (filter === 'DAILY') return isSameDay(date, now)
            if (filter === 'WEEKLY') return isAfter(date, startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON_MONDAY }))
            if (filter === 'MONTHLY') return isSameMonth(date, currentMonth)

            return true // ALL
        })
        .filter(e => {
            if (!searchQuery) return true
            const query = searchQuery.toLowerCase()
            return (
                e.place?.toLowerCase().includes(query) ||
                e.category?.toLowerCase().includes(query) ||
                e.location?.toLowerCase().includes(query)
            )
        })
        .sort((a, b) => {
            const dateA = a.transaction_date ? new Date(a.transaction_date.replace(' ', 'T')).getTime() : 0
            const dateB = b.transaction_date ? new Date(b.transaction_date.replace(' ', 'T')).getTime() : 0

            // Priority 1: Date (Newest first) - ALWAYS
            if (dateA !== dateB) return dateB - dateA

            // Priority 2: Distance (as tiebreaker for same date/time)
            if (config?.use_location_sorting && currentLocation && filter !== 'ALL') {
                const distA = getDistance(currentLocation.lat, currentLocation.lng, a.latitude, a.longitude)
                const distB = getDistance(currentLocation.lat, currentLocation.lng, b.latitude, b.longitude)

                if (distA !== Infinity && distB !== Infinity) return distA - distB
                if (distA !== Infinity) return -1
                if (distB !== Infinity) return 1
            }

            return 0
        })

    return (
        <div className="inbox-container">
            <div className="inbox-header">
                <div className="inbox-title-area">
                    <h2>거래 내역</h2>
                    <span className="tx-count">
                        총 {filteredExpenses.length}건
                        <span style={{ fontWeight: 'normal', opacity: 0.8, marginLeft: '4px' }}>
                            (수입 {filteredExpenses.filter(e => e.type === 'income').length} · 지출 {filteredExpenses.filter(e => e.type === 'expense').length})
                        </span>
                    </span>
                </div>

                <div className="inbox-header-actions">
                    <button
                        onClick={() => setShowRulesModal(true)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginRight: '12px',
                            fontWeight: 500
                        }}
                        title="자동 분류 규칙 관리"
                    >
                        <span>규칙 관리</span>
                    </button>

                    <div className="inbox-search">
                        <input
                            type="text"
                            placeholder="🔍 검색 (상호명, 카테고리...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="inbox-search-input"
                        />
                        {searchQuery && (
                            <button
                                className="search-clear-btn"
                                onClick={() => setSearchQuery('')}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <div className="inbox-filters new-style">
                        <button
                            className={`mini-filter-btn ${filter === 'DAILY' ? 'active' : ''}`}
                            onClick={() => setFilter('DAILY')}
                        >
                            오늘
                        </button>
                        <button
                            className={`mini-filter-btn ${filter === 'WEEKLY' ? 'active' : ''}`}
                            onClick={() => setFilter('WEEKLY')}
                        >
                            이번주
                        </button>

                        {/* Month Filter & Picker Combined */}
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

                    {expenses.length > 0 && (
                        <button className="reset-btn" onClick={onReset} title="모든 데이터 삭제">
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            <div className="inbox-list">
                {loading ? (
                    <div style={{ padding: '16px' }}>
                        <RowSkeleton count={8} />
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="no-data-msg">
                        {filter === 'MONTHLY'
                            ? `${currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}의 거래 내역이 없습니다.`
                            : '해당 기간의 거래 내역이 없습니다.'}
                    </div>
                ) : (
                    filteredExpenses.map(e => (
                        <div key={e.id} className="inbox-item">
                            <div className="inbox-left">
                                <div className="inbox-place">{e.place}</div>
                                <div className="inbox-meta">
                                    {e.transaction_date.slice(0, 16).replace('T', ' ')} · {e.category}
                                    {e.location && <span className="inbox-location-badge">📍 {e.location}</span>}
                                </div>
                            </div>
                            <div className="inbox-right">
                                <span className={`inbox-amount ${e.type === 'income' ? 'income' : ''}`}>
                                    {e.type === 'income' ? '+' : '-'}{e.amount.toLocaleString()}원
                                </span>
                                <div className="inbox-actions">
                                    <button className="icon-btn" onClick={() => onEdit(e)}>✏️</button>
                                    <button className="icon-btn" onClick={() => onDelete(e.id)}>🗑️</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <RulesModal
                isOpen={showRulesModal}
                onClose={() => setShowRulesModal(false)}
            />
        </div>
    )
}
