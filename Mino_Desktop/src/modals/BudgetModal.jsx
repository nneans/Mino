/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from 'react'
import "./Modals.css"
import "./BudgetModal.css"

export default function BudgetModal({ config, onClose, onSave }) {
    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(currentYear);
    const [isEditing, setIsEditing] = useState(false);

    // Local state for edits
    const [budgets, setBudgets] = useState({});

    // Ref for scrolling to current year
    const activeTabRef = useRef(null);

    useEffect(() => {
        if (config?.monthly_budgets) {
            setBudgets(config.monthly_budgets);
        }
    }, [config]);

    // Scroll active tab into view on mount or year change
    useEffect(() => {
        if (activeTabRef.current) {
            activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [year]);

    const getBudget = (m) => {
        const key = `${year}-${String(m).padStart(2, '0')}`;
        return budgets[key];
    };

    const handleInputChange = (m, value) => {
        // Remove commas for storage
        const numStr = value.replace(/,/g, '');
        if (isNaN(numStr)) return;

        const key = `${year}-${String(m).padStart(2, '0')}`;
        setBudgets(prev => ({
            ...prev,
            [key]: numStr === '' ? '' : parseInt(numStr)
        }));
    };

    const handleSubmit = () => {
        const cleaned = { ...budgets };
        Object.keys(cleaned).forEach(k => {
            if (cleaned[k] === '' || cleaned[k] === null || isNaN(cleaned[k])) {
                delete cleaned[k];
            }
        });

        onSave({
            ...config,
            monthly_budgets: cleaned
        });
        setIsEditing(false);
    };

    const globalBudget = config?.budget || 0;
    const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content budget-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>월별 목표 예산</h3>
                    <p className="modal-subtitle">각 월별로 다르게 예산을 설정하여 계획적인 소비를 관리하세요.</p>
                </div>

                <div className="year-tabs-scroll">
                    {years.map(y => (
                        <button
                            key={y}
                            ref={year === y ? activeTabRef : null}
                            className={`year-tab ${year === y ? 'active' : ''}`}
                            onClick={() => setYear(y)}
                        >
                            {y}년
                        </button>
                    ))}
                </div>

                <div className="month-grid">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                        const val = getBudget(m);
                        const isSet = val !== undefined && val !== '';
                        const displayVal = isSet ? Number(val).toLocaleString() : '';

                        return (
                            <div key={m} className={`month-card ${isSet ? 'set' : 'default'}`}>
                                <div className="month-label">{m}월</div>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={displayVal}
                                        placeholder={globalBudget.toLocaleString()}
                                        onChange={(e) => handleInputChange(m, e.target.value)}
                                        className="budget-input"
                                    />
                                ) : (
                                    <div className="budget-display">
                                        {isSet ? (
                                            <span className="val-custom">{Number(val).toLocaleString()}원</span>
                                        ) : (
                                            <span className="val-global">({globalBudget.toLocaleString()})</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                <div className="modal-actions-bar">
                    {isEditing ? (
                        <>
                            <button className="btn-save" onClick={handleSubmit}>저장하기</button>
                            <button className="btn-cancel" onClick={() => {
                                setIsEditing(false);
                                setBudgets(config?.monthly_budgets || {});
                            }}>취소</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-edit-mode" onClick={() => setIsEditing(true)}>수정하기</button>
                            <button className="btn-close" onClick={onClose}>닫기</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
