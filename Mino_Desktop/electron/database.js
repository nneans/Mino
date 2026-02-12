/**
 * Database Service - SQLite operations using better-sqlite3
 * This replaces the Python database.py
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;
let dbPath = null;


/**
 * Initialize the database connection
 * @param {string} userDataPath - Path to store the database
 * @param {string} backupPath - Path to store backups (e.g., Documents folder)
 */
function init(userDataPath, backupPath) {
    dbPath = path.join(userDataPath, 'Mino.db');

    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Perform Auto-Backup before opening
    if (backupPath) {
        performBackup(dbPath, backupPath);
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Better performance

    // Create tables
    createTables();
    runMigrations();
    initializeDefaults();

    console.log('Database initialized at:', dbPath);
    return db;
}

/**
 * Perform database backup
 */
function performBackup(sourcePath, backupRootDir) {
    try {
        if (!fs.existsSync(sourcePath)) return;

        const backupDir = path.join(backupRootDir, 'Mino_Backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10); // YYYY-MM-DD
        const timeStr = today.toTimeString().slice(0, 5).replace(':', '-'); // HH-MM

        // Backup Logic: One backup per day is usually enough, but let's keep variants if changed?
        // Let's stick to YYYY-MM-DD to avoid clutter, overwriting allows "latest of day".
        // OR: Mino_Backup_YYYY-MM-DD.db

        const backupFile = path.join(backupDir, `Mino_Backup_${dateStr}.db`);

        fs.copyFileSync(sourcePath, backupFile);
        console.log('✅ Auto-backup created:', backupFile);

        // Optional: Clean up old backups (keep last 30 days)
        // cleanOldBackups(backupDir); 

    } catch (e) {
        console.error('❌ Backup failed:', e);
    }
}


function createTables() {
    // Main expenses table
    db.exec(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_date TEXT,
            place TEXT,
            location TEXT,
            amount INTEGER,
            category TEXT,
            source TEXT,
            raw_text TEXT,
            analysis_data TEXT,
            latitude REAL,
            longitude REAL,
            is_ocr BOOLEAN DEFAULT 0,
            image_path TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            type TEXT DEFAULT 'expense',
            normalized_place TEXT,
            is_fixed INTEGER DEFAULT 0,
            email_message_id TEXT
        )
    `);

    // Category rules table
    db.exec(`
        CREATE TABLE IF NOT EXISTS category_rules (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place_keyword TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Graph nodes table
    db.exec(`
        CREATE TABLE IF NOT EXISTS graph_nodes (
            id TEXT PRIMARY KEY,
            type TEXT,
            label TEXT
        )
    `);

    // Graph edges table
    db.exec(`
        CREATE TABLE IF NOT EXISTS graph_edges (
            source TEXT,
            target TEXT,
            relation TEXT,
            weight REAL,
            PRIMARY KEY (source, target, relation)
        )
    `);

    // API usage table
    db.exec(`
        CREATE TABLE IF NOT EXISTS api_usage (
            api_name TEXT PRIMARY KEY,
            request_count INTEGER DEFAULT 0,
            last_reset TEXT
        )
    `);

    // Insight cache table
    db.exec(`
        CREATE TABLE IF NOT EXISTS insight_cache (
            cache_key TEXT PRIMARY KEY,
            cache_value TEXT,
            created_at TEXT
        )
    `);

    // Sync info table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sync_info (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    `);
}

function runMigrations() {
    // Add columns if they don't exist (migrations)
    const migrations = [
        'ALTER TABLE expenses ADD COLUMN type TEXT DEFAULT "expense"',
        'ALTER TABLE expenses ADD COLUMN location TEXT',
        'ALTER TABLE expenses ADD COLUMN is_fixed INTEGER DEFAULT 0',
        'ALTER TABLE expenses ADD COLUMN normalized_place TEXT',
        'ALTER TABLE expenses ADD COLUMN email_message_id TEXT'
    ];

    for (const sql of migrations) {
        try {
            db.exec(sql);
        } catch (e) {
            // Column already exists, ignore
        }
    }
}

function initializeDefaults() {
    const now = new Date().toISOString();
    const stmt = db.prepare('INSERT OR IGNORE INTO api_usage (api_name, request_count, last_reset) VALUES (?, ?, ?)');
    stmt.run('llm', 0, now);
    stmt.run('kakao', 0, now);
}

/**
 * Get the database instance
 */
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call init() first.');
    }
    return db;
}

/**
 * Close the database connection
 */
function close() {
    if (db) {
        db.close();
        db = null;
    }
}

// ============================================
// EXPENSE OPERATIONS
// ============================================

function getAllExpenses(limit = 200) {
    const stmt = db.prepare('SELECT * FROM expenses ORDER BY transaction_date DESC LIMIT ?');
    return stmt.all(limit);
}

function addExpense(data) {
    const stmt = db.prepare(`
        INSERT INTO expenses (
            transaction_date, place, normalized_place, location, amount, 
            category, source, latitude, longitude, type, is_fixed, email_message_id,
            raw_text, analysis_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const normalizedPlace = normalizeMerchantName(data.place);
    const analysisJson = data.analysis_data ? (typeof data.analysis_data === 'string' ? data.analysis_data : JSON.stringify(data.analysis_data)) : JSON.stringify(data);

    const result = stmt.run(
        data.transaction_date,
        data.place,
        normalizedPlace,
        data.location || '',
        parseInt(data.amount),
        data.category || 'Others',
        data.source || '',
        data.latitude || null,
        data.longitude || null,
        data.type || 'expense',
        data.is_fixed || 0,
        data.email_message_id || null,
        data.raw_text || data.raw_text_summary || '',
        analysisJson
    );

    return { success: true, id: result.lastInsertRowid };
}

function updateExpense(id, data) {
    // 1. Get existing expense to decrement graph
    try {
        const existing = db.prepare('SELECT * FROM expenses WHERE id=?').get(id);
        if (existing) {
            decrementGraphWeight(existing);
        }
    } catch (e) { /* ignore if id not found */ }

    const stmt = db.prepare(`
        UPDATE expenses SET 
            transaction_date=?, place=?, normalized_place=?, location=?, 
            amount=?, category=?, source=?, latitude=?, longitude=?, type=?, is_fixed=?,
            raw_text=?, analysis_data=?
        WHERE id=?
    `);

    const normalizedPlace = normalizeMerchantName(data.place);
    const analysisJson = data.analysis_data ? (typeof data.analysis_data === 'string' ? data.analysis_data : JSON.stringify(data.analysis_data)) : JSON.stringify(data);

    stmt.run(
        data.transaction_date,
        data.place,
        normalizedPlace,
        data.location || '',
        parseInt(data.amount),
        data.category || 'Others',
        data.source || '',
        data.latitude || null,
        data.longitude || null,
        data.type || 'expense',
        data.is_fixed || 0,
        data.raw_text || data.raw_text_summary || '',
        analysisJson,
        id
    );

    // 2. Update graph with new values
    updateGraph(data);

    return { success: true };
}

function deleteExpense(id) {
    // 1. Get expense to decrement graph
    const existing = db.prepare('SELECT * FROM expenses WHERE id=?').get(id);
    if (existing) {
        decrementGraphWeight(existing);
    }

    const stmt = db.prepare('DELETE FROM expenses WHERE id=?');
    stmt.run(id);
    return { success: true };
}

function resetAllExpenses() {
    db.exec('DELETE FROM expenses');
    db.exec('DELETE FROM graph_nodes');
    db.exec('DELETE FROM graph_edges');
    return { success: true, message: '모든 데이터가 초기화되었습니다.' };
}

// ============================================
// CATEGORY RULES
// ============================================

function getAllRules() {
    const stmt = db.prepare('SELECT * FROM category_rules ORDER BY created_at DESC');
    return stmt.all();
}

function addRule(placeKeyword, category) {
    try {
        const stmt = db.prepare('INSERT OR REPLACE INTO category_rules (place_keyword, category) VALUES (?, ?)');
        stmt.run(placeKeyword, category);
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

function deleteRule(id) {
    const stmt = db.prepare('DELETE FROM category_rules WHERE id=?');
    stmt.run(id);
    return { success: true };
}

function getCategoryForPlace(place) {
    if (!place) return null;
    const normalized = place.toLowerCase();
    const stmt = db.prepare('SELECT category FROM category_rules WHERE ? LIKE \'%\' || LOWER(place_keyword) || \'%\' LIMIT 1');
    const result = stmt.get(normalized);
    return result ? result.category : null;
}

// ============================================
// EMAILS (Parsed expenses for inbox view)
// ============================================

function getEmails(limit = 50) {
    const stmt = db.prepare(`
        SELECT transaction_date, place, amount, category, raw_text 
        FROM expenses ORDER BY id DESC LIMIT ?
    `);
    const rows = stmt.all(limit);

    return rows.map(r => {
        let preview = r.raw_text;
        if (!preview && r.place) {
            preview = `${r.place}에서 ${r.amount.toLocaleString()}원 결제 승인 [${r.category}]`;
        }
        return {
            date: r.transaction_date,
            preview: preview,
            status: 'completed'
        };
    }).filter(e => e.preview);
}

// ============================================
// SYNC INFO
// ============================================

function getSyncInfo(key) {
    const stmt = db.prepare('SELECT value FROM sync_info WHERE key=?');
    const result = stmt.get(key);
    return result ? result.value : null;
}

function setSyncInfo(key, value) {
    const stmt = db.prepare('INSERT OR REPLACE INTO sync_info (key, value) VALUES (?, ?)');
    stmt.run(key, value);
}

// ============================================
// GRAPH OPERATIONS
// ============================================

function getGraphData() {
    const nodes = db.prepare('SELECT * FROM graph_nodes').all();
    const edges = db.prepare('SELECT * FROM graph_edges').all();
    return { nodes, edges };
}

function updateGraph(expenseData) {
    // Add nodes and edges for graph analysis
    const { place, category, amount } = expenseData;
    if (!place || !category) return;

    const placeId = `place:${place}`;
    const categoryId = `category:${category}`;

    // Insert or update nodes
    db.prepare('INSERT OR REPLACE INTO graph_nodes (id, type, label) VALUES (?, ?, ?)')
        .run(placeId, 'place', place);
    db.prepare('INSERT OR REPLACE INTO graph_nodes (id, type, label) VALUES (?, ?, ?)')
        .run(categoryId, 'category', category);

    // Insert or update edge with weight
    const existingEdge = db.prepare('SELECT weight FROM graph_edges WHERE source=? AND target=? AND relation=?')
        .get(placeId, categoryId, 'belongs_to');

    // Default weight contribution is amount, fallback to 1 if amount is 0/null
    const contribution = (amount !== undefined && amount !== null) ? amount : 1;
    const newWeight = (existingEdge?.weight || 0) + contribution;

    db.prepare('INSERT OR REPLACE INTO graph_edges (source, target, relation, weight) VALUES (?, ?, ?, ?)')
        .run(placeId, categoryId, 'belongs_to', newWeight);
}

function decrementGraphWeight(expenseData) {
    const { place, category, amount } = expenseData;
    if (!place || !category) return;

    const placeId = `place:${place}`;
    const categoryId = `category:${category}`;
    const contribution = (amount !== undefined && amount !== null) ? amount : 1;

    const existingEdge = db.prepare('SELECT weight FROM graph_edges WHERE source=? AND target=? AND relation=?')
        .get(placeId, categoryId, 'belongs_to');

    if (existingEdge) {
        let newWeight = existingEdge.weight - contribution;
        if (newWeight <= 0) {
            // Remove edge if weight becomes <= 0
            db.prepare('DELETE FROM graph_edges WHERE source=? AND target=? AND relation=?')
                .run(placeId, categoryId, 'belongs_to');

            // Cleanup nodes if they have no other edges? 
            // For simplicity, we keep nodes for now, or we could check connectivity.
            // But leaving nodes is safer for future additions.
        } else {
            db.prepare('UPDATE graph_edges SET weight=? WHERE source=? AND target=? AND relation=?')
                .run(newWeight, placeId, categoryId, 'belongs_to');
        }
    }
}

// ============================================
// API USAGE
// ============================================

function getApiUsage() {
    const stmt = db.prepare('SELECT * FROM api_usage');
    return stmt.all();
}

function incrementApiUsage(apiName) {
    const stmt = db.prepare('UPDATE api_usage SET request_count = request_count + 1 WHERE api_name = ?');
    stmt.run(apiName);
}

function resetApiUsage(apiName) {
    const stmt = db.prepare('UPDATE api_usage SET request_count = 0, last_reset = ? WHERE api_name = ?');
    stmt.run(new Date().toISOString(), apiName);
}

// ============================================
// UTILITIES
// ============================================

function normalizeMerchantName(name) {
    if (!name) return '';
    // Remove common suffixes and normalize
    return name
        .replace(/\([^)]*\)/g, '') // Remove parentheses content
        .replace(/\s*(점|지점|매장|가게)$/g, '')
        .trim();
}

// Check if expense with same email_message_id exists (for duplicate detection)
function expenseExistsByMessageId(messageId) {
    if (!messageId) return false;
    const stmt = db.prepare('SELECT id FROM expenses WHERE email_message_id = ? LIMIT 1');
    return !!stmt.get(messageId);
}

module.exports = {
    init,
    getDb,
    close,
    // Expenses
    getAllExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    resetAllExpenses,
    // Rules
    getAllRules,
    addRule,
    deleteRule,
    getCategoryForPlace,
    // Emails
    getEmails,
    // Sync
    getSyncInfo,
    setSyncInfo,
    // Graph
    getGraphData,
    updateGraph,
    // API Usage
    getApiUsage,
    incrementApiUsage,
    resetApiUsage,
    // Utilities
    normalizeMerchantName,
    expenseExistsByMessageId,
    // Transaction helpers
    beginTransaction: () => db.exec('BEGIN TRANSACTION'),
    commitTransaction: () => db.exec('COMMIT'),
    rollbackTransaction: () => db.exec('ROLLBACK'),
};
