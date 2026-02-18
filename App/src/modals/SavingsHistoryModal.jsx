/* eslint-disable react/prop-types */
import './SavingsHistoryModal.css'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts'

export default function SavingsHistoryModal({ isOpen, onClose, goals, expenses = [] }) {
    const [selectedGoal, setSelectedGoal] = useState(null)
    const [stats, setStats] = useState({
        startDate: '',
        endDate: '',
        currentAmount: 0,
        targetAmount: 0,
        progress: 0
    })

    // Select the first goal by default
    useEffect(() => {
        if (isOpen && goals.length > 0 && !selectedGoal) {
            setSelectedGoal(goals[0])
        }
    }, [isOpen, goals])

    // Update Stats and Get Goal specific transactions
    useEffect(() => {
        if (!selectedGoal) return

        const current = selectedGoal.current_amount || 0
        const target = selectedGoal.target_amount || 1000000

        let startDate = ''
        if (selectedGoal.start_date) {
            startDate = selectedGoal.start_date.substring(0, 10).replace(/-/g, '.')
        } else if (selectedGoal.created_at) {
            startDate = selectedGoal.created_at.substring(0, 10).replace(/-/g, '.')
        } else {
            const now = new Date()
            startDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`
        }

        const now = new Date()
        const endDate = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`

        setStats({
            startDate,
            endDate,
            currentAmount: current,
            targetAmount: target,
            progress: target > 0 ? Math.round((current / target) * 100) : 0
        })

    }, [selectedGoal])

    // Filter transactions for this goal
    const goalTransactions = selectedGoal && expenses ? expenses.filter(e => e.goal_id === selectedGoal.id && e.type === 'saving').sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)) : []

    // Calculate manual/initial amount
    const trackedTotal = goalTransactions.reduce((sum, t) => sum + t.amount, 0)
    const manualAmount = (selectedGoal?.current_amount || 0) - trackedTotal

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
                    <motion.div
                        className="savings-modal-content"
                        onClick={e => e.stopPropagation()}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                    >
                        {/* Sidebar: Goal List */}
                        <div className="savings-sidebar">
                            <div className="savings-sidebar-header">
                                <h3>내 목표</h3>
                            </div>
                            <div className="savings-goal-list">
                                {goals.map(goal => {
                                    let dateStr = ''
                                    if (goal.start_date) {
                                        dateStr = goal.start_date.substring(0, 10).replace(/-/g, '.')
                                    } else if (goal.created_at) {
                                        dateStr = goal.created_at.substring(0, 10).replace(/-/g, '.')
                                    }

                                    return (
                                        <div
                                            key={goal.id}
                                            className={`savings-goal-item ${selectedGoal?.id === goal.id ? 'active' : ''}`}
                                            onClick={() => setSelectedGoal(goal)}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                <span className="sg-name" style={{ margin: 0 }}>{goal.name}</span>
                                                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>
                                                    {dateStr} ~
                                                </span>
                                            </div>
                                            <div className="sg-progress">
                                                <span>
                                                    {Math.round(((goal.current_amount || 0) / (goal.target_amount || 1)) * 100)}%
                                                </span>
                                                <span>
                                                    {(goal.target_amount || 0).toLocaleString()}원
                                                </span>
                                            </div>
                                            <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        background: selectedGoal?.id === goal.id ? '#3b82f6' : '#94a3b8',
                                                        width: `${Math.min(((goal.current_amount || 0) / (goal.target_amount || 1)) * 100, 100)}%`,
                                                        transition: 'width 0.3s ease'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="savings-main">
                            <div className="savings-main-header">
                                <div>
                                    <div className="sm-title" style={{ display: 'flex', alignItems: 'center' }}>
                                        <h2 style={{ margin: 0 }}>{selectedGoal?.name}</h2>
                                    </div>
                                    <div className="sm-period">
                                        {stats.startDate === stats.endDate ? stats.startDate : `${stats.startDate} ~ ${stats.endDate}`} {stats.progress >= 100 ? '(달성)' : '(진행중)'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <button className="sm-close-btn" onClick={onClose}>&times;</button>
                                </div>
                            </div>

                            {/* List Area */}
                            <div className="savings-list-area" style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
                                <h3 style={{ fontSize: '1rem', color: '#334155', marginBottom: '16px', marginTop: '10px' }}>저축 기록</h3>
                                {manualAmount > 0 && (
                                    <div className="savings-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>초기 잔액 / 수기 입력</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stats.startDate}</div>
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6' }}>
                                            +{manualAmount.toLocaleString()}원
                                        </div>
                                    </div>
                                )}
                                {goalTransactions.map(t => (
                                    <div key={t.id} className="savings-item" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '8px', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>{t.place || '저축'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.transaction_date.substring(0, 10).replace(/-/g, '.')}</div>
                                        </div>
                                        <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6' }}>
                                            +{t.amount.toLocaleString()}원
                                        </div>
                                    </div>
                                ))}
                                {manualAmount <= 0 && goalTransactions.length === 0 && (
                                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>
                                        저축 기록이 없습니다.
                                    </div>
                                )}
                            </div>

                            {/* Stats Row */}
                            <div className="savings-stats-row">
                                <div className="savings-stat-card">
                                    <span className="ssc-label">현재 저축액</span>
                                    <span className="ssc-value highlight">{stats.currentAmount.toLocaleString()}원</span>
                                </div>
                                <div className="savings-stat-card">
                                    <span className="ssc-label">목표 금액</span>
                                    <span className="ssc-value">{stats.targetAmount.toLocaleString()}원</span>
                                </div>
                                <div className="savings-stat-card">
                                    <span className="ssc-label">달성률</span>
                                    <span className="ssc-value" style={{ color: stats.progress >= 100 ? '#10b981' : '#3b82f6' }}>
                                        {stats.progress}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
