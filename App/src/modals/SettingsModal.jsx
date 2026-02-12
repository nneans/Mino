import "./Modals.css"
import { useState, useEffect } from 'react'
import { usageService, configService } from '../services/apiService'
import AlertModal from './AlertModal'

export default function SettingsModal({
    isOpen, onClose, config, setConfig, onSave, onResetRequest, onReturnToOnboarding, mode = 'simple'
}) {
    const [usage, setUsage] = useState({ llm: 0, kakao: 0 })
    const [errors, setErrors] = useState({})
    const [ollamaStatus, setOllamaStatus] = useState({
        running: false,
        loading: true
    })
    const [ollamaModels, setOllamaModels] = useState([])
    const [downloadingModel, setDownloadingModel] = useState(null)
    const [downloadingProgress, setDownloadingProgress] = useState(0)

    // Alert Modal State
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert', // alert | confirm
        onConfirm: null
    })

    useEffect(() => {
        if (isOpen) {
            usageService.get().then(setUsage).catch(err => console.error('Failed to fetch usage:', err))
            if (mode === 'full') validateAll()

            // Check Ollama status when modal opens
            configService.ollamaStatus()
                .then(status => setOllamaStatus({ ...status, loading: false }))
                .catch(() => setOllamaStatus({ running: false, loading: false }))

            // Load available models
            configService.ollamaModels()
                .then(res => setOllamaModels(res.models || []))
                .catch(() => setOllamaModels([]))
        }
    }, [isOpen])

    const showAlert = (message, title = '알림') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type: 'alert',
            onConfirm: null
        })
    }

    const showConfirm = (message, onConfirm, title = '확인') => {
        setAlertConfig({
            isOpen: true,
            title,
            message,
            type: 'confirm',
            onConfirm
        })
    }

    const closeAlert = () => {
        setAlertConfig(prev => ({ ...prev, isOpen: false }))
    }

    // Validate all fields (for full mode)
    const validateAll = () => {
        const newErrors = {}

        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
        if (config.gmail_user && !gmailRegex.test(config.gmail_user)) {
            newErrors.gmail = '@gmail.com 형식이어야 합니다'
        }

        const appPassClean = (config.gmail_app_pass || '').replace(/\s/g, '')
        if (config.gmail_app_pass && appPassClean.length > 0 && appPassClean.length !== 16) {
            newErrors.appPass = `${appPassClean.length}/16자`
        }

        const provider = config.api_keys?.[0]?.provider || 'gemini'
        const apiKey = config.api_keys?.[0]?.key || ''
        const apiKeyMinLengths = { gemini: 39, openai: 40, deepseek: 32, groq: 50, claude: 100, ollama: 0 }
        const minLen = apiKeyMinLengths[provider] || 10
        if (apiKey && provider !== 'ollama' && apiKey.length < minLen) {
            newErrors.apiKey = `최소 ${minLen}자 필요 (현재 ${apiKey.length}자)`
        }

        if (config.kakao_api_key && config.kakao_api_key.length > 0 && config.kakao_api_key.length !== 32) {
            newErrors.kakao = `32자 필요 (현재 ${config.kakao_api_key.length}자)`
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    useEffect(() => {
        if (isOpen && mode === 'full') validateAll()
    }, [config])

    const canSave = () => Object.keys(errors).length === 0

    if (!isOpen) return null

    const LLM_QUOTA = 1500
    const KAKAO_QUOTA = 5000
    const llmPercent = Math.min(100, Math.round((usage.llm / LLM_QUOTA) * 100))
    const kakaoPercent = Math.min(100, Math.round((usage.kakao / KAKAO_QUOTA) * 100))

    const hasGmail = config.gmail_user && config.gmail_app_pass
    const hasLLM = config.api_keys?.[0]?.key
    const hasKakao = config.kakao_api_key

    const renderContent = () => {
        // ========== SIMPLE MODE (Main App Settings) ==========
        if (mode === 'simple') {
            return (
                <>
                    <div className="settings-header-nav">
                        <h3>설정</h3>
                    </div>

                    <div className="settings-scroll-area">
                        <div className="settings-section">
                            <h4>연결 상태</h4>
                            <div className="connection-status-list">
                                <div className={`connection-status-item ${hasGmail ? 'connected' : 'disconnected'}`}>
                                    <span className="status-icon">{hasGmail ? '✅' : '❌'}</span>
                                    <div className="status-text-wrap">
                                        <span className="status-label">Gmail 연동</span>
                                        {hasGmail && <span className="status-sub">{config.gmail_user}</span>}
                                    </div>
                                </div>
                                <div className={`connection-status-item ${hasLLM || config.api_keys?.[0]?.provider === 'ollama' ? 'connected' : 'disconnected'}`}>
                                    <span className="status-icon">{(hasLLM || config.api_keys?.[0]?.provider === 'ollama') ? '✅' : '❌'}</span>
                                    <div className="status-text-wrap">
                                        <span className="status-label">LLM API</span>
                                        <span className="status-sub">
                                            {config.api_keys?.[0]?.provider === 'ollama'
                                                ? `Ollama (${config.ollama_model || 'Unknown'})`
                                                : config.api_keys?.[0]?.provider || '미설정'}
                                        </span>
                                    </div>
                                </div>
                                <div className={`connection-status-item ${hasKakao ? 'connected' : 'disconnected'}`}>
                                    <span className="status-icon">{hasKakao ? '✅' : '❌'}</span>
                                    <div className="status-text-wrap">
                                        <span className="status-label">Kakao Map API</span>
                                        {hasKakao && <span className="status-sub">연동됨</span>}
                                    </div>
                                </div>
                            </div>
                            <p className="settings-hint">
                                API를 등록하거나 변경하려면 "초기 화면으로" 버튼을 눌러주세요.
                            </p>
                        </div>

                        <div className="settings-section">
                            <h4>API 사용량</h4>
                            <div className="usage-item">
                                <div className="usage-info">
                                    <span>Cloud LLM Usage</span>
                                    {config.api_keys?.[0]?.provider === 'ollama' ? (
                                        <span style={{ color: '#10b981' }}>Local (Unlimited)</span>
                                    ) : (
                                        <span>{usage.llm} / {LLM_QUOTA}</span>
                                    )}
                                </div>
                                {config.api_keys?.[0]?.provider !== 'ollama' && (
                                    <div className="usage-bar-track">
                                        <div className="usage-bar-fill" style={{ width: `${llmPercent}%`, background: llmPercent > 80 ? '#ef4444' : 'var(--primary)' }} />
                                    </div>
                                )}
                            </div>
                            <div className="usage-item" style={{ marginTop: '12px' }}>
                                <div className="usage-info">
                                    <span>Kakao Map API</span>
                                    <span>{usage.kakao} / {KAKAO_QUOTA}</span>
                                </div>
                                <div className="usage-bar-track">
                                    <div className="usage-bar-fill" style={{ width: `${kakaoPercent}%`, background: kakaoPercent > 80 ? '#ef4444' : '#10b981' }} />
                                </div>
                            </div>
                        </div>

                        <div className="settings-section">
                            <h4>설정 관리</h4>
                            <div className="settings-actions">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => { onReturnToOnboarding && onReturnToOnboarding(); onClose(); }}
                                >
                                    🏠 초기 화면으로 돌아가기
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger-outline"
                                    onClick={() => onResetRequest && onResetRequest()}
                                >
                                    🔄 모든 설정 초기화
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>닫기</button>
                    </div>
                </>
            )
        }

        // ========== FULL MODE (Onboarding Settings) ==========
        return (
            <>
                <div className="settings-header-nav">
                    <h3>설정</h3>
                </div>

                <div className="settings-scroll-area">
                    <div className="settings-section">
                        <h4>Gmail 연동</h4>
                        <div className="form-group">
                            <label>Gmail 주소</label>
                            <input
                                type="email"
                                placeholder="example@gmail.com"
                                value={config.gmail_user || ''}
                                onChange={e => setConfig({ ...config, gmail_user: e.target.value })}
                                className={errors.gmail ? 'input-error' : ''}
                            />
                            {errors.gmail && <span className="error-text">{errors.gmail}</span>}
                        </div>
                        <div className="form-group">
                            <label>앱 비밀번호 (공백 제외 16자리)</label>
                            <input
                                type="password"
                                placeholder="xxxx xxxx xxxx xxxx"
                                value={config.gmail_app_pass || ''}
                                onChange={e => setConfig({ ...config, gmail_app_pass: e.target.value })}
                                className={errors.appPass ? 'input-error' : ''}
                            />
                            {errors.appPass && <span className="error-text">{errors.appPass}</span>}
                            <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="help-link">
                                👉 앱 비밀번호 발급받기
                            </a>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h4>LLM 설정</h4>
                        <div className="form-group">
                            <label>모델 선택</label>
                            <select
                                value={config.api_keys?.[0]?.provider || 'ollama'}
                                onChange={e => {
                                    const newKeys = [{ provider: e.target.value, key: config.api_keys?.[0]?.key || '' }]
                                    setConfig({ ...config, api_keys: newKeys })
                                }}
                            >
                                <option value="ollama">🖥️ Ollama (로컬 - 무료)</option>
                                <option value="gemini">☁️ Google Gemini</option>
                                <option value="openai">☁️ OpenAI GPT</option>
                                <option value="deepseek">☁️ Deepseek</option>
                                <option value="groq">☁️ Groq</option>
                                <option value="claude">☁️ Anthropic Claude</option>
                            </select>
                        </div>

                        {(config.api_keys?.[0]?.provider || 'ollama') === 'ollama' ? (
                            <div className="ollama-section">
                                {/* Ollama 실행 상태 & 제어 */}
                                <div className="ollama-control-header">
                                    <div
                                        className={`ollama-status-badge ${ollamaStatus.running ? 'running' : 'stopped'}`}
                                        style={{ width: '100%' }}
                                    >
                                        {ollamaStatus.loading ? '확인 중...' : (
                                            ollamaStatus.running ? '✅ Ollama 실행 중' : '⚠️ Ollama 미실행'
                                        )}
                                    </div>
                                </div>

                                {ollamaStatus.running ? (
                                    <div className="ollama-action-buttons" style={{ marginBottom: '16px' }}>
                                        <button
                                            className="btn btn-danger-outline ollama-btn"
                                            onClick={() => {
                                                showConfirm('Ollama 서버를 종료하시겠습니까?', async () => {
                                                    try {
                                                        await configService.ollamaStop()
                                                        setOllamaStatus({ ...ollamaStatus, running: false })
                                                    } catch (e) {
                                                        showAlert('종료 실패: ' + e.message, '오류')
                                                    }
                                                })
                                            }}
                                        >
                                            ⏹️ 실행 중지
                                        </button>
                                    </div>
                                ) : (
                                    /* Ollama 미실행 시 버튼들 */
                                    !ollamaStatus.loading && (
                                        <div className="ollama-action-buttons">
                                            <button
                                                className="btn btn-primary ollama-btn"
                                                onClick={async () => {
                                                    try {
                                                        const res = await configService.ollamaInstall()
                                                        showAlert(res.message || 'Ollama 설치 요청됨', '알림')
                                                        configService.ollamaStatus()
                                                            .then(status => setOllamaStatus({ ...status, loading: false }))
                                                    } catch (e) {
                                                        showAlert('설치 실패: ' + e.message, '오류')
                                                    }
                                                }}
                                            >
                                                📥 Ollama 설치
                                            </button>
                                            <button
                                                className="btn btn-secondary ollama-btn"
                                                onClick={async () => {
                                                    try {
                                                        const res = await configService.ollamaStart()
                                                        showAlert(res.message || 'Ollama 시작됨', '알림')
                                                        setTimeout(() => {
                                                            configService.ollamaStatus()
                                                                .then(status => setOllamaStatus({ ...status, loading: false }))
                                                            configService.ollamaModels()
                                                                .then(res => setOllamaModels(res.models || []))
                                                        }, 2000)
                                                    } catch (e) {
                                                        showAlert('시작 실패: ' + e.message, '오류')
                                                    }
                                                }}
                                            >
                                                ▶️ Ollama 실행
                                            </button>
                                        </div>
                                    )
                                )}

                                {/* 모델 목록 - 드롭다운 스타일 */}
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label>AI 모델 선택</label>
                                    <select
                                        className="model-select"
                                        value={config.ollama_model || 'qwen2.5:3b'}
                                        onChange={e => setConfig({ ...config, ollama_model: e.target.value })}
                                    >
                                        {['경량', '권장', '고성능', '사용자 설치'].map(category => (
                                            <optgroup key={category} label={`━━ ${category} ━━`}>
                                                {ollamaModels.filter(m => m.category === category).map(model => (
                                                    <option key={model.id} value={model.id}>
                                                        {model.installed ? '[설치됨] ' : '[미설치] '}{model.name} - {model.description} ({model.size})
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>

                                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            placeholder="또는 모델명 직접 입력 (예: deepseek-r1)"
                                            className="input-field"
                                            value={config.ollama_model || ''}
                                            onChange={e => setConfig({ ...config, ollama_model: e.target.value })}
                                            style={{ flex: 1, fontSize: '0.9rem' }}
                                        />
                                    </div>
                                </div>

                                {/* 선택된 모델 상태 */}
                                {config.ollama_model && (
                                    <div className="selected-model-info">
                                        {(() => {
                                            const selected = ollamaModels.find(m => m.id === config.ollama_model)
                                            if (!selected) return null

                                            return (
                                                <div className="model-detail-card">
                                                    <div className="model-detail-header">
                                                        <span className="model-detail-name">{selected.name}</span>
                                                        <span className="model-detail-size">{selected.size}</span>
                                                    </div>
                                                    <p className="model-detail-desc">{selected.description}</p>

                                                    {downloadingModel === selected.id ? (
                                                        <div className="download-progress">
                                                            <div className="progress-bar">
                                                                <div
                                                                    className="progress-fill"
                                                                    style={{
                                                                        width: `${downloadingProgress}%`,
                                                                        animation: 'none',
                                                                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <span className="progress-text">
                                                                다운로드 중... {downloadingProgress}%
                                                            </span>
                                                        </div>
                                                    ) : selected.installed ? (
                                                        <div className="installed-actions">
                                                            <span className="installed-badge-large">✅ 설치됨</span>
                                                            <button
                                                                className="btn btn-danger delete-btn"
                                                                onClick={() => {
                                                                    showConfirm(`${selected.name}을(를) 삭제하시겠습니까?`, async () => {
                                                                        try {
                                                                            const res = await configService.ollamaDelete(selected.id)
                                                                            showAlert(res.message || '삭제 완료!', '알림')
                                                                            configService.ollamaModels()
                                                                                .then(res => setOllamaModels(res.models || []))
                                                                        } catch (err) {
                                                                            showAlert('삭제 실패: ' + err.message, '오류')
                                                                        }
                                                                    })
                                                                }}
                                                            >
                                                                🗑️ 삭제
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn btn-primary download-btn"
                                                            disabled={!ollamaStatus.running}
                                                            onClick={async () => {
                                                                if (!ollamaStatus.running) {
                                                                    showAlert('먼저 Ollama를 실행해주세요', '알림')
                                                                    return
                                                                }

                                                                setDownloadingModel(selected.id)
                                                                setDownloadingProgress(0)

                                                                try {
                                                                    // Streaming download via direct fetch
                                                                    const response = await fetch(configService.getPullStreamUrl(), {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ model: selected.id })
                                                                    })

                                                                    const reader = response.body.getReader()
                                                                    const decoder = new TextDecoder()

                                                                    while (true) {
                                                                        const { done, value } = await reader.read()
                                                                        if (done) break

                                                                        const chunk = decoder.decode(value, { stream: true })
                                                                        const lines = chunk.split('\n').filter(line => line.trim() !== '')

                                                                        for (const line of lines) {
                                                                            try {
                                                                                const data = JSON.parse(line)
                                                                                if (data.status === 'downloading') {
                                                                                    setDownloadingProgress(data.percent || 0)
                                                                                } else if (data.status === 'done') {
                                                                                    setDownloadingProgress(100)
                                                                                } else if (data.status === 'error') {
                                                                                    throw new Error(data.msg)
                                                                                }
                                                                            } catch (e) {
                                                                                // ignore partial json
                                                                            }
                                                                        }
                                                                    }

                                                                    showAlert('다운로드 완료!', '알림')
                                                                    configService.ollamaModels().then(res => setOllamaModels(res.models || []))

                                                                } catch (err) {
                                                                    showAlert('다운로드 실패: ' + err.message, '오류')
                                                                } finally {
                                                                    setDownloadingModel(null)
                                                                    setDownloadingProgress(0)
                                                                }
                                                            }}
                                                        >
                                                            📥 {selected.size} 다운로드
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        })()}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>API Key</label>
                                <input
                                    type="password"
                                    placeholder="API Key 입력"
                                    value={config.api_keys?.[0]?.key || ''}
                                    onChange={e => {
                                        const provider = config.api_keys?.[0]?.provider || 'gemini'
                                        const newKeys = [{ provider, key: e.target.value }]
                                        setConfig({ ...config, api_keys: newKeys })
                                    }}
                                    className={errors.apiKey ? 'input-error' : ''}
                                />
                                {errors.apiKey && <span className="error-text">{errors.apiKey}</span>}
                                {(() => {
                                    const provider = config.api_keys?.[0]?.provider || 'gemini'
                                    const links = {
                                        gemini: 'https://aistudio.google.com/app/apikey',
                                        openai: 'https://platform.openai.com/api-keys',
                                        deepseek: 'https://platform.deepseek.com/',
                                        groq: 'https://console.groq.com/keys',
                                        claude: 'https://console.anthropic.com/settings/keys'
                                    }
                                    return links[provider] ? (
                                        <a href={links[provider]} target="_blank" rel="noreferrer" className="help-link">
                                            👉 {provider.charAt(0).toUpperCase() + provider.slice(1)} API Key 발급받기
                                        </a>
                                    ) : null
                                })()}
                            </div>
                        )}
                    </div>

                    <div className="settings-section">
                        <h4>지도 설정</h4>
                        <div className="form-group">
                            <label>카카오맵 API Key (32자)</label>
                            <input
                                type="text"
                                placeholder="카카오 개발자 API Key"
                                value={config.kakao_api_key || ''}
                                onChange={e => setConfig({ ...config, kakao_api_key: e.target.value })}
                                className={errors.kakao ? 'input-error' : ''}
                            />
                            {errors.kakao && <span className="error-text">{errors.kakao}</span>}
                            <a href="https://developers.kakao.com/console/app" target="_blank" rel="noreferrer" className="help-link">
                                👉 카카오 API Key 발급받기
                            </a>
                        </div>
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onSave}
                        disabled={!canSave()}
                    >
                        저장
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onClose}>취소</button>
                </div>
            </>
        )
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={e => e.stopPropagation()}>
                {renderContent()}
            </div>
            {alertConfig.isOpen && (
                <AlertModal
                    isOpen={alertConfig.isOpen}
                    onClose={closeAlert}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    onConfirm={alertConfig.onConfirm}
                />
            )}
        </div>
    )
}
