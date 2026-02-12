import { useState, useEffect } from 'react'
import { configService } from '../services/apiService'
import { DEMO_CONFIG } from '../data/mockData'

const isDemoMode = false

const DEFAULT_CONFIG = {
    gmail_user: '',
    gmail_app_pass: '',
    api_keys: [{ provider: 'gemini', key: '' }],
    budget: 1000000,
    kakao_api_key: ''
}

export function useConfig() {
    const [config, setConfig] = useState(isDemoMode ? { ...DEFAULT_CONFIG, ...DEMO_CONFIG } : DEFAULT_CONFIG)
    const [loading, setLoading] = useState(!isDemoMode)
    const [error, setError] = useState(null)

    const loadConfig = async () => {
        // Demo mode: skip API call
        if (isDemoMode) {
            setConfig({ ...DEFAULT_CONFIG, ...DEMO_CONFIG })
            setLoading(false)
            return
        }

        try {
            setLoading(true)
            const data = await configService.get()
            // Merge with defaults to ensure all fields exist
            const merged = { ...DEFAULT_CONFIG, ...data }
            if (data.api_keys && data.api_keys.length > 0) {
                merged.api_keys = data.api_keys
            }
            setConfig(merged)
        } catch (err) {
            console.error('Failed to load config:', err)
            setError(err.message)
            // Fallback to local storage if available (only non-sensitive data)
            const cached = localStorage.getItem('mino_config_safe')
            if (cached) {
                const safeData = JSON.parse(cached)
                setConfig({ ...DEFAULT_CONFIG, ...safeData })
            }
        } finally {
            setLoading(false)
        }
    }

    const saveConfig = async (newConfig) => {
        try {
            await configService.save(newConfig)
            // 저장 후 서버에서 다시 로드하여 상태 동기화 보장
            const savedData = await configService.get()
            const merged = { ...DEFAULT_CONFIG, ...savedData }
            if (savedData.api_keys && savedData.api_keys.length > 0) {
                merged.api_keys = savedData.api_keys
            }
            setConfig(merged)
            // Issue #15: Only cache non-sensitive config in localStorage
            const safeConfig = { budget: newConfig.budget }
            localStorage.setItem('mino_config_safe', JSON.stringify(safeConfig))
            return { success: true }
        } catch (err) {
            return { success: false, message: err.message }
        }
    }

    useEffect(() => {
        loadConfig()
    }, [])

    return { config, setConfig, saveConfig, loading, error, refreshConfig: loadConfig }
}
