import "./Calendar.css"
import { useState, useEffect, useMemo } from 'react'

export default function CalendarWidget({ expenses, selectedDate, onDateSelect, currentMonth, onMonthChange }) {
    const today = new Date()

    // Initialize viewDate from currentMonth prop or use current date
    const initialDate = useMemo(() => {
        return currentMonth ? new Date(currentMonth) : new Date()
    }, []) // Only calculate on mount

    const [viewDate, setViewDate] = useState(initialDate)

    // Update viewDate when currentMonth changes from OUTSIDE (Parent -> Child sync)
    useEffect(() => {
        if (currentMonth) {
            const newDate = new Date(currentMonth)
            // Only update if different to avoid loops
            if (newDate.getMonth() !== viewDate.getMonth() || newDate.getFullYear() !== viewDate.getFullYear()) {
                setViewDate(newDate)
            }
        }
    }, [currentMonth])

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    // Internal navigation affects viewDate AND notifies parent
    const handlePrev = () => {
        const newDate = new Date(year, month - 1, 1)
        setViewDate(newDate)
        if (onMonthChange) onMonthChange(newDate)
    }

    const handleNext = () => {
        const newDate = new Date(year, month + 1, 1)
        setViewDate(newDate)
        if (onMonthChange) onMonthChange(newDate)
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // Adjust startDay for Monday-based week (0=Mon, 6=Sun)
    const rawStartDay = new Date(year, month, 1).getDay()
    const startDay = rawStartDay === 0 ? 6 : rawStartDay - 1

    const dailyInfo = expenses.reduce((acc, e) => {
        if (!e.transaction_date) return acc
        const d = e.transaction_date.slice(0, 10)
        if (!acc[d]) acc[d] = { total: 0, items: [] }
        if (e.type === 'expense') {
            acc[d].total += e.amount
            acc[d].items.push(e)
        }
        return acc
    }, {})

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <button className="cal-nav-btn" onClick={handlePrev}>◀</button>
                <span className="cal-title">{year}년 {month + 1}월</span>
                <button className="cal-nav-btn" onClick={handleNext}>▶</button>
            </div>
            <div className="calendar-grid">
                {['월', '화', '수', '목', '금', '토', '일'].map(d => (
                    <div key={d} className="cal-day-header">{d}</div>
                ))}
                {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} className="cal-cell empty" />)}
                {Array(daysInMonth).fill(null).map((_, i) => {
                    const d = i + 1
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                    const info = dailyInfo[dateStr]
                    const amt = info ? info.total : 0
                    const isToday = today.toDateString() === new Date(year, month, d).toDateString()
                    const isSelected = selectedDate === dateStr

                    const tooltipText = info ? info.items.map(it => `${it.place}: ${it.amount.toLocaleString()}원`).join('\n') : ''

                    return (
                        <div
                            key={d}
                            className={`cal-cell ${isToday ? 'today' : ''} ${amt ? 'has-expense' : ''} ${isSelected ? 'selected' : ''}`}
                            onClick={() => onDateSelect(dateStr === selectedDate ? null : dateStr)}
                            title={tooltipText}
                        >
                            <span className="cal-date">{d}</span>
                            {amt > 0 && <span className="cal-amount">{Math.round(amt / 1000)}k</span>}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
