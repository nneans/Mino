/* eslint-disable react/prop-types */
import './MapTab.css'
import '../components/MonthPicker.css'
import KakaoMap from '../components/KakaoMap'
import { useState, useEffect, useMemo, useRef } from 'react'

export default function MapTab({
    expenses = [], selectedMapPlace, setSelectedMapPlace, config, onSearch, onUpdateExpense
}) {
    const [editingId, setEditingId] = useState(null)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)

    // Filter State
    const [filter, setFilter] = useState('MONTHLY') // 'MONTHLY' | 'ALL'

    // Month Navigation State
    const [currentMonth, setCurrentMonth] = useState(new Date())

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

    // Reset editing state when selected place changes
    useEffect(() => {
        if (selectedMapPlace?.id !== editingId) {
            setEditingId(null)
            setSearchKeyword('')
            setSearchResults([])
        }
    }, [selectedMapPlace?.id])

    const handleMonthSelect = (m) => {
        setCurrentMonth(new Date(pickerYear, m - 1, 1))
        setShowMonthPicker(false)
        setFilter('MONTHLY')
    }

    // Filter expenses logic
    const filteredExpenses = useMemo(() => {
        if (filter === 'ALL') return expenses

        return expenses.filter(e => {
            if (!e.transaction_date) return false
            const d = new Date(e.transaction_date)
            return d.getFullYear() === currentMonth.getFullYear() &&
                d.getMonth() === currentMonth.getMonth()
        })
    }, [expenses, currentMonth, filter])

    const formatDate = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return `${date.getMonth() + 1}.${date.getDate()}`
    }

    const handleEditLocation = (e, expense) => {
        e.stopPropagation()
        if (!onSearch) return
        setEditingId(expense.id)
        setSearchKeyword(expense.place || '')
        setSearchResults([])
    }

    const handleSearch = () => {
        if (!searchKeyword.trim() || !onSearch) return

        setSearchLoading(true)
        onSearch(searchKeyword, (results) => {
            setSearchResults(results || [])
            setSearchLoading(false)
        })
    }

    const handleSelectLocation = async (expense, place) => {
        if (!onUpdateExpense) return

        const addr = place.road_address_name || place.address_name
        const updatedExpense = {
            ...expense,
            location: addr,
            latitude: parseFloat(place.y),
            longitude: parseFloat(place.x)
        }

        await onUpdateExpense(updatedExpense)
        setEditingId(null)
        setSearchKeyword('')
        setSearchResults([])
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setSearchKeyword('')
        setSearchResults([])
    }

    // Only show expenses with location on the map
    const expensesWithLocation = filteredExpenses.filter(e => e && e.location && e.latitude && e.longitude)

    return (
        <div className="map-container">
            <div className="map-sidebar">
                <div className="sidebar-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>나의 지출 내역</h3>

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
                </div>

                <div className="place-list">
                    {expensesWithLocation.map(e => (
                        <div key={e.id} className="place-item-wrapper">
                            {editingId === e.id ? (
                                // Edit mode
                                <div className="location-edit-form">
                                    <div className="edit-header">
                                        <span className="edit-place-name">{e.place}</span>
                                        <button onClick={handleCancelEdit} className="btn-cancel-small">✕</button>
                                    </div>
                                    <div className="edit-search-row">
                                        <input
                                            type="text"
                                            value={searchKeyword}
                                            onChange={(ev) => setSearchKeyword(ev.target.value)}
                                            onKeyDown={(ev) => ev.key === 'Enter' && handleSearch()}
                                            placeholder="새 위치 검색"
                                        />
                                        <button
                                            onClick={handleSearch}
                                            disabled={searchLoading}
                                            className="btn-search-small"
                                        >
                                            {searchLoading ? '...' : '검색'}
                                        </button>
                                    </div>
                                    {searchResults.length > 0 && (
                                        <div className="search-results-mini">
                                            {searchResults.slice(0, 5).map((item, idx) => (
                                                <div
                                                    key={idx}
                                                    className="search-result-item"
                                                    onClick={() => handleSelectLocation(e, item)}
                                                >
                                                    <div className="result-name">{item.place_name}</div>
                                                    <div className="result-addr">{item.road_address_name || item.address_name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Normal view
                                <div
                                    className={`place-item ${selectedMapPlace?.id === e.id ? 'active' : ''}`}
                                    onClick={() => setSelectedMapPlace({ ...e })}
                                >
                                    <div className="place-left-group">
                                        <div className="place-date">{formatDate(e.transaction_date)}</div>
                                        <div className="place-info">
                                            <div className="place-name">{e.place}</div>
                                            <div className="place-addr">{e.location}</div>
                                        </div>
                                    </div>
                                    <div className="place-right-group">
                                        <div className="place-amount">{e.amount.toLocaleString()}원</div>
                                        {onSearch && (
                                            <button
                                                className="btn-edit-location"
                                                onClick={(ev) => handleEditLocation(ev, e)}
                                                title="위치 수정"
                                            >
                                                📍
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {expensesWithLocation.length === 0 && (
                        <div className="map-empty">
                            {filter === 'ALL' ? '위치 정보가 있는 거래가 없습니다' : `${currentMonth.getMonth() + 1}월에 위치 정보가 있는 거래가 없습니다`}
                        </div>
                    )}
                </div>
            </div>
            <div className="map-view">
                <KakaoMap
                    expenses={expensesWithLocation}
                    selectedPlace={selectedMapPlace}
                    onPlaceSelect={setSelectedMapPlace}
                    apiKey={config?.kakao_api_key}
                />
            </div>


        </div>
    )
}
