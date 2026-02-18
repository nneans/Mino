/**
 * Mino - Electron Main Process
 * Uses IPC for communication instead of HTTP backend
 */
const { app, BrowserWindow, shell, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// Import services
const database = require('./database');
const configService = require('./config');
const services = require('./services');
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_KR, validateExpenseData } = require('./constants');

// CRASH LOGGING
process.on('uncaughtException', (error) => {
    const logPath = path.join(app.getPath('userData'), 'crash_main.log');
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] CRASH: ${error.stack}\n`);
    app.quit();
});

// ================================
// 1. SINGLE INSTANCE LOCK
// ================================
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
    console.log('Another instance is already running. Quitting...');
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}

let mainWindow;
const userDataPath = app.getPath('userData');

// ================================
// 2. IPC HANDLERS - Database Operations
// ================================
function setupIpcHandlers() {
    // Health check
    ipcMain.handle('health', () => {
        return { status: 'ok', version: '3.0.0-ipc' };
    });

    // ============ EXPENSES ============
    ipcMain.handle('db:expenses:getAll', () => {
        try {
            return database.getAllExpenses();
        } catch (e) {
            console.error('Get expenses error:', e);
            return [];
        }
    });

    ipcMain.handle('db:expenses:add', (event, data) => {
        const validation = validateExpenseData(data);
        if (!validation.valid) {
            return { status: 'error', message: validation.error };
        }
        try {
            database.addExpense(data);
            database.updateGraph(data);
            return { status: 'success' };
        } catch (e) {
            console.error('Add expense error:', e);
            return { status: 'error', message: e.message };
        }
    });

    ipcMain.handle('db:expenses:update', (event, id, data) => {
        const validation = validateExpenseData(data);
        if (!validation.valid) {
            return { status: 'error', message: validation.error };
        }
        try {
            database.updateExpense(id, data);
            return { status: 'success' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    ipcMain.handle('db:expenses:delete', (event, id) => {
        try {
            database.deleteExpense(id);
            return { status: 'success' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    ipcMain.handle('db:expenses:reset', () => {
        try {
            return database.resetAllExpenses();
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    // ============ CATEGORY RULES ============
    ipcMain.handle('db:rules:getAll', () => {
        try {
            return database.getAllRules();
        } catch (e) {
            return [];
        }
    });

    ipcMain.handle('db:rules:add', (event, place, category) => {
        if (!place || !category) {
            return { status: 'error', message: 'Missing place or category' };
        }
        return database.addRule(place, category);
    });

    ipcMain.handle('db:rules:delete', (event, id) => {
        return database.deleteRule(id);
    });

    // ============ EMAILS ============
    ipcMain.handle('db:emails:getAll', () => {
        try {
            return database.getEmails();
        } catch (e) {
            return [];
        }
    });

    // ============ CATEGORIES ============
    ipcMain.handle('db:categories:getAll', () => {
        return {
            expense: EXPENSE_CATEGORIES,
            income: INCOME_CATEGORIES
        };
    });

    // ============ CONFIG ============
    ipcMain.handle('config:get', () => {
        try {
            return configService.getConfig();
        } catch (e) {
            return {};
        }
    });

    ipcMain.handle('config:save', (event, data) => {
        return configService.saveConfig(data);
    });

    // ============ SYNC ============
    ipcMain.handle('sync:getLastSync', () => {
        return database.getSyncInfo('last_sync');
    });

    ipcMain.handle('sync:cancel', () => {
        services.cancelSync();
        return true;
    });

    ipcMain.handle('sync:gmail', async (event, options) => {
        // Use window associated with event sender for progress updates
        const win = BrowserWindow.fromWebContents(event.sender);
        return services.syncGmail(win, options); // Pass options (days) to service
    });

    // ============ OLLAMA ============
    ipcMain.handle('ollama:status', () => configService.ollamaStatus());
    ipcMain.handle('ollama:start', () => configService.ollamaStart());
    ipcMain.handle('ollama:stop', () => configService.ollamaStop());
    ipcMain.handle('ollama:install', () => configService.ollamaInstall());
    ipcMain.handle('ollama:pull', (event, model) => configService.ollamaPull(model));
    ipcMain.handle('ollama:delete', (event, model) => configService.ollamaDelete(model));
    ipcMain.handle('ollama:models', () => configService.ollamaModels());

    // ============ GRAPH ============
    ipcMain.handle('graph:getData', () => {
        try {
            return database.getGraphData();
        } catch (e) {
            return { nodes: [], edges: [] };
        }
    });

    ipcMain.handle('graph:getUsage', () => {
        try {
            return database.getApiUsage();
        } catch (e) {
            return [];
        }
    });

    // ============ CHAT ============
    ipcMain.handle('chat:send', async (event, message, model, provider, apiKey) => {
        try {
            // Get Config First
            let config = configService.getConfig();

            // Override config if specific params provided
            if (model) config.ollama_model = model;
            if (provider) config.llm_provider = provider;
            if (apiKey) {
                if (!config.api_keys) config.api_keys = [];
                config.api_keys.unshift({ provider, key: apiKey });
            }

            // Context Injection
            let context = "";
            try {
                // 1. Calculate Monthly Stats
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                const stats = database.getMonthlyStats(year, month);
                const catStats = database.getMonthlyCategoryStats(year, month);
                const fixedExpenses = database.getFixedExpenses(); // From DB (detected)

                const budget = config.budget || 0;
                const totalSpent = stats.expense || 0;
                const totalIncome = stats.income || 0;
                const remaining = budget - totalSpent;

                // 2. Build Summary Context
                context += `[${month}월 상세 재정 현황 보고]\n`;
                context += `1. 예산 현황:\n`;
                context += `   - 설정된 예산: ${budget.toLocaleString()}원\n`;
                context += `   - 총 수입: ${totalIncome.toLocaleString()}원\n`;
                context += `   - 총 지출: ${totalSpent.toLocaleString()}원\n`;
                context += `   - 남은 예산(잔액): ${remaining.toLocaleString()}원\n\n`;

                context += `2. 유형별 지출 분석 (정확한 집계):\n`;
                if (Object.keys(catStats).length > 0) {
                    Object.entries(catStats).forEach(([cat, amount]) => {
                        const label = CATEGORY_KR[cat] || cat;
                        context += `   - ${label}: ${amount.toLocaleString()}원\n`;
                    });
                } else {
                    context += `   - 지출 내역 없음\n`;
                }
                context += `\n`;

                context += `3. 고정 지출 정보:\n`;

                // Dashboard Fixed Expenses
                if (config.fixed_expenses && config.fixed_expenses.length > 0) {
                    context += `   [사용자가 설정한 고정 지출 (Dashboard)]\n`;
                    config.fixed_expenses.filter(fe => fe.type !== 'income').forEach(fe => {
                        const day = fe.day ? `매월 ${fe.day}일` : '매월';
                        const amount = fe.amount ? fe.amount.toLocaleString() : '변동/미정';
                        context += `   - ${fe.name} (${day}): ${amount}원\n`;
                    });
                    context += `\n`;
                }

                // Detected Fixed Expenses (optional, might duplicate)
                if (fixedExpenses && fixedExpenses.length > 0) {
                    context += `   [거래 내역에서 감지된 고정 지출/공과금]\n`;
                    fixedExpenses.forEach(fe => {
                        context += `   - ${fe.place}: ${fe.amount.toLocaleString()}원 (${CATEGORY_KR[fe.category] || fe.category})\n`;
                    });
                    context += `\n`;
                }

                // 3. Add Transaction History
                const expenses = database.getAllExpenses(50);
                if (expenses && expenses.length > 0) {
                    context += "[참고: 최근 30건 거래 내역]\n";
                    expenses.slice(0, 30).forEach(e => {
                        const date = e.transaction_date ? e.transaction_date.slice(0, 10) : '';
                        const amount = e.amount ? e.amount.toLocaleString() : 0;
                        // Keep it simple for compatibility
                        const typeStr = e.type === 'income' ? '(수입)' : '(지출)';
                        context += `- ${date} ${typeStr} ${e.place}: ${amount}원 (${e.category})\n`;
                    });
                }
            } catch (e) {
                console.error("Context fetch error:", e);
                context += "데이터를 불러오는 중 오류가 발생했습니다.\n";
            }

            const sysPrompt = `System: 당신은 사용자의 개인 자산 비서 'Mino'입니다. 
아래 완벽하게 정리된 [상세 재정 현황 보고] 데이터를 기반으로 답변하세요.
절대로! 스스로 지출 합계를 다시 계산하지 마세요. 이미 계산된 '총 지출'과 '유형별 지출 분석' 수치를 그대로 인용해야 합니다.
사용자가 '분석해줘'라고 하면, 위 '2. 유형별 지출 분석'의 수치를 정리해서 말해주세요.
고정지출에 대한 질문이 있으면 '3. 고정 지출 정보' (사용자 설정값 및 감지된 내역)을 참고하세요.

절대 한자(漢字)를 섞어 쓰지 마세요. 오직 한국어(한글)로만 답변하세요.
화폐 단위는 원(KRW)입니다.

${context}

User: ${message}`;

            const response = await services.callLLM(sysPrompt, config);
            if (response) {
                return { status: 'success', response };
            } else {
                return { status: 'error', message: '응답을 받지 못했습니다.' };
            }
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    ipcMain.handle('chat:insight', async (event, period, model, provider, apiKey) => {
        // Get expenses for the period and generate insight
        try {
            const expenses = database.getAllExpenses(100);
            const totalExpense = expenses
                .filter(e => e.type === 'expense')
                .reduce((sum, e) => sum + (e.amount || 0), 0);

            const message = `다음은 최근 지출 데이터입니다. 간단한 인사이트를 제공해주세요:
총 지출: ${totalExpense.toLocaleString()}원
거래 수: ${expenses.length}건`;

            const config = configService.getConfig();

            // Override config if specific params provided
            if (model) config.ollama_model = model;
            if (provider) config.llm_provider = provider;
            if (apiKey) {
                if (!config.api_keys) config.api_keys = [];
                config.api_keys.unshift({ provider, key: apiKey });
            }

            const response = await services.callLLM(message, config);
            if (response) {
                return { status: 'success', response };
            } else {
                return { status: 'error', message: '응답을 받지 못했습니다.' };
            }
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    // ============ GOALS ============
    ipcMain.handle('db:goals:getAll', () => {
        try {
            return database.getAllGoals();
        } catch (e) {
            return [];
        }
    });

    ipcMain.handle('db:goals:add', (event, goal) => {
        try {
            return database.addGoal(goal);
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    ipcMain.handle('db:goals:update', (event, id, goal) => {
        try {
            return database.updateGoal(id, goal);
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    ipcMain.handle('db:goals:delete', (event, id) => {
        try {
            return database.deleteGoal(id);
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    });

    console.log('IPC handlers registered');
}

// ================================
// 3. WINDOW CREATION
// ================================
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            // Allow HTTP resources from Kakao CDN (required for Kakao Maps SDK)
            webSecurity: false,
            allowRunningInsecureContent: true,
        },
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 15, y: 15 },
        icon: path.join(__dirname, 'icon.png'),
    });

    // Load content
    if (app.isPackaged) {
        // Production: load built files
        mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
    } else {
        // Development: load from Vite dev server
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }

    // Handle permission requests
    const { session } = require('electron');
    session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
        if (permission === 'geolocation') {
            callback(true);
        } else {
            callback(false);
        }
    });

    // Open external links in default browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// ================================
// 4. APP LIFECYCLE
// ================================
app.whenReady().then(async () => {
    console.log('Initializing Mino (IPC Mode)...');
    console.log('User data path:', userDataPath);

    // Initialize services
    database.init(userDataPath, userDataPath); // Backups stored in same folder as Mino.db
    configService.init(userDataPath);

    // Setup IPC handlers
    setupIpcHandlers();

    // Create window
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    // Close database
    database.close();

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    database.close();
});
