import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'devflow.db');

let db: SqlJsDatabase;

export async function initDB(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')))`);
  db.run(`CREATE TABLE IF NOT EXISTS boards (id TEXT PRIMARY KEY, title TEXT NOT NULL, owner_id TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (owner_id) REFERENCES users(id))`);
  db.run(`CREATE TABLE IF NOT EXISTS columns (id TEXT PRIMARY KEY, title TEXT NOT NULL, board_id TEXT NOT NULL, position INTEGER NOT NULL, FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE)`);
  db.run(`CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT DEFAULT '', column_id TEXT NOT NULL, position INTEGER NOT NULL, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE)`);

  saveDB();
  return db;
}

export function getDB() {
  if (!db) throw new Error('DB not initialized');
  return {
    run(sql: string, params?: { bind: any[] }) { return db.run(sql, params?.bind as any); },
    exec(sql: string, params?: { bind: any[] }) { return db.exec(sql, params?.bind as any); },
    export() { return db.export(); },
  };
}

export function saveDB(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}
