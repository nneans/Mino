import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Styles are assumed to be available in common.css or similar

export default function GoalModal({ isOpen, onClose, onSave, onDelete, goal }) {
    const [form, setForm] = useState({ name: '', target_amount: '', current_amount: '', start_date: '', icon: '💰', deadline: '' })

    useEffect(() => {
        if (goal) {
            setForm({
                ...goal,
                target_amount: goal.target_amount || '',
                current_amount: goal.current_amount || '',
                start_date: goal.start_date ? goal.start_date.split('T')[0] : ''
            })
        } else {
            setForm({
                name: '',
                target_amount: '',
                current_amount: '',
                start_date: new Date().toISOString().slice(0, 10),
                icon: '💰',
                deadline: ''
            })
        }
    }, [goal, isOpen])

    if (!isOpen) return null

    const handleSubmit = () => {
        if (!form.name || !form.target_amount) return alert('이름과 목표 금액을 입력해주세요.')
        onSave({
            ...form,
            target_amount: parseInt(form.target_amount),
            current_amount: parseInt(form.current_amount || 0)
        })
    }

    const handleDelete = () => {
        if (window.confirm('정말 이 목표를 삭제하시겠습니까?')) {
            onDelete(goal.id)
        }
    }

    return (
        <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: 'white', padding: '24px', borderRadius: '16px',
                    width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
            >
                <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>{goal ? '목표 수정' : '새 목표 추가'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>목표 이름</label>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="예: 일본 여행"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>목표 금액 (원)</label>
                        <input
                            type="text"
                            value={form.target_amount ? form.target_amount.toLocaleString() : ''}
                            onChange={e => {
                                const val = e.target.value.replace(/,/g, '')
                                if (!isNaN(val)) {
                                    setForm({ ...form, target_amount: Number(val) })
                                }
                            }}
                            placeholder="1,000,000"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>현재 모은 금액 (원)</label>
                        <input
                            type="text"
                            value={form.current_amount ? form.current_amount.toLocaleString() : ''}
                            onChange={e => {
                                const val = e.target.value.replace(/,/g, '')
                                if (!isNaN(val)) {
                                    setForm({ ...form, current_amount: Number(val) })
                                }
                            }}
                            placeholder="0"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        />
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>시작 날짜</label>
                        <input
                            type="date"
                            value={form.start_date}
                            onChange={e => setForm({ ...form, start_date: e.target.value })}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                        />
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {goal && (
                        <button
                            type="button"
                            className="btn-danger"
                            onClick={handleDelete}
                            style={{ marginRight: 'auto', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                        >
                            삭제
                        </button>
                    )}
                    <button className="btn-primary" onClick={handleSubmit} style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#6366f1', color: 'white', fontWeight: 600, cursor: 'pointer' }}>저장하기</button>
                    <button className="btn-secondary" onClick={onClose} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>취소</button>
                </div>
            </motion.div >
        </div >
    )
}
