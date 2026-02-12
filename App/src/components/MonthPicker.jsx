/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from 'react'
import './MonthPicker.css'

/**
 * Reusable Month Picker Component
 * @param {Date} currentMonth - Currently selected month
 * @param {Function} onMonthSelect - Callback when month is selected
 * @param {boolean} showAllButton - Whether to show "전체" button
 * @param {boolean} isAllSelected - Whether "전체" is currently active
 * @param {Function} onAllSelect - Callback when "전체" is clicked
 */
export default function MonthPicker({
    currentMonth = new Date(),
    onMonthSelect,
    showAllButton = false,
    isAllSelected = false,
    onAllSelect
}) {
    // Ensure currentMonth is a valid Date
    const safeMonth = currentMonth instanceof Date ? currentMonth : new Date()

    const [showPicker, setShowPicker] = useState(false)
    const [pickerYear, setPickerYear] = useState(safeMonth.getFullYear())
    const pickerRef = useRef(null)

    // Sync pickerYear when currentMonth changes
    useEffect(() => {
        if (currentMonth instanceof Date) {
            setPickerYear(currentMonth.getFullYear())
        }
    }, [currentMonth])

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setShowPicker(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleMonthClick = (month) => {
        const newDate = new Date(pickerYear, month - 1, 1)
        onMonthSelect(newDate)
        setShowPicker(false)
    }

    const handleButtonClick = () => {
        if (onAllSelect && isAllSelected) {
            // If showing "전체" and it's selected, just toggle picker
        }
        setShowPicker(!showPicker)
    }

    // Calculate position for fixed positioning
    const getPopoverStyle = () => {
        if (!pickerRef.current) return {}
        const rect = pickerRef.current.getBoundingClientRect()
        return {
            top: rect.bottom + 8,
            left: rect.left
        }
    }

    return (
        <div className="month-picker-wrapper" ref={pickerRef}>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    className={`mini-filter-btn ${!isAllSelected ? 'active' : ''}`}
                    onClick={handleButtonClick}
                >
                    {safeMonth.getFullYear()}. {safeMonth.getMonth() + 1} ▾
                </button>

                {showAllButton && (
                    <button
                        className={`mini-filter-btn ${isAllSelected ? 'active' : ''}`}
                        onClick={() => onAllSelect && onAllSelect()}
                    >
                        전체
                    </button>
                )}
            </div>

            {showPicker && (
                <div className="month-picker-popover">
                    <div className="mp-header">
                        <button onClick={() => setPickerYear(pickerYear - 1)}>&lt;</button>
                        <span>{pickerYear}년</span>
                        <button onClick={() => setPickerYear(pickerYear + 1)}>&gt;</button>
                    </div>
                    <div className="mp-grid">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <button
                                key={m}
                                onClick={() => handleMonthClick(m)}
                                className={
                                    safeMonth.getMonth() + 1 === m &&
                                        safeMonth.getFullYear() === pickerYear
                                        ? 'active'
                                        : ''
                                }
                            >
                                {m}월
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
