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
const { EXPENSE_CATEGORIES, INCOME_CATEGORIES, validateExpenseData } = require('./constants');

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
        return services.syncGmail(win);
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
