import { useState, useEffect } from 'react'
import icon from './assets/logo.png' // Utilizing existing logo import or use the electron icon if preferred.
// Actually, earlier I saw logo import at line 2. Let's check line 2.
// Line 2: import logo from './assets/logo.png'
// The user asked to use electron/icon.png. I moved it to src/assets/icon.png.
// So let's import that.

import appIcon from './assets/icon.png'
import 'leaflet/dist/leaflet.css'
import './styles/variables.css'
import './styles/reset.css'
import './styles/fonts.css'
import './styles/common.css'

// utils import removed - getKoreanCategory was unused
import { getLocalISODate, getLocalISODateTime } from './utils/date'
import { aiService, expenseService } from './services/apiService'
import { DEMO_CHAT_RESPONSES } from './data/mockData'
import { API_URL } from './utils/constants'

// Demo mode imported dynamically
import { setDemoMode as setApiDemoMode } from './services/apiService'

// Hooks
import { motion } from 'framer-motion'
import ErrorBoundary from './components/ErrorBoundary'
import { useConfig } from './hooks/useConfig'
import { useExpenses } from './hooks/useExpenses'
import { useAlert } from './contexts'

// Tabs
import DashboardTab from './tabs/DashboardTab'
import InboxTab from './tabs/InboxTab'
import MapTab from './tabs/MapTab'
import InsightTab from './tabs/InsightTab'
import ChatTab from './tabs/ChatTab'

// Modals
import AddModal from './modals/AddModal'
import EditModal from './modals/EditModal'
import SettingsModal from './modals/SettingsModal'
import SyncModal from './modals/SyncModal'
import BudgetModal from './modals/BudgetModal'

function App() {
  const [activeTab, setActiveTab] = useState('DASHBOARD')

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(import.meta.env.VITE_DEMO_MODE === 'true')

  // Sync Demo Mode with API Service
  useEffect(() => {
    setApiDemoMode(isDemoMode)
  }, [isDemoMode])

  // Custom Hooks
  const { config, setConfig, saveConfig, loading: configLoading } = useConfig()
  const {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses
  } = useExpenses(config)

  // Alert Context
  const { showAlert } = useAlert()

  // Sync State
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [showBudgetModal, setShowBudgetModal] = useState(false)

  // Dashboard & Map State
  const [selectedDate, setSelectedDate] = useState(getLocalISODate)
  const [selectedMapPlace, setSelectedMapPlace] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)

  // Initialize location if enabled in config
  useEffect(() => {
    if (config.use_location_sorting) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (error) => {
            console.error("Error getting location:", error)
          }
        )
      }
    } else {
      setCurrentLocation(null)
    }
  }, [config.use_location_sorting])

  // Toggle Location Service
  const toggleLocationService = async () => {
    const newState = !config.use_location_sorting
    let newConfig = { ...config, use_location_sorting: newState }
    setConfig(newConfig)
    if (!newState) setCurrentLocation(null)

    const res = await saveConfig(newConfig)
    if (res.success) {
      if (newState) showAlert('위치 기반 정렬 켜짐', '이제 내 주변 위치를 우선적으로 검색하고 정렬합니다.')
    } else {
      setConfig(config)
      showAlert('오류', '설정 저장에 실패했습니다.')
    }
  }

  // Chat State
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Mino입니다. 무엇을 도와드릴까요?' }])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')

  const checkBackend = async () => {
    // IPC mode (Electron) - always online since we're using direct DB access
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const result = await window.electronAPI.health();
        if (result.status === 'ok') {
          setBackendStatus('online');
          return;
        }
      } catch (e) {
        // Fall through to HTTP check
      }
    }

    // HTTP mode fallback
    try {
      const res = await fetch(`${API_URL}/health`)
      if (res.ok) setBackendStatus('online')
      else setBackendStatus('offline')
    } catch (e) {
      setBackendStatus('offline')
    }
  }

  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 5000)
    return () => clearInterval(interval)
  }, [])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [enteringApp, setEnteringApp] = useState(false)

  const [manualForm, setManualForm] = useState({
    transaction_date: '',
    place: '',
    location: '',
    amount: '',
    category: 'Food',
    type: 'expense'
  })

  // Load Kakao Maps SDK
  useEffect(() => {
    const apiKey = config.kakao_api_key
    if (!apiKey || apiKey.length < 32) return
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) return
    const existingScript = document.querySelector(`script[src*="dapi.kakao.com"]`)
    if (existingScript) return

    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`
    script.async = true
    script.onload = () => {
      if (window.kakao && window.kakao.maps) window.kakao.maps.load(() => { })
    }
    document.head.appendChild(script)
  }, [config.kakao_api_key])

  const openAddModal = () => {
    setManualForm({
      transaction_date: getLocalISODateTime(),
      place: '',
      location: '',
      amount: '',
      category: 'Food',
      type: 'expense'
    })
    setShowAddModal(true)
  }

  const handlePlaceSearch = (keyword, callback) => {
    if (!config.kakao_api_key) {
      showAlert('Kakao Map API 미등록', '설정에서 API Key를 입력해주세요.')
      callback([])
      return
    }
    if (!keyword) return callback([])

    const doSearch = () => {
      const ps = new window.kakao.maps.services.Places()
      const options = {}
      if (config.use_location_sorting && currentLocation) {
        options.location = new window.kakao.maps.LatLng(currentLocation.lat, currentLocation.lng)
        options.sort = window.kakao.maps.services.SortBy.DISTANCE
      }
      ps.keywordSearch(keyword, (data, status) => {
        if (status === window.kakao.maps.services.Status.OK) callback(data)
        else callback([])
      }, options)
    }

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) doSearch()
    else {
      setTimeout(() => handlePlaceSearch(keyword, callback), 300)
    }
  }

  const handleSaveExpense = async () => {
    if (!manualForm.place || !manualForm.amount) return showAlert('알림', '내용과 금액을 입력해주세요.')
    const res = await addExpense({
      ...manualForm,
      amount: parseInt(manualForm.amount),
      transaction_date: manualForm.transaction_date.replace('T', ' ') + ':00'
    })
    if (res.success) setShowAddModal(false)
    else showAlert('오류', res.message || '저장에 실패했습니다.')
  }

  const handleEditExpense = async () => {
    if (!editingExpense) return
    const res = await updateExpense(editingExpense.id, editingExpense)
    if (res.success) {
      setShowEditModal(false)
      setEditingExpense(null)
    }
  }

  const handleUpdateExpense = async (expense) => {
    if (!expense?.id) return
    await updateExpense(expense.id, expense)
  }

  const handleDeleteExpense = async (id) => {
    showAlert('삭제 확인', '정말 삭제하시겠습니까?', async () => {
      await deleteExpense(id)
    }, 'confirm')
  }

  const handleResetExpenses = () => {
    showAlert('⚠️ 데이터 초기화', '모든 거래 내역이 삭제됩니다.', async () => {
      await expenseService.reset()
      refreshExpenses()
    }, 'confirm')
  }

  const handleConfigUpdate = async () => {
    const { isValid, errors } = validateCredentials()
    if (!isValid) return showAlert('입력 오류', Object.values(errors).join('\n'))

    const hasGmail = config.gmail_user && config.gmail_app_pass
    const hasLLM = config.api_keys?.[0]?.key || config.api_keys?.[0]?.provider === 'ollama'
    const hasKakao = config.kakao_api_key

    if (!hasGmail || !hasLLM || !hasKakao) return showAlert('입력 필요', '모든 설정을 입력해주세요.')

    setShowSettings(false)
    setEnteringApp(true)
    const res = await saveConfig({ ...config, setup_completed: true, test_mode: false })
    if (res.success) {
      setTimeout(() => setEnteringApp(false), 2000)
    } else {
      setEnteringApp(false)
      showAlert('오류', '저장에 실패했습니다.')
    }
  }

  const handleResetSettings = () => {
    showAlert('설정 초기화', '모든 설정을 초기화합니다.', async () => {
      const empty = { gmail_user: '', gmail_app_pass: '', api_keys: [{ provider: 'gemini', key: '' }], budget: 1000000, kakao_api_key: '', setup_completed: false }
      if ((await saveConfig(empty)).success) window.location.reload()
    }, 'confirm')
  }

  const handleReturnToOnboarding = async () => {
    if ((await saveConfig({ ...config, setup_completed: false })).success) {
      setConfig({ ...config, setup_completed: false })
      setShowSettings(false)
    }
  }

  const handleTestMode = async () => {
    if (backendStatus !== 'online') return showAlert('알림', '백엔드 연결 대기 중...')
    setEnteringApp(true)
    if ((await saveConfig({ ...config, setup_completed: true, test_mode: true })).success) {
      setTimeout(() => setEnteringApp(false), 1500)
    } else {
      setEnteringApp(false)
    }
  }

  const handleChatSend = async () => {
    if (config.test_mode && !isDemoMode) return showAlert('알림', '테스트 모드에서는 불가합니다.')
    if (chatLoading || !chatInput.trim()) return
    const msg = chatInput
    setChatInput('')
    setChatLoading(true)
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    try {
      const data = await aiService.chat(msg)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || '응답 없음' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '오류 발생' }])
    }
    setChatLoading(false)
  }

  const validateCredentials = () => {
    const errors = {}
    if (config.gmail_user && !/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(config.gmail_user)) errors.gmail = 'Gmail 형식이 아닙니다.'
    return { isValid: Object.keys(errors).length === 0, errors }
  }

  const isFirstTimeSetup = () => !isDemoMode && !configLoading && !config.setup_completed

  // Data pre-fetching effect
  useEffect(() => {
    if (!configLoading && config.setup_completed && !enteringApp) {
      refreshExpenses()
    }
  }, [configLoading, config.setup_completed, enteringApp])

  if (isFirstTimeSetup()) {
    if (enteringApp) {
      return (
        <div className="app-container">
          <div className="entering-screen">
            <div className="entering-content">
              <div className="entering-spinner"></div>
              <h2>입장 중...</h2>
              <p>Mino를 준비하고 있습니다</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="app-container">
        <div className="onboarding-screen">
          <div className="onboarding-content">
            <div className="onboarding-logo">
              <h1>Mino</h1>
            </div>
            <div className="onboarding-welcome">
              <h2>환영합니다!</h2>
              <p>Mino는 AI 금융 관리 앱입니다.<br />시작하기 전에 설정이 필요합니다.</p>
            </div>

            <div className="onboarding-steps">
              <div className="setup-step">
                <span className="step-icon">📧</span>
                <div className="step-info">
                  <strong>Gmail 연동</strong>
                  <p>카드 결제 알림을 자동으로 가져옵니다</p>
                </div>
              </div>
              <div className="setup-step">
                <span className="step-icon">🤖</span>
                <div className="step-info">
                  <strong>LLM API Key</strong>
                  <p>AI 분석 및 채팅 기능에 필요합니다</p>
                </div>
              </div>
              <div className="setup-step">
                <span className="step-icon">🗺️</span>
                <div className="step-info">
                  <strong>Kakao Map API</strong>
                  <p>지도에서 지출 위치를 확인합니다</p>
                </div>
              </div>
            </div>

            <div className="onboarding-status">
              <div className={`status-badge ${backendStatus === 'online' ? 'online' : backendStatus === 'checking' ? 'checking' : 'offline'}`}>
                <span className="status-dot-mini"></span>
                {backendStatus === 'online' ? 'Backend Online' :
                  backendStatus === 'checking' ? 'Backend Checking...' : 'Backend Offline'}
              </div>
            </div>

            <button className="btn btn-primary btn-large" onClick={() => setShowSettings(true)} disabled={backendStatus !== 'online'}>
              {backendStatus === 'online' ? '설정 시작하기' : '연결 중...'}
            </button>
            <div className="onboarding-divider"><span>또는</span></div>
            <button className="btn btn-secondary" onClick={handleTestMode} disabled={backendStatus !== 'online'}>🧪 테스트 모드</button>
          </div>
        </div>
        <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} config={config} setConfig={setConfig} onSave={handleConfigUpdate} onResetRequest={handleResetSettings} onReturnToOnboarding={handleReturnToOnboarding} mode="full" />
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="logo" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => setActiveTab('DASHBOARD')}>
            <img src={appIcon} alt="Mino" style={{ width: '28px', height: '28px', borderRadius: '6px', marginRight: '8px' }} />
            <span className="logo-text">Mino</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={toggleLocationService} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px' }}>
            <span>📍</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: config.use_location_sorting && currentLocation ? '#10b981' : config.use_location_sorting ? '#f59e0b' : '#94a3b8' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{config.use_location_sorting ? '내 주변' : '전체 검색'}</span>
          </button>
          <button className="icon-btn" onClick={() => setShowBudgetModal(true)} title="목표 예산">💰</button>
          <button className="icon-btn" onClick={openAddModal} title="직접 입력">✏️</button>
          <button className="icon-btn" onClick={refreshExpenses} title="새로고침">🔄</button>
          <button className="icon-btn" onClick={() => setShowSyncModal(true)}>📥</button>
          <button className="icon-btn" onClick={() => setShowSettings(true)}>⚙️</button>
        </div>
      </header>

      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div style={{
          background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: 500
        }}>
          🎮 Demo Mode - 샘플 데이터로 체험 중 | <a href="https://github.com/nneans/mino-v4" target="_blank" rel="noreferrer" style={{ color: 'white', textDecoration: 'underline' }}>GitHub</a>
        </div>
      )}

      <nav className="tab-nav">
        {['DASHBOARD', 'INBOX', 'MAP', 'INSIGHT', 'CHAT'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </nav>

      <main className="app-main">
        <ErrorBoundary>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'DASHBOARD' && <DashboardTab expenses={expenses} config={config} setConfig={setConfig} saveConfig={saveConfig} loading={loading} selectedDate={selectedDate} setSelectedDate={setSelectedDate} />}
            {activeTab === 'INBOX' && <InboxTab expenses={expenses} config={config} loading={loading} currentLocationProps={currentLocation} onEdit={(e) => { setEditingExpense(e); setShowEditModal(true); }} onDelete={handleDeleteExpense} onReset={handleResetExpenses} />}
            {activeTab === 'MAP' && <MapTab expenses={expenses} selectedMapPlace={selectedMapPlace} setSelectedMapPlace={setSelectedMapPlace} config={config} onSearch={handlePlaceSearch} onUpdateExpense={handleUpdateExpense} />}
            {activeTab === 'INSIGHT' && <InsightTab expenses={expenses} loading={loading} config={config} />}
            {activeTab === 'CHAT' && <ChatTab messages={messages} chatInput={chatInput} setChatInput={setChatInput} chatLoading={chatLoading} onSend={handleChatSend} />}
          </motion.div>
        </ErrorBoundary>
      </main>



      <AddModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} form={manualForm} setForm={setManualForm} onSave={handleSaveExpense} onSearch={handlePlaceSearch} />
      <EditModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingExpense(null); }} expense={editingExpense} setExpense={setEditingExpense} onSave={handleEditExpense} onSearch={handlePlaceSearch} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} config={config} setConfig={setConfig} onSave={handleConfigUpdate} onResetRequest={handleResetSettings} onReturnToOnboarding={handleReturnToOnboarding} />
      <SyncModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} onComplete={refreshExpenses} />
      {showBudgetModal && <BudgetModal config={config} onClose={() => setShowBudgetModal(false)} onSave={async (newConfig) => { const res = await saveConfig(newConfig); if (res.success) setConfig(newConfig); setShowBudgetModal(false); }} />}
      <footer className="app-footer">
        <p>© 2025 Mino. All rights reserved.</p>
        <p className="footer-subtitle">AI-Powered Personal Finance Management</p>
        <p className="footer-dev">Developer: nneans33@gmail.com</p>
      </footer>
    </div>
  )
}

export default App
