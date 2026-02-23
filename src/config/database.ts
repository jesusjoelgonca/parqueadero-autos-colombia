import Sqlite = require('better-sqlite3');
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'db', 'parqueadero.db');

let db: Sqlite.Database | null = null;

function ensureDbDir(): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runInitSql(): void {
  if (!db) return;
  const initPath = path.join(process.cwd(), 'db', 'init.sql');
  if (!fs.existsSync(initPath)) return;
  const sql = fs.readFileSync(initPath, 'utf-8');
  db.exec(sql);
  const hashOp = bcrypt.hashSync('operador123', 10);
  const hashAdmin = bcrypt.hashSync('admin123', 10);
  db.prepare("UPDATE usuario SET password_hash = ? WHERE login = 'operador' AND (password_hash IS NULL OR password_hash = '')").run(hashOp);
  db.prepare("UPDATE usuario SET password_hash = ? WHERE login = 'admin' AND (password_hash IS NULL OR password_hash = '')").run(hashAdmin);
}

export function getDb(): Sqlite.Database {
  if (!db) {
    ensureDbDir();
    db = new Sqlite(DB_PATH);
    runInitSql();
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
