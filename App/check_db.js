
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.argv[2];
try {
    const db = new Database(dbPath);
    const count = db.prepare('SELECT count(*) as c FROM expenses').get();
    console.log(`Row count for ${dbPath}: ${count.c}`);
} catch (e) {
    console.error(`Error reading ${dbPath}:`, e.message);
}
