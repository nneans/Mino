/**
 * Config Service - Configuration file management
 * Replaces Python routes/config.py (config-related parts)
 */
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

let configPath = null;

/**
 * Initialize config service
 * @param {string} userDataPath - Path to store config
 */
function init(userDataPath) {
    configPath = path.join(userDataPath, 'config.json');
    console.log('Config path:', configPath);
}

/**
 * Get configuration
 */
function getConfig() {
    if (!configPath) {
        throw new Error('Config not initialized');
    }

    if (fs.existsSync(configPath)) {
        try {
            const data = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(data);
        } catch (e) {
            console.error('Error reading config:', e);
            return {};
        }
    }
    return {};
}

/**
 * Save configuration
 */
function saveConfig(data) {
    if (!configPath) {
        throw new Error('Config not initialized');
    }

    try {
        fs.writeFileSync(configPath, JSON.stringify(data, null, 4), 'utf-8');
        // Set secure permissions (owner read/write only)
        try {
            fs.chmodSync(configPath, 0o600);
        } catch (e) {
            // Windows may not support chmod
        }
        return { success: true };
    } catch (e) {
        console.error('Error saving config:', e);
        return { success: false, message: e.message };
    }
}

// ============================================
// OLLAMA OPERATIONS
// ============================================

const OLLAMA_URL = 'http://localhost:11434';

/**
 * Check Ollama status
 */
async function ollamaStatus() {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
            const data = await response.json();
            const installedModels = data.models?.map(m => m.name?.split(':')[0]) || [];

            const recommended = [
                {
                    id: 'qwen2.5:1.5b',
                    name: 'Qwen 2.5 (1.5B)',
                    size: '1.0GB',
                    description: '가장 빠름, 한국어 우수',
                    installed: installedModels.some(m => m.includes('qwen2.5') || m.includes('qwen2'))
                },
                {
                    id: 'gemma2:2b',
                    name: 'Gemma 2 (2B)',
                    size: '1.6GB',
                    description: 'Google, 균형잡힌 성능',
                    installed: installedModels.some(m => m.includes('gemma2') || m.includes('gemma'))
                },
                {
                    id: 'llama3.2:3b',
                    name: 'Llama 3.2 (3B)',
                    size: '2.0GB',
                    description: 'Meta, 고품질',
                    installed: installedModels.some(m => m.includes('llama3.2') || m.includes('llama3'))
                }
            ];

            return {
                running: true,
                installed_models: installedModels,
                recommended
            };
        }

        return { running: false, installed_models: [], recommended: [] };
    } catch (e) {
        return {
            running: false,
            error: 'Ollama가 실행되고 있지 않습니다',
            installed_models: [],
            recommended: []
        };
    }
}

/**
 * Start Ollama server
 */
async function ollamaStart() {
    // Check if already running
    const status = await ollamaStatus();
    if (status.running) {
        return { status: 'already_running', message: 'Ollama가 이미 실행 중입니다' };
    }

    // Find ollama executable
    const ollamaPaths = ['/usr/local/bin/ollama', '/opt/homebrew/bin/ollama'];
    let ollamaCmd = null;

    for (const p of ollamaPaths) {
        if (fs.existsSync(p)) {
            ollamaCmd = p;
            break;
        }
    }

    if (!ollamaCmd) {
        return { status: 'error', message: 'Ollama가 설치되어 있지 않습니다' };
    }

    // Start in background
    const child = spawn(ollamaCmd, ['serve'], {
        detached: true,
        stdio: 'ignore'
    });
    child.unref();

    // Wait a bit and verify
    await new Promise(r => setTimeout(r, 2000));

    const newStatus = await ollamaStatus();
    if (newStatus.running) {
        return { status: 'success', message: 'Ollama 서버 시작됨!' };
    }

    return { status: 'started', message: 'Ollama 서버가 시작 중입니다...' };
}

/**
 * Stop Ollama server
 */
function ollamaStop() {
    return new Promise((resolve) => {
        exec('pkill ollama', (error) => {
            resolve({ status: 'success', message: 'Ollama가 종료되었습니다' });
        });
    });
}

/**
 * Install Ollama
 */
function ollamaInstall() {
    return new Promise((resolve) => {
        // Check if already installed
        const ollamaPaths = ['/usr/local/bin/ollama', '/opt/homebrew/bin/ollama'];
        const alreadyInstalled = ollamaPaths.some(p => fs.existsSync(p));

        if (alreadyInstalled) {
            resolve({ status: 'already_installed', message: 'Ollama가 이미 설치되어 있습니다' });
            return;
        }

        const installCmd = 'curl -fsSL https://ollama.com/install.sh | sh';
        exec(installCmd, { timeout: 300000 }, (error, stdout, stderr) => {
            if (error) {
                resolve({ status: 'error', message: stderr || error.message });
            } else {
                resolve({ status: 'success', message: 'Ollama 설치 완료!' });
            }
        });
    });
}

/**
 * Pull/download an Ollama model
 */
async function ollamaPull(model) {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model, stream: false })
        });

        if (response.ok) {
            return { status: 'success', message: `${model} 설치 완료!` };
        } else {
            return { status: 'error', message: '모델 다운로드 실패' };
        }
    } catch (e) {
        return { status: 'error', message: e.message };
    }
}

/**
 * Delete an Ollama model
 */
async function ollamaDelete(model) {
    try {
        const response = await fetch(`${OLLAMA_URL}/api/delete`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: model })
        });

        if (response.ok) {
            return { status: 'success', message: `${model} 삭제 완료!` };
        } else {
            return { status: 'error', message: '삭제 실패' };
        }
    } catch (e) {
        return { status: 'error', message: e.message };
    }
}

/**
 * Get available Ollama models list
 */
async function ollamaModels() {
    const allModels = [
        { id: 'qwen2.5:0.5b', name: 'Qwen 2.5 (0.5B)', size: '0.4GB', category: '경량', description: '가장 빠름' },
        { id: 'qwen2.5:1.5b', name: 'Qwen 2.5 (1.5B)', size: '1.0GB', category: '경량', description: '빠름, 한국어' },
        { id: 'gemma2:2b', name: 'Gemma 2 (2B)', size: '1.6GB', category: '경량', description: 'Google' },
        { id: 'llama3.2:3b', name: 'Llama 3.2 (3B)', size: '2.0GB', category: '권장', description: 'Meta' },
        { id: 'qwen2.5:3b', name: 'Qwen 2.5 (3B)', size: '1.9GB', category: '권장', description: '한국어 우수' },
        { id: 'mistral:7b', name: 'Mistral (7B)', size: '4.1GB', category: '권장', description: '우수한 성능' },
        { id: 'qwen2.5:7b', name: 'Qwen 2.5 (7B)', size: '4.7GB', category: '권장', description: '한국어 최고' },
    ];

    try {
        const response = await fetch(`${OLLAMA_URL}/api/tags`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
            const data = await response.json();
            const installedNames = data.models?.map(m => m.name) || [];

            for (const model of allModels) {
                model.installed = installedNames.includes(model.id) ||
                    installedNames.some(n => n.startsWith(model.id.split(':')[0]));
            }

            // Add any installed models not in the list
            for (const installed of installedNames) {
                if (!allModels.some(m => m.id === installed)) {
                    allModels.push({
                        id: installed,
                        name: installed,
                        size: '?',
                        category: '사용자 설치',
                        description: 'Local model',
                        installed: true
                    });
                }
            }
        }
    } catch (e) {
        for (const model of allModels) {
            model.installed = false;
        }
    }

    return { models: allModels };
}

module.exports = {
    init,
    getConfig,
    saveConfig,
    ollamaStatus,
    ollamaStart,
    ollamaStop,
    ollamaInstall,
    ollamaPull,
    ollamaDelete,
    ollamaModels,
};
