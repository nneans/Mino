import { API_URL } from '../utils/constants'
import { DEMO_EXPENSES, DEMO_CONFIG, DEMO_CHAT_RESPONSES, DEMO_GOALS, DEMO_GRAPH_DATA } from '../data/mockData';

// Demo Mode State
let isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const setDemoMode = (value) => {
    isDemoMode = value;
    console.log('[ApiService] Demo Mode:', isDemoMode);
};

// Check if running in Electron with IPC support
const isElectronIPC = () => {
    return !isDemoMode && typeof window !== 'undefined' && window.electronAPI;
};

// Custom API Error class
class ApiError extends Error {
    constructor(message, status, endpoint) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.endpoint = endpoint
    }
}

// User-friendly error messages
const getErrorMessage = (error, endpoint) => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.'
    }
    if (error.name === 'AbortError') {
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.'
    }
    if (error instanceof ApiError) {
        switch (error.status) {
            case 400: return '잘못된 요청입니다. 입력 내용을 확인해주세요.'
            case 401: return '인증이 필요합니다. 다시 로그인해주세요.'
            case 403: return '권한이 없습니다.'
            case 404: return '요청한 정보를 찾을 수 없습니다.'
            case 429: return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
            case 500: return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
            default: return error.message || '알 수 없는 오류가 발생했습니다.'
        }
    }
    return error.message || '알 수 없는 오류가 발생했습니다.'
}

// HTTP fetch helper (for web mode or fallback)
const apiFetch = async (endpoint, options = {}, timeout = 30000) => {
    if (isDemoMode) return null; // Should not be called in demo mode usually

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        clearTimeout(timeoutId)

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ message: 'Server Error' }));
            throw new ApiError(
                errorData.message || 'API request failed',
                res.status,
                endpoint
            );
        }

        return res.json();
    } catch (err) {
        clearTimeout(timeoutId)
        const userMessage = getErrorMessage(err, endpoint)
        console.error(`[API Error] ${endpoint}:`, userMessage, err);
        const enhancedError = new Error(userMessage)
        enhancedError.originalError = err
        enhancedError.endpoint = endpoint
        throw enhancedError
    }
}

// ============================================
// EXPENSE SERVICE
// ============================================
export const expenseService = {
    getAll: async () => {
        if (isDemoMode) return DEMO_EXPENSES;
        if (isElectronIPC()) {
            return window.electronAPI.db.getExpenses();
        }
        return apiFetch('/expenses');
    },

    add: async (data) => {
        if (isDemoMode) return { success: true, id: Date.now() };
        if (isElectronIPC()) {
            return window.electronAPI.db.addExpense(data);
        }
        return apiFetch('/expenses/add', { method: 'POST', body: JSON.stringify(data) });
    },

    update: async (id, data) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.updateExpense(id, data);
        }
        return apiFetch(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },

    delete: async (id) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.deleteExpense(id);
        }
        return apiFetch(`/expenses/${id}`, { method: 'DELETE' });
    },

    sync: async () => {
        if (isDemoMode) return { status: 'success', count: 0 };
        if (isElectronIPC()) {
            return window.electronAPI.sync.gmail({});
        }
        return apiFetch('/sync', { method: 'POST' });
    },

    syncInfo: async () => {
        if (isDemoMode) return { last_sync: new Date().toISOString() };
        if (isElectronIPC()) {
            const lastSync = await window.electronAPI.sync.getLastSync();
            return { last_sync: lastSync };
        }
        return apiFetch('/sync/info');
    },

    reset: async () => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.resetExpenses();
        }
        return apiFetch('/expenses/reset', { method: 'DELETE' });
    },

    addRule: async (data) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.addRule(data.place, data.category);
        }
        return apiFetch('/expenses/rule', { method: 'POST', body: JSON.stringify(data) });
    },

    getRules: async () => {
        if (isDemoMode) return [];
        if (isElectronIPC()) {
            return window.electronAPI.db.getRules();
        }
        return apiFetch('/expenses/rules');
    },

    deleteRule: async (id) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.deleteRule(id);
        }
        return apiFetch(`/expenses/rules/${id}`, { method: 'DELETE' });
    }
}

// ============================================
// GOAL SERVICE
// ============================================
export const goalService = {
    getAll: async () => {
        if (isDemoMode) return [...DEMO_GOALS];
        if (isElectronIPC()) {
            return window.electronAPI.db.getGoals();
        }
        return apiFetch('/goals');
    },

    add: async (goal) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.addGoal(goal);
        }
        return apiFetch('/goals', { method: 'POST', body: JSON.stringify(goal) });
    },

    update: async (id, goal) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.updateGoal(id, goal);
        }
        return apiFetch(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(goal) });
    },

    delete: async (id) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.db.deleteGoal(id);
        }
        return apiFetch(`/goals/${id}`, { method: 'DELETE' });
    },
}

// ============================================
// CONFIG SERVICE
// ============================================
export const configService = {
    get: async () => {
        if (isDemoMode) return { ...DEMO_CONFIG, setup_completed: true };
        if (isElectronIPC()) {
            return window.electronAPI.config.get();
        }
        return apiFetch('/config');
    },

    save: async (data) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.config.save(data);
        }
        return apiFetch('/config', { method: 'POST', body: JSON.stringify(data) });
    },

    ollamaStatus: async () => {
        if (isDemoMode) return { status: 'stopped', models: [] };
        if (isElectronIPC()) {
            return window.electronAPI.ollama.status();
        }
        return apiFetch('/ollama/status');
    },

    ollamaInstall: async () => {
        if (isDemoMode) return { status: 'success' };
        if (isElectronIPC()) {
            return window.electronAPI.ollama.install();
        }
        return apiFetch('/ollama/install', { method: 'POST' });
    },

    ollamaStart: async () => {
        if (isDemoMode) return { status: 'success' };
        if (isElectronIPC()) {
            return window.electronAPI.ollama.start();
        }
        return apiFetch('/ollama/start', { method: 'POST' });
    },

    ollamaStop: async () => {
        if (isDemoMode) return { status: 'success' };
        if (isElectronIPC()) {
            return window.electronAPI.ollama.stop();
        }
        return apiFetch('/ollama/stop', { method: 'POST' });
    },

    ollamaModels: async () => {
        if (isDemoMode) return ['gemma2:2b', 'llama3'];
        if (isElectronIPC()) {
            return window.electronAPI.ollama.getModels();
        }
        return apiFetch('/ollama/models');
    },

    ollamaDelete: async (model) => {
        if (isDemoMode) return { success: true };
        if (isElectronIPC()) {
            return window.electronAPI.ollama.delete(model);
        }
        return apiFetch('/ollama/delete', { method: 'POST', body: JSON.stringify({ model }) });
    },

    // For HTTP mode streaming
    getPullStreamUrl: () => `${API_URL}/ollama/pull`
}

// ============================================
// USAGE SERVICE
// ============================================
export const usageService = {
    get: async () => {
        if (isDemoMode) return [{ api_name: 'demo', request_count: 123, last_reset: new Date().toISOString() }];
        if (isElectronIPC()) {
            return window.electronAPI.graph.getUsage();
        }
        return apiFetch('/usage');
    },

    incrementKakao: async () => {
        // For IPC mode, this is handled internally
        if (isDemoMode || isElectronIPC()) {
            return { status: 'success' };
        }
        return apiFetch('/usage/increment-kakao', { method: 'POST' });
    }
}

// ============================================
// AI SERVICE
// ============================================
export const aiService = {
    chat: async (message, model, provider, apiKey) => {
        if (isDemoMode) {
            await new Promise(r => setTimeout(r, 600)); // Delay for realism
            const msg = message.toLowerCase();

            // Find response by keywords
            const matched = DEMO_CHAT_RESPONSES.find(r =>
                r.keywords.some(k => msg.includes(k.toLowerCase()))
            );

            return {
                response: matched
                    ? matched.assistant
                    : "데모 모드에서는 제한된 질문만 가능해요. 😅\n\n'이번 달 지출', '카페 지출', '절약 팁' 등을 물어보세요!"
            };
        }
        if (isElectronIPC()) {
            return window.electronAPI.chat.send(message, model, provider, apiKey);
        }
        return apiFetch('/chat', { method: 'POST', body: JSON.stringify({ message }) });
    },

    getInsight: async (period, model, provider, apiKey) => {
        if (isDemoMode) {
            return { response: "데모 모드 인사이트: 지출이 안정적입니다. 특히 식비 관리가 잘 되고 있습니다." };
        }
        if (isElectronIPC()) {
            return window.electronAPI.chat.getInsight(period, model, provider, apiKey);
        }
        return apiFetch('/insights/ai', { method: 'POST' });
    },

    getGraph: async () => {
        if (isDemoMode) return DEMO_GRAPH_DATA;
        if (isElectronIPC()) {
            return window.electronAPI.graph.getData();
        }
        return apiFetch('/graph');
    },

    ocr: async (imageBase64) => {
        if (isDemoMode) return { success: true, text: "데모 영수증 인식 결과" };
        // OCR is complex, keep HTTP for now
        return apiFetch('/ocr', { method: 'POST', body: JSON.stringify({ image: imageBase64 }) });
    }
}

// ============================================
// HEALTH CHECK
// ============================================
export const healthCheck = async () => {
    if (isDemoMode) return { ok: true, mode: 'demo', version: 'demo' };

    if (isElectronIPC()) {
        try {
            const result = await window.electronAPI.health();
            return { ok: result.status === 'ok', mode: 'ipc', version: result.version };
        } catch (e) {
            return { ok: false, mode: 'ipc', error: e.message };
        }
    }

    try {
        const result = await apiFetch('/health');
        return { ok: result.status === 'ok', mode: 'http', version: result.version };
    } catch (e) {
        return { ok: false, mode: 'http', error: e.message };
    }
}
