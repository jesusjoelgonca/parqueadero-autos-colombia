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
  db.prepare("UPDATE usuario SET email = 'operador@autoscolombia.com' WHERE login = 'operador' AND (email IS NULL OR email = '')").run();
  db.prepare("UPDATE usuario SET email = 'admin@autoscolombia.com' WHERE login = 'admin' AND (email IS NULL OR email = '')").run();
  migrateUsuarioActivo();
  migrateCeldaInactiva();
}

function migrateCeldaInactiva(): void {
  if (!db) return;
  try {
    db.exec('CREATE TABLE IF NOT EXISTS _migrations (nombre TEXT PRIMARY KEY)');
    const done = db.prepare("SELECT 1 FROM _migrations WHERE nombre = 'celda_inactiva'").get();
    if (done) return;
    db.exec(`
      PRAGMA foreign_keys = OFF;
      CREATE TABLE celda_new (
        id_celda INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_celda TEXT NOT NULL UNIQUE,
        tipo_celda TEXT CHECK(tipo_celda IN ('Carro','Moto')) NOT NULL,
        estado TEXT CHECK(estado IN ('Disponible','Ocupada','Inactiva')) DEFAULT 'Disponible'
      );
      INSERT INTO celda_new SELECT * FROM celda;
      DROP TABLE celda;
      ALTER TABLE celda_new RENAME TO celda;
      PRAGMA foreign_keys = ON;
    `);
    db.prepare("INSERT INTO _migrations (nombre) VALUES ('celda_inactiva')").run();
  } catch {
  }
}

function migrateUsuarioActivo(): void {
  if (!db) return;
  const info = db.prepare("PRAGMA table_info(usuario)").all() as { name: string }[];
  if (info.some((c) => c.name === 'activo')) return;
  db.prepare('ALTER TABLE usuario ADD COLUMN activo INTEGER DEFAULT 1').run();
  db.prepare('UPDATE usuario SET activo = 1 WHERE activo IS NULL').run();
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
