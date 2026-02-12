/**
 * Heatmap Calendar Component
 * GitHub-style contribution heatmap for expense visualization
 */

import { useMemo, useState, useEffect } from 'react'
import './HeatmapCalendar.css'

export default function HeatmapCalendar({ expenses = [], year: initialYear = new Date().getFullYear() }) {
    const [selectedYear, setSelectedYear] = useState(initialYear)
    const [hoverData, setHoverData] = useState(null)

    useEffect(() => {
        setSelectedYear(initialYear)
    }, [initialYear])

    // Generate all dates for the year organized by columns (weeks)
    const calendarData = useMemo(() => {
        if (!expenses) return { columns: [], maxAmount: 0 }

        const startDate = new Date(selectedYear, 0, 1)
        const endDate = new Date(selectedYear, 11, 31)

        // Build expense map by date
        const expenseMap = {}
        expenses.forEach(e => {
            if (!e.transaction_date || e.type !== 'expense') return
            const dateKey = e.transaction_date.slice(0, 10)
            expenseMap[dateKey] = (expenseMap[dateKey] || 0) + e.amount
        })

        // Find max for intensity calculation
        const values = Object.values(expenseMap)
        const maxAmount = values.length > 0 ? Math.max(...values) : 100000

        // Generate calendar - each column is a week (7 days)
        const columns = []
        let currentColumn = []
        let current = new Date(startDate)

        // Pad the first column with empty cells for alignment
        const firstDayOfWeek = current.getDay() // 0 = Sunday
        for (let i = 0; i < firstDayOfWeek; i++) {
            currentColumn.push(null)
        }

        while (current <= endDate) {
            // Fix: Use local date components to avoid UTC timezone shifts
            const year = current.getFullYear()
            const month = String(current.getMonth() + 1).padStart(2, '0')
            const day = String(current.getDate()).padStart(2, '0')
            const dateKey = `${year}-${month}-${day}`

            const amount = expenseMap[dateKey] || 0
            const intensity = maxAmount > 0 ? Math.min(4, Math.floor((amount / maxAmount) * 4) + (amount > 0 ? 1 : 0)) : 0

            currentColumn.push({
                date: dateKey,
                amount,
                intensity,
                day: current.getDate(),
                month: current.getMonth(),
                dayOfWeek: current.getDay()
            })

            // End of week (Saturday), start new column
            if (current.getDay() === 6) {
                columns.push(currentColumn)
                currentColumn = []
            }

            current.setDate(current.getDate() + 1)
        }

        // Pad the last column
        if (currentColumn.length > 0) {
            while (currentColumn.length < 7) {
                currentColumn.push(null)
            }
            columns.push(currentColumn)
        }

        return { columns, maxAmount }
    }, [expenses, selectedYear])

    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    const days = ['일', '월', '화', '수', '목', '금', '토']

    // Calculate month label positions
    const monthPositions = useMemo(() => {
        const positions = []
        let lastMonth = -1

        calendarData.columns.forEach((col, colIdx) => {
            // Find first valid day in column
            const firstDay = col.find(d => d !== null)
            if (firstDay && firstDay.month !== lastMonth) {
                // Only add if this is the first day of the month
                if (firstDay.day <= 7) {
                    positions.push({ month: firstDay.month, colIndex: colIdx })
                    lastMonth = firstDay.month
                }
            }
        })

        return positions
    }, [calendarData.columns])

    return (
        <div className="heatmap-container" style={{ position: 'relative' }}>
            <div className="heatmap-header">
                <div className="heatmap-controls-wrapper">
                    <div className="heatmap-year-nav">
                        <button onClick={() => setSelectedYear(selectedYear - 1)}>&lt;</button>
                        <span className="current-year">{selectedYear}년</span>
                        <button onClick={() => setSelectedYear(selectedYear + 1)}>&gt;</button>
                    </div>
                </div>
                <div className="heatmap-legend">
                    <span className="legend-label">적음</span>
                    <div className="legend-cells">
                        <div className="legend-cell intensity-0" />
                        <div className="legend-cell intensity-1" />
                        <div className="legend-cell intensity-2" />
                        <div className="legend-cell intensity-3" />
                        <div className="legend-cell intensity-4" />
                    </div>
                    <span className="legend-label">많음</span>
                </div>
            </div>

            <div className="heatmap-wrapper">
                {/* Day labels (rows) */}
                <div className="heatmap-day-labels">
                    {days.map((day, i) => (
                        <div key={i} className="day-label">
                            {i % 2 === 1 ? day : ''}
                        </div>
                    ))}
                </div>

                <div className="heatmap-content">
                    {/* Month labels (positioned above columns) */}
                    <div className="heatmap-month-labels">
                        {monthPositions.map((pos, i) => (
                            <div
                                key={i}
                                className="heatmap-month-label"
                                style={{ left: `${pos.colIndex * 15}px` }}
                            >
                                {months[pos.month]}
                            </div>
                        ))}
                    </div>

                    {/* Heatmap grid - columns are weeks, rows are days of week */}
                    <div className="heatmap-grid" onMouseLeave={() => setHoverData(null)}>
                        {calendarData.columns.map((column, colIdx) => (
                            <div key={colIdx} className="heatmap-column">
                                {column.map((day, rowIdx) => (
                                    <div
                                        key={rowIdx}
                                        className={`heatmap-cell ${day ? `intensity-${day.intensity}` : 'empty'}`}
                                        onMouseEnter={(e) => {
                                            if (day) {
                                                // Robust rect calculation
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setHoverData({
                                                    date: day.date,
                                                    dayOfWeek: days[day.dayOfWeek],
                                                    amount: day.amount,
                                                    x: rect.left + rect.width / 2,
                                                    y: rect.top
                                                })
                                            } else {
                                                setHoverData(null)
                                            }
                                        }}
                                    // Removed title to avoid default tooltip
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floating Tooltip */}
            {hoverData && (
                <div style={{
                    position: 'fixed',
                    top: hoverData.y - 50, // Modified offset to be safe
                    left: hoverData.x,
                    transform: 'translateX(-50%)',
                    background: 'rgba(15, 23, 42, 0.95)', // Slightly darker
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    pointerEvents: 'none',
                    zIndex: 9999, // High z-index
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    lineHeight: 1.4
                }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{hoverData.date} ({hoverData.dayOfWeek})</div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                        {hoverData.amount > 0 ? `${hoverData.amount.toLocaleString()}원` : '지출 없음'}
                    </div>
                    {/* Tiny Triangle Pointer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-6px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 0,
                        height: 0,
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '6px solid rgba(15, 23, 42, 0.95)'
                    }} />
                </div>
            )}

            <style>{`
                .heatmap-controls-wrapper { display: flex; align-items: center; }
                .heatmap-year-nav { 
                    display: flex; align-items: center; gap: 8px; 
                    background: #f8fafc; padding: 4px 8px; border-radius: 8px; border: 1px solid #e2e8f0;
                }
                .heatmap-year-nav button {
                    background: white; border: 1px solid #cbd5e1; border-radius: 4px; 
                    width: 24px; height: 24px; cursor: pointer; color: #64748b; display: flex; align-items: center; justify-content: center;
                    transition: all 0.2s;
                }
                .heatmap-year-nav button:hover { border-color: #94a3b8; color: #1e293b; background: #f1f5f9; }
                .current-year { font-weight: 700; color: #334155; font-size: 0.9rem; }
            `}</style>
        </div>
    )
}
