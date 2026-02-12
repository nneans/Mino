/**
 * Preload Script - IPC Bridge
 * This exposes a safe API to the renderer process
 */
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Database operations
    db: {
        // Expenses
        getExpenses: () => ipcRenderer.invoke('db:expenses:getAll'),
        addExpense: (data) => ipcRenderer.invoke('db:expenses:add', data),
        updateExpense: (id, data) => ipcRenderer.invoke('db:expenses:update', id, data),
        deleteExpense: (id) => ipcRenderer.invoke('db:expenses:delete', id),
        resetExpenses: () => ipcRenderer.invoke('db:expenses:reset'),

        // Category Rules
        getRules: () => ipcRenderer.invoke('db:rules:getAll'),
        addRule: (place, category) => ipcRenderer.invoke('db:rules:add', place, category),
        deleteRule: (id) => ipcRenderer.invoke('db:rules:delete', id),

        // Emails (parsed expenses)
        getEmails: () => ipcRenderer.invoke('db:emails:getAll'),

        // Categories
        getCategories: () => ipcRenderer.invoke('db:categories:getAll'),
    },

    // Config operations
    config: {
        get: () => ipcRenderer.invoke('config:get'),
        save: (data) => ipcRenderer.invoke('config:save', data),
    },

    // Sync operations
    sync: {
        gmail: (options) => ipcRenderer.invoke('sync:gmail', options),
        getLastSync: () => ipcRenderer.invoke('sync:getLastSync'),
        onProgress: (callback) => {
            const subscription = (event, data) => callback(data);
            ipcRenderer.on('sync:progress', subscription);
            return () => ipcRenderer.removeListener('sync:progress', subscription);
        },
        cancel: () => ipcRenderer.invoke('sync:cancel')
    },

    // Ollama operations
    ollama: {
        status: () => ipcRenderer.invoke('ollama:status'),
        start: () => ipcRenderer.invoke('ollama:start'),
        stop: () => ipcRenderer.invoke('ollama:stop'),
        install: () => ipcRenderer.invoke('ollama:install'),
        pull: (model) => ipcRenderer.invoke('ollama:pull', model),
        delete: (model) => ipcRenderer.invoke('ollama:delete', model),
        getModels: () => ipcRenderer.invoke('ollama:models'),
    },

    // Graph operations
    graph: {
        getData: () => ipcRenderer.invoke('graph:getData'),
        getUsage: () => ipcRenderer.invoke('graph:getUsage'),
    },

    // Chat operations
    chat: {
        send: (message, model, provider, apiKey) =>
            ipcRenderer.invoke('chat:send', message, model, provider, apiKey),
        getInsight: (period, model, provider, apiKey) =>
            ipcRenderer.invoke('chat:insight', period, model, provider, apiKey),
    },

    // Health check
    health: () => ipcRenderer.invoke('health'),
});
