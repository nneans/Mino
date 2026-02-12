import { useState, useEffect } from 'react'
import { expenseService } from '../services/apiService'
import { EXPENSE_CATEGORIES } from '../utils/constants'

export default function RulesModal({ isOpen, onClose }) {
    const [rules, setRules] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editCategory, setEditCategory] = useState('')
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    const fetchRules = async () => {
        setLoading(true)
        try {
            const data = await expenseService.getRules()
            setRules(data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) fetchRules()
    }, [isOpen])

    const handleDeleteClick = (id) => {
        setConfirmDeleteId(id)
    }

    const handleConfirmDelete = async () => {
        if (confirmDeleteId) {
            await expenseService.deleteRule(confirmDeleteId)
            setConfirmDeleteId(null)
            fetchRules()
        }
    }

    const startEdit = (rule) => {
        setEditingId(rule.id)
        setEditCategory(rule.category)
    }

    const handleSaveEdit = async (rule) => {
        if (!editCategory) return
        await expenseService.addRule({
            place: rule.place_keyword,
            category: editCategory
        })
        setEditingId(null)
        fetchRules()
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>자동 분류 규칙 관리</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', opacity: 0.6 }}>×</button>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8' }}>로딩 중...</p>
                    ) : rules.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
                            아직 학습된 규칙이 없습니다.<br />
                            <small>지출 내역 수정 시 '학습하기'를 체크해보세요!</small>
                        </p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {rules.map(rule => (
                                <li key={rule.id} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderBottom: '1px solid #f1f5f9',
                                    fontSize: '0.9rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{rule.place_keyword}</div>
                                        {editingId === rule.id ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                                                <select
                                                    value={editCategory}
                                                    onChange={(e) => setEditCategory(e.target.value)}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #cbd5e1',
                                                        fontSize: '0.9rem',
                                                        width: '100%',
                                                        maxWidth: '180px',
                                                        backgroundColor: 'white'
                                                    }}
                                                >
                                                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                <button onClick={() => handleSaveEdit(rule)} style={{ padding: '6px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>저장</button>
                                                <button onClick={() => setEditingId(null)} style={{ padding: '6px 12px', background: '#94a3b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>취소</button>
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>➡ {rule.category}</div>
                                        )}
                                    </div>

                                    {editingId !== rule.id && (
                                        <div style={{ display: 'flex', gap: '6px' }}>
                                            <button
                                                onClick={() => startEdit(rule)}
                                                style={{
                                                    padding: '6px 10px',
                                                    fontSize: '0.8rem',
                                                    color: '#3b82f6',
                                                    background: '#eff6ff',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(rule.id)}
                                                style={{
                                                    padding: '6px 10px',
                                                    fontSize: '0.8rem',
                                                    color: '#ef4444',
                                                    background: '#fee2e2',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {confirmDeleteId && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.95)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: '12px',
                        backdropFilter: 'blur(2px)',
                        zIndex: 10
                    }}>
                        <div style={{
                            background: 'white',
                            padding: '24px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                            textAlign: 'center',
                            border: '1px solid #e2e8f0',
                            minWidth: '250px'
                        }}>
                            <h4 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b' }}>정말 이 규칙을 삭제할까요?</h4>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button
                                    onClick={handleConfirmDelete}
                                    style={{ padding: '8px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    삭제
                                </button>
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    style={{ padding: '8px 20px', background: '#e2e8f0', color: '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
