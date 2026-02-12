/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react'
import "./Modals.css"

export default function FixedExpenseModal({ config, onClose, onSave }) {
    const [items, setItems] = useState([])

    // Tab State
    const [activeTab, setActiveTab] = useState('expense') // 'expense' | 'income'

    // Form State
    const [editingId, setEditingId] = useState(null)
    const [newDay, setNewDay] = useState(1)
    const [newName, setNewName] = useState('')
    const [newAmount, setNewAmount] = useState('')

    useEffect(() => {
        if (config && config.fixed_expenses) {
            const loaded = config.fixed_expenses.map(i => ({ ...i, type: i.type || 'expense' }))
            setItems(loaded)
        }
    }, [config])

    // Load item into form for editing
    const handleEditClick = (item) => {
        setEditingId(item.id)
        setNewDay(item.day)
        setNewName(item.name)
        setNewAmount(item.amount || '')
        setActiveTab(item.type) // Switch tab if needed
    }

    const handleAddItem = () => {
        if (!newName.trim()) return

        if (editingId) {
            // Update existing
            setItems(items.map(i => i.id === editingId ? {
                ...i,
                day: newDay,
                name: newName,
                amount: newAmount ? parseInt(newAmount) : null,
                type: activeTab
            } : i))
            setEditingId(null)
        } else {
            // Add new
            const item = {
                id: Date.now(),
                day: newDay,
                name: newName,
                amount: newAmount ? parseInt(newAmount) : null,
                type: activeTab
            }
            setItems([...items, item])
        }

        // Reset form (keep day? or reset? reset for clarity)
        setNewName('')
        setNewAmount('')
        setEditingId(null)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setNewName('')
        setNewAmount('')
        setNewDay(1)
    }

    const handleDeleteItem = (id, e) => {
        e.stopPropagation() // Prevent triggering edit
        setItems(items.filter(i => i.id !== id))
        if (editingId === id) handleCancelEdit()
    }

    const handleSave = () => {
        const totalFixedBudget = items
            .filter(i => i.type !== 'income')
            .reduce((sum, i) => sum + (i.amount || 0), 0)

        onSave({
            ...config,
            fixed_expenses: items,
            fixed_budget: totalFixedBudget
        })
    }

    const currentItems = items.filter(i => i.type === activeTab).sort((a, b) => a.day - b.day)
    const days = Array.from({ length: 31 }, (_, i) => i + 1)

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content fixed-modal" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">고정 비용 값 수정</h3>

                <div className="type-toggle">
                    <button
                        className={`type-btn ${activeTab === 'expense' ? 'active expense' : ''}`}
                        onClick={() => { setActiveTab('expense'); handleCancelEdit(); }}
                    >
                        지출
                    </button>
                    <button
                        className={`type-btn ${activeTab === 'income' ? 'active income' : ''}`}
                        onClick={() => { setActiveTab('income'); handleCancelEdit(); }}
                    >
                        수입
                    </button>
                </div>

                <div className="list-section">
                    <div className="section-label">
                        {activeTab === 'expense' ? '고정 지출' : '고정 수입'} 목록 (클릭하여 수정)
                    </div>
                    <div className="item-list">
                        {currentItems.length > 0 ? (
                            currentItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`item-card ${editingId === item.id ? 'editing' : ''}`}
                                    onClick={() => handleEditClick(item)}
                                >
                                    <div className="card-left">
                                        <div className="day-badge">{item.day}일</div>
                                        <div className="item-name">{item.name}</div>
                                    </div>
                                    <div className="card-right">
                                        <div className={`item-amount ${item.type}`}>
                                            {item.amount ? item.amount.toLocaleString() + '원' : '변동'}
                                        </div>
                                        <button onClick={(e) => handleDeleteItem(item.id, e)} className="btn-delete">×</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                등록된 항목이 없습니다.
                            </div>
                        )}
                    </div>
                </div>

                <div className="add-section">
                    <div className="section-label">
                        {editingId ? '항목 수정' : '새 항목 추가'}
                    </div>
                    <div className={`add-form ${editingId ? 'edit-mode' : ''}`}>
                        <div className="form-row">
                            <div className="input-field day-field">
                                <label>일자</label>
                                <select value={newDay} onChange={e => setNewDay(Number(e.target.value))}>
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="input-field name-field">
                                <label>내용</label>
                                <input
                                    type="text"
                                    placeholder="예: 월세, 급여"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="input-field amount-field">
                                <label>금액</label>
                                <input
                                    type="number"
                                    placeholder="0 (변동 시 비움)"
                                    value={newAmount}
                                    onChange={e => setNewAmount(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                {editingId && (
                                    <button onClick={handleCancelEdit} className="btn-cancel-edit">취소</button>
                                )}
                                <button onClick={handleAddItem} className={`btn-add ${editingId ? 'update' : ''}`}>
                                    {editingId ? '수정' : '추가'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button className="btn-save" onClick={handleSave}>저장하기</button>
                    <button className="btn-cancel" onClick={onClose}>취소</button>
                </div>
            </div>
            <style>{`
                .fixed-modal { width: 480px; max-width: 90vw; padding: 24px; border-radius: 20px; font-family: 'Inter', sans-serif; background: #fff; }
                .modal-title { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0 0 20px 0; }
                
                .type-toggle { display: flex; background: #f1f5f9; padding: 4px; border-radius: 12px; margin-bottom: 24px; }
                .type-btn { flex: 1; border: none; background: transparent; padding: 10px; border-radius: 8px; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .type-btn.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .type-btn.active.expense { color: #ef4444; }
                .type-btn.active.income { color: #3b82f6; }

                .section-label { font-size: 0.85rem; font-weight: 600; color: #64748b; margin-bottom: 8px; }
                
                .item-list { 
                    max-height: 200px; overflow-y: auto; background: #f8fafc; border-radius: 12px; padding: 8px; margin-bottom: 24px; border: 1px solid #e2e8f0;
                }
                .item-card {
                    display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 10px 12px; border-radius: 8px; margin-bottom: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s;
                }
                .item-card:hover { border-color: #cbd5e1; transform: translateY(-1px); }
                .item-card.editing { border: 2px solid #3b82f6; background: #eff6ff; }
                .item-card:last-child { margin-bottom: 0; }
                
                .card-left { display: flex; align-items: center; gap: 10px; }
                .day-badge { background: #e2e8f0; color: #475569; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
                .item-name { font-size: 0.9rem; font-weight: 500; color: #334155; }
                
                .card-right { display: flex; align-items: center; gap: 10px; }
                .item-amount { font-weight: 600; font-size: 0.9rem; }
                .item-amount.expense { color: #ef4444; }
                .item-amount.income { color: #3b82f6; }
                
                .btn-delete { background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer; padding: 0 4px; line-height: 1; }
                .btn-delete:hover { color: #ef4444; }
                .empty-state { text-align: center; padding: 20px; color: #94a3b8; font-size: 0.85rem; }

                .add-section { margin-bottom: 24px; }
                .add-form { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; transition: all 0.2s; }
                .add-form.edit-mode { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1); }
                
                .form-row { display: flex; gap: 12px; margin-bottom: 12px; }
                .form-row:last-child { margin-bottom: 0; }
                
                .input-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
                .input-field label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
                .input-field input, .input-field select {
                    padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s;
                }
                .input-field input:focus, .input-field select:focus { border-color: #3b82f6; }
                
                .day-field { flex: 1; }
                .name-field { flex: 1; }
                .amount-field { flex: 1; }
                
                .btn-add {
                    align-self: flex-end; padding: 8px 20px; height: 38px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                }
                .btn-add:hover { background: #2563eb; }
                .btn-add.update { background: #10b981; }
                .btn-add.update:hover { background: #059669; }
                
                .btn-cancel-edit {
                    align-self: flex-end; padding: 8px 12px; height: 38px; background: #f1f5f9; color: #64748b; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
                }

                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; }
                .btn-cancel { padding: 10px 20px; border: none; background: #f1f5f9; color: #64748b; font-weight: 600; border-radius: 10px; cursor: pointer; }
                .btn-save { padding: 10px 24px; border: none; background: #1e293b; color: white; font-weight: 600; border-radius: 10px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            `}</style>
        </div>
    )
}
