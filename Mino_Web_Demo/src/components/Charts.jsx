/* eslint-disable react/prop-types */
import "./Charts.css"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts'

export function SpendingChart({ expenses, period, selectedDate, currentMonth }) {
    const targetDate = currentMonth ? new Date(currentMonth) : new Date()
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth() // 0-indexed

    const getChartData = () => {
        let data = []

        if (period === 'MONTHLY') {
            // Show Jan-Dec of targetYear (1-12)
            for (let m = 0; m < 12; m++) {
                const monthStr = `${targetYear}-${String(m + 1).padStart(2, '0')}`
                const monthExpenses = expenses.filter(e =>
                    e.transaction_date &&
                    e.transaction_date.startsWith(monthStr) &&
                    e.type === 'expense'
                )
                const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
                data.push({ name: `${m + 1}월`, 금액: total })
            }
        }
        else if (period === 'WEEKLY') {
            // Show weeks of targetMonth (Monday-based)
            const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate()
            const rawFirstDay = new Date(targetYear, targetMonth, 1).getDay() // 0=Sun, 6=Sat
            // Convert to Monday-based: Mon=0, Tue=1, ..., Sun=6
            const firstDayIndex = rawFirstDay === 0 ? 6 : rawFirstDay - 1
            const totalWeeks = Math.ceil((lastDay + firstDayIndex) / 7)

            // Initialize weeks
            for (let w = 1; w <= totalWeeks; w++) {
                data.push({ name: `${w}주`, 금액: 0 })
            }

            // Fill data
            expenses.forEach(e => {
                if (e.type !== 'expense' || !e.transaction_date) return
                const d = new Date(e.transaction_date)
                if (d.getFullYear() === targetYear && d.getMonth() === targetMonth) {
                    const day = d.getDate()
                    const w = Math.ceil((day + firstDayIndex) / 7)
                    if (data[w - 1]) {
                        data[w - 1].금액 += e.amount
                    }
                }
            })
        }
        else if (period === 'DAILY') {
            // Show selectedDate +/- 3 days, or default to targetMonth's start/today
            let centerDate = selectedDate ? new Date(selectedDate) : new Date()

            // If selectedDate is not in the target month (navigated away), reset center
            if (centerDate.getFullYear() !== targetYear || centerDate.getMonth() !== targetMonth) {
                const today = new Date()
                if (today.getFullYear() === targetYear && today.getMonth() === targetMonth) {
                    centerDate = today
                } else {
                    centerDate = new Date(targetYear, targetMonth, 1)
                }
            }

            for (let i = -3; i <= 3; i++) {
                const d = new Date(centerDate)
                d.setDate(d.getDate() + i)
                const dateStr = d.toISOString().slice(0, 10)

                const dayExpenses = expenses.filter(e =>
                    e.transaction_date &&
                    e.transaction_date.slice(0, 10) === dateStr &&
                    e.type === 'expense'
                )
                const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0)
                data.push({
                    name: `${d.getMonth() + 1}/${d.getDate()}`,
                    금액: total,
                    isTarget: i === 0 // Highlight center
                })
            }
        }
        return data
    }

    const chartData = getChartData()

    return (
        <div className="spending-chart">
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={180} debounce={50}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis
                        dataKey="name"
                        tick={({ x, y, payload, index }) => (
                            <text
                                x={x} y={y} dy={16}
                                textAnchor="middle"
                                fill={chartData[index] && chartData[index].isTarget ? "#ef4444" : "#666"}
                                fontSize={12}
                                fontWeight={chartData[index]?.isTarget ? 700 : 400}
                            >
                                {payload.value}
                            </text>
                        )}
                        interval={period === 'DAILY' ? 0 : 0}
                    />
                    <YAxis tick={{ fill: '#666', fontSize: 10 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip
                        formatter={(value) => [`${value.toLocaleString()}원`, '지출']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontSize: '0.8rem' }}
                    />
                    <Bar dataKey="금액" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill="#3b82f6"
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
