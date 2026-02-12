import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '../utils/constants'
import { expenseService } from '../services/apiService'
import './SyncModal.css'

function SyncModal({ isOpen, onClose, onComplete }) {
    const [logs, setLogs] = useState([])
    const [phase, setPhase] = useState('select') // select, syncing, complete, error
    const [progress, setProgress] = useState({ current: 0, total: 0 })
    const [result, setResult] = useState({ count: 0, skipped: 0 })
    const [selectedDays, setSelectedDays] = useState(3) // Default: 3 days
    const [syncInfo, setSyncInfo] = useState({ last_sync_time: null, can_sync: true, cooldown_remaining: 0 })
    const [cooldownTimer, setCooldownTimer] = useState(0)
    const logsEndRef = useRef(null)
    const eventSourceRef = useRef(null)

    const dayOptions = [
        { value: 1, label: '오늘' },
        { value: 3, label: '3일' },
        { value: 7, label: '1주일' },
        { value: 14, label: '2주일' },
        { value: 30, label: '1개월' },
    ]

    // Fetch sync info when modal opens
    useEffect(() => {
        if (isOpen) {
            expenseService.syncInfo().then(info => {
                setSyncInfo(info)
                if (!info.can_sync) {
                    setCooldownTimer(info.cooldown_remaining)
                }
            }).catch(err => console.error(err))
        }
    }, [isOpen])

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldownTimer > 0) {
            const interval = setInterval(() => {
                setCooldownTimer(prev => {
                    if (prev <= 1) {
                        setSyncInfo(s => ({ ...s, can_sync: true }))
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [cooldownTimer])

    const formatLastSyncTime = (isoString) => {
        if (!isoString) return '없음'
        const date = new Date(isoString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return '방금 전'
        if (diffMins < 60) return `${diffMins}분 전`
        if (diffHours < 24) return `${diffHours}시간 전`
        return `${diffDays}일 전`
    }

    // Event listener for IPC progress
    useEffect(() => {
        if (window.electronAPI && phase === 'syncing') {
            const removeListener = window.electronAPI.sync.onProgress((data) => {
                handleSyncData(data);
            });
            return () => removeListener();
        }
    }, [phase]);

    // Cleanup on close
    useEffect(() => {
        if (!isOpen) {
            setPhase('select');
            setLogs([]);
            setProgress({ current: 0, total: 0 });
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        }
    }, [isOpen]);

    const handleSyncData = (data) => {
        // Add log entry
        setLogs(prev => [...prev, {
            id: Date.now() + Math.random(),
            type: data.type,
            message: data.message,
        }]);

        // Update progress based on type
        switch (data.type) {
            case 'status':
                if (data.step === 'found' && data.total) {
                    setProgress(prev => ({ ...prev, total: data.total }));
                }
                break;
            case 'analyzing':
            case 'saved':
            case 'duplicate':
            case 'skip':
                if (data.current) {
                    setProgress(prev => ({ ...prev, current: data.current }));
                }
                break;
            case 'complete':
                setPhase('complete');
                setResult({ count: data.count || 0, skipped: data.skipped || 0 });
                if (eventSourceRef.current) eventSourceRef.current.close();
                break;
            case 'error':
                setPhase('error');
                if (eventSourceRef.current) eventSourceRef.current.close();
                break;
            default:
                break;
        }
    };

    const handleCancel = async () => {
        if (window.electronAPI) {
            await window.electronAPI.sync.cancel();
            setPhase('error');
            setLogs(prev => [...prev, {
                id: Date.now(),
                type: 'error',
                message: '취소 요청 중...',
            }]);
        }
    };

    const startSync = async () => {
        setPhase('syncing');
        setLogs([]);
        setProgress({ current: 0, total: 0 });
        setResult({ count: 0, skipped: 0 });

        if (window.electronAPI) {
            // Electron IPC Mode
            try {
                await window.electronAPI.sync.gmail({ days: selectedDays });
            } catch (e) {
                setPhase('error');
                setLogs(prev => [...prev, {
                    id: Date.now(),
                    type: 'error',
                    message: `오류 발생: ${e.message}`,
                }]);
            }
        } else {
            // Web/SSE Mode
            const eventSource = new EventSource(`${API_URL}/sync/stream?days=${selectedDays}`);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleSyncData(data);
                } catch (e) {
                    console.error('SSE parse error:', e);
                }
            };

            eventSource.onerror = () => {
                setPhase('error');
                setLogs(prev => [...prev, {
                    id: Date.now(),
                    type: 'error',
                    message: '연결이 끊어졌습니다. 설정을 확인해주세요.',
                }]);
                eventSource.close();
            };
        }
    };

    // Auto-scroll to bottom
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    const handleClose = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close()
        }
        if (phase === 'complete') {
            onComplete?.()
        }
        onClose()
    }

    const progressPercent = progress.total > 0
        ? Math.round((progress.current / progress.total) * 100)
        : 0

    const getLogIcon = (type) => {
        switch (type) {
            case 'saved': return '✓'
            case 'duplicate': return '↻'
            case 'skip':
            case 'error': return '✗'
            case 'analyzing': return '◌'
            default: return '•'
        }
    }

    const getLogClass = (type) => {
        switch (type) {
            case 'saved': return 'log-success'
            case 'duplicate': return 'log-duplicate'
            case 'skip':
            case 'error': return 'log-error'
            case 'analyzing': return 'log-analyzing'
            default: return 'log-info'
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={(e) => e.target === e.currentTarget && phase !== 'syncing' && handleClose()}
            >
                <motion.div
                    className="modal-content sync-modal-content"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sync-header">
                        <h3>
                            {phase === 'select' && '📨 데이터 동기화'}
                            {phase === 'syncing' && '📨 동기화 진행 중'}
                            {phase === 'complete' && '✅ 동기화 완료'}
                            {phase === 'error' && '⚠️ 동기화 실패'}
                        </h3>
                        {phase === 'syncing' && progress.total > 0 && (
                            <span className="sync-counter">{progress.current} / {progress.total}</span>
                        )}
                    </div>

                    {/* Phase: Select Days */}
                    {phase === 'select' && (
                        <div className="sync-select-phase">
                            <p className="sync-description">
                                Gmail에서 결제 알림을 가져옵니다.<br />
                                불러올 기간을 선택하세요.
                            </p>

                            {/* Last Sync Info */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 12px',
                                background: '#f8fafc',
                                borderRadius: '8px',
                                marginBottom: '16px',
                                fontSize: '0.85rem',
                                color: '#64748b'
                            }}>
                                <span>⏱️ 마지막 동기화:</span>
                                <span style={{ fontWeight: 600, color: '#334155' }}>
                                    {formatLastSyncTime(syncInfo.last_sync_time)}
                                </span>
                            </div>

                            <div className="day-options">
                                {dayOptions.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`day-option ${selectedDays === opt.value ? 'active' : ''}`}
                                        onClick={() => setSelectedDays(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {!syncInfo.can_sync && cooldownTimer > 0 ? (
                                <p className="sync-hint" style={{ color: '#f59e0b' }}>
                                    ⏳ {cooldownTimer}초 후 다시 동기화할 수 있습니다
                                </p>
                            ) : (
                                <p className="sync-hint">
                                    💡 일반적으로 3일이면 충분합니다
                                </p>
                            )}
                        </div>
                    )}

                    {/* Phase: Syncing / Complete / Error */}
                    {phase !== 'select' && (
                        <>
                            {/* Progress Bar */}
                            {progress.total > 0 && (
                                <div className="sync-progress-track">
                                    <motion.div
                                        className="sync-progress-bar"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPercent}%` }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </div>
                            )}

                            {/* Log Area */}
                            <div className="sync-log-area">
                                {logs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        className={`sync-log-item ${getLogClass(log.type)}`}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <span className="log-icon">{getLogIcon(log.type)}</span>
                                        <span className="log-text">{log.message}</span>
                                    </motion.div>
                                ))}
                                {phase === 'syncing' && (
                                    <div className="sync-log-item log-loading">
                                        <span className="loading-dot"></span>
                                    </div>
                                )}
                                <div ref={logsEndRef} />
                            </div>

                            {/* Result Summary */}
                            {phase === 'complete' && (
                                <motion.div
                                    className="sync-result-summary"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="result-item success">
                                        <span className="result-number">{result.count}</span>
                                        <span className="result-label">새로 저장</span>
                                    </div>
                                    <div className="result-divider" />
                                    <div className="result-item">
                                        <span className="result-number">{result.skipped}</span>
                                        <span className="result-label">중복 건너뜀</span>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}

                    {/* Actions */}
                    <div className="modal-actions">
                        {phase === 'select' && (
                            <>
                                <button
                                    className="btn btn-primary"
                                    onClick={startSync}
                                    disabled={!syncInfo.can_sync && cooldownTimer > 0}
                                    style={(!syncInfo.can_sync && cooldownTimer > 0) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                                >
                                    {(!syncInfo.can_sync && cooldownTimer > 0) ? `${cooldownTimer}초 대기` : '동기화 시작'}
                                </button>
                                <button className="btn btn-secondary" onClick={handleClose}>
                                    취소
                                </button>
                            </>
                        )}
                        {phase === 'syncing' && (
                            <button className="btn btn-secondary" onClick={handleCancel}>
                                🙅 취소
                            </button>
                        )}
                        {(phase === 'complete' || phase === 'error') && (
                            <button className="btn btn-primary" onClick={handleClose}>
                                닫기
                            </button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default SyncModal
