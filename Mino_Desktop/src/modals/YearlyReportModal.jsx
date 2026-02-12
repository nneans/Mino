/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Modals.css'

export default function YearlyReportModal({ isOpen, onClose, expenses, config }) {
    const [year, setYear] = useState(new Date().getFullYear())

    const monthlyStats = useMemo(() => {
        const stats = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            income: 0,
            expense: 0
        }))

        expenses.forEach(e => {
            const d = new Date(e.transaction_date)
            if (d.getFullYear() === year) {
                const m = d.getMonth()
                if (e.type === 'income') stats[m].income += e.amount
                else stats[m].expense += e.amount
            }
        })
        return stats
    }, [expenses, year])

    const maxVal = Math.max(...monthlyStats.map(s => Math.max(s.income, s.expense)))

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="modal-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
                <motion.div
                    className="modal-content"
                    onClick={e => e.stopPropagation()}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: 'white',
                        padding: '0', // Removing default padding for header implementation
                        borderRadius: '16px',
                        maxWidth: '800px',
                        width: '90%',
                        height: '80vh', // Fixed height for scrolling
                        maxHeight: '800px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden'
                    }}
                >
                    {/* Header - Fixed */}
                    <div className="modal-header-fixed">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>연간 리포트</h2>
                            <div className="year-nav-custom">
                                <button onClick={() => setYear(year - 1)}>&lt;</button>
                                <span>{year}년</span>
                                <button onClick={() => setYear(year + 1)}>&gt;</button>
                            </div>
                        </div>
                        <button onClick={onClose} className="btn-close-custom">✕</button>
                    </div>

                    {/* Body - Scrollable */}
                    <div className="modal-body-scrollable">
                        {/* 1. Bar Chart */}
                        <div className="yearly-chart">
                            {monthlyStats.map(stat => (
                                <div key={stat.month} className="chart-col">
                                    <div className="bars">
                                        {/* Income Bar */}
                                        <div
                                            className="bar income"
                                            style={{
                                                height: `${maxVal > 0 ? (stat.income / maxVal) * 100 : 0}%`,
                                                minHeight: stat.income > 0 ? '4px' : '0'
                                            }}
                                            title={`수입: ${stat.income.toLocaleString()}`}
                                        />
                                        {/* Expense Bar */}
                                        <div
                                            className="bar expense"
                                            style={{
                                                height: `${maxVal > 0 ? (stat.expense / maxVal) * 100 : 0}%`,
                                                minHeight: stat.expense > 0 ? '4px' : '0'
                                            }}
                                            title={`지출: ${stat.expense.toLocaleString()}`}
                                        />
                                    </div>
                                    <span className="month-label">{stat.month}월</span>
                                </div>
                            ))}
                        </div>

                        {/* 2. Table */}
                        <div className="yearly-table-wrapper">
                            <table className="yearly-table">
                                <thead>
                                    <tr>
                                        <th>월</th>
                                        <th className="align-right">수입</th>
                                        <th className="align-right">지출</th>
                                        <th className="align-right">순이익</th>
                                        {config?.budget > 0 && <th className="align-right">예산 사용</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyStats.map(stat => (
                                        <tr key={stat.month}>
                                            <td style={{ fontWeight: '500' }}>{stat.month}월</td>
                                            <td className={`align-right ${stat.income > 0 ? 'text-success' : 'text-muted'}`}>
                                                {stat.income.toLocaleString()}
                                            </td>
                                            <td className={`align-right ${stat.expense > 0 ? 'text-dark' : 'text-muted'}`}>
                                                {stat.expense.toLocaleString()}
                                            </td>
                                            <td className={`align-right val-bold ${stat.income - stat.expense >= 0 ? 'text-blue' : 'text-danger'}`}>
                                                {(stat.income - stat.expense).toLocaleString()}
                                            </td>
                                            {config?.budget > 0 && (
                                                <td className="align-right small-text">
                                                    {stat.expense > 0
                                                        ? <span className={`budget-badge ${stat.expense > config.budget ? 'over' : ''}`}>
                                                            {Math.round((stat.expense / config.budget) * 100)}%
                                                        </span>
                                                        : '-'
                                                    }
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {/* Total Row */}
                                    <tr className="total-row">
                                        <td>합계</td>
                                        <td className="align-right text-success">
                                            {monthlyStats.reduce((a, b) => a + b.income, 0).toLocaleString()}
                                        </td>
                                        <td className="align-right text-danger">
                                            {monthlyStats.reduce((a, b) => a + b.expense, 0).toLocaleString()}
                                        </td>
                                        <td className="align-right">
                                            {(monthlyStats.reduce((a, b) => a + b.income, 0) - monthlyStats.reduce((a, b) => a + b.expense, 0)).toLocaleString()}
                                        </td>
                                        {config?.budget > 0 && <td></td>}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
                <style>{`
                    .modal-header-fixed {
                        display: flex; justify-content: space-between; align-items: center;
                        padding: 24px; border-bottom: 1px solid #e2e8f0; background: white; z-index: 10;
                    }
                    .modal-body-scrollable {
                        padding: 24px; overflow-y: auto; flex: 1;
                    }
                    .year-nav-custom { 
                        display: flex; align-items: center; 
                        background: #f1f5f9; padding: 4px; border-radius: 8px; 
                    }
                    .year-nav-custom button { 
                        background: white; border: 1px solid #e2e8f0; font-size: 0.9rem; cursor: pointer; color: #64748b; 
                        width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 6px;
                        transition: all 0.2s;
                    }
                    .year-nav-custom button:hover { border-color: #cbd5e1; color: #1e293b; background: #f8fafc; }
                    .year-nav-custom span { padding: 0 12px; font-weight: 600; font-size: 0.95rem; color: #334155; }
                    
                    .btn-close-custom { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8; transition: color 0.2s; }
                    .btn-close-custom:hover { color: #1e293b; }

                    .yearly-chart { 
                        display: flex; 
                        align-items: flex-end; 
                        justify-content: space-around;
                        height: 160px; 
                        margin-bottom: 24px; 
                        padding: 0 4px 8px 4px;
                        border-bottom: 1px solid #e2e8f0; 
                    }
                    .chart-col { 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: flex-end;
                        flex: 1;
                    }
                    .bars { 
                        display: flex; 
                        justify-content: center;
                        gap: 2px; 
                        align-items: flex-end; 
                        height: 110px; 
                        width: 100%;
                        margin-bottom: 6px;
                    }
                    .bar { 
                        width: 8px; 
                        border-radius: 2px 2px 0 0; 
                        transition: height 0.5s; 
                    }
                    .bar.income { background: #10b981; }
                    .bar.expense { background: #ef4444; }
                    .month-label { 
                        font-size: 0.7rem; 
                        color: #64748b; 
                        font-weight: 500;
                        text-align: center;
                    }

                    .yearly-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                    .yearly-table th { padding: 12px 8px; text-align: left; color: #64748b; border-bottom: 2px solid #e2e8f0; font-weight: 600; }
                    .yearly-table td { padding: 12px 8px; border-bottom: 1px solid #f1f5f9; }
                    .align-right { text-align: right; }
                    .text-success { color: #10b981; }
                    .text-danger { color: #ef4444; }
                    .text-muted { color: #cbd5e1; }
                    .text-dark { color: #334155; }
                    .text-blue { color: #3b82f6; }
                    .val-bold { font-weight: 700; }
                    .small-text { font-size: 0.85rem; }
                    .budget-badge { padding: 2px 6px; border-radius: 4px; background: #f1f5f9; color: #64748b; }
                    .budget-badge.over { background: #fee2e2; color: #ef4444; }
                    .total-row { background: #f8fafc; font-weight: bold; }
                    .total-row td { border-bottom: none; }
                `}</style>
            </div>
        </AnimatePresence>
    )
}
