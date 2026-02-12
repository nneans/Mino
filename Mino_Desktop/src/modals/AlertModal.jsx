/* eslint-disable react/prop-types */
import './Modals.css'
import { useEffect, useRef } from 'react'

export default function AlertModal({
    isOpen, onClose, title, message, onConfirm, type = 'confirm'
}) {
    const confirmBtnRef = useRef(null)

    // Focus on confirm button when modal opens
    useEffect(() => {
        if (isOpen && confirmBtnRef.current) {
            confirmBtnRef.current.focus()
        }
    }, [isOpen])

    // Handle keyboard events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (type === 'confirm' && onConfirm) {
                onConfirm()
                onClose()
            } else {
                onClose()
            }
        } else if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
            <div className="modal-content" style={{ maxWidth: '360px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '12px' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {message}
                </p>
                <div className="modal-actions" style={{ justifyContent: 'center' }}>
                    {type === 'confirm' ? (
                        <>
                            <button ref={confirmBtnRef} type="button" className="btn btn-primary" onClick={() => { onConfirm(); onClose(); }}>확인</button>
                            <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                        </>
                    ) : (
                        <button ref={confirmBtnRef} type="button" className="btn btn-primary" onClick={onClose}>확인</button>
                    )}
                </div>
            </div>
        </div>
    )
}
