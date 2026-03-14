import { getDb } from '../config/database';
import type { Usuario as UsuarioType, RolUsuario } from '../types';

export function findByLogin(login: string): UsuarioType | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM usuario WHERE login = ?').get(login) as UsuarioType | undefined;
  return row;
}

export function findById(id: number): UsuarioType | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM usuario WHERE id_usuario = ?').get(id) as UsuarioType | undefined;
  return row;
}

export function createPropietario(nombre: string, cedula?: string, telefono?: string, email?: string): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO usuario (nombre, cedula, telefono, email, rol) VALUES (?, ?, ?, ?, ?)'
  ).run(nombre, cedula ?? null, telefono ?? null, email ?? null, 'Propietario');
  return result.lastInsertRowid as number;
}

export function findOrCreatePropietario(nombre: string, cedula?: string): { id_usuario: number } {
  const db = getDb();
  if (cedula) {
    const existing = db.prepare('SELECT id_usuario FROM usuario WHERE cedula = ? AND rol = ?').get(cedula, 'Propietario') as { id_usuario: number } | undefined;
    if (existing) return existing;
  }
  const id = createPropietario(nombre, cedula);
  return { id_usuario: id };
}

export function findByCedula(cedula: string): UsuarioType | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM usuario WHERE cedula = ?').get(cedula.trim()) as UsuarioType | undefined;
}

export function findByEmail(email: string): UsuarioType | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM usuario WHERE email = ?').get(email.trim()) as UsuarioType | undefined;
}

export function findByLoginOrEmail(loginOrEmail: string): UsuarioType | undefined {
  const db = getDb();
  const trimmed = loginOrEmail.trim();
  let row = db.prepare('SELECT * FROM usuario WHERE login = ?').get(trimmed) as UsuarioType | undefined;
  if (!row) row = db.prepare('SELECT * FROM usuario WHERE email = ?').get(trimmed) as UsuarioType | undefined;
  return row;
}

export function createStaffUser(
  nombre: string,
  cedula: string,
  telefono: string | null,
  email: string,
  passwordHash: string,
  rol: 'Operador' | 'Administrador'
): number {
  const db = getDb();
  const login = email.trim();
  const result = db.prepare(
    `INSERT INTO usuario (nombre, cedula, telefono, email, login, password_hash, rol, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(nombre.trim(), cedula.trim(), telefono?.trim() || null, email.trim(), login, passwordHash, rol);
  return result.lastInsertRowid as number;
}

export type StaffListItem = {
  id_usuario: number;
  nombre: string;
  cedula: string | null;
  telefono: string | null;
  email: string | null;
  login: string | null;
  rol: string;
  fecha_registro: string | null;
  activo: number | null;
};

export function findAllStaff(rol?: string, buscar?: string): StaffListItem[] {
  const db = getDb();
  let sql = `SELECT id_usuario, nombre, cedula, telefono, email, login, rol, fecha_registro, COALESCE(activo, 1) as activo
             FROM usuario WHERE rol IN ('Operador', 'Administrador')`;
  const params: (string | number)[] = [];
  if (rol && rol !== 'Todos') {
    sql += ' AND rol = ?';
    params.push(rol);
  }
  if (buscar && buscar.trim()) {
    const term = `%${buscar.trim()}%`;
    sql += ' AND (nombre LIKE ? OR cedula LIKE ?)';
    params.push(term, term);
  }
  sql += ' ORDER BY rol, nombre';
  const rows = (params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as StaffListItem[];
  return rows;
}

export function updateActivo(id_usuario: number, activo: number): void {
  const db = getDb();
  db.prepare('UPDATE usuario SET activo = ? WHERE id_usuario = ?').run(activo, id_usuario);
}

export function updateStaffUser(
  id_usuario: number,
  nombre: string,
  telefono: string | null,
  email: string,
  rol: 'Operador' | 'Administrador',
  passwordHash?: string | null
): void {
  const db = getDb();
  const login = email.trim();
  if (passwordHash && passwordHash.length >= 8) {
    db.prepare(
      'UPDATE usuario SET nombre = ?, telefono = ?, email = ?, login = ?, password_hash = ?, rol = ? WHERE id_usuario = ?'
    ).run(nombre.trim(), telefono?.trim() || null, email.trim(), login, passwordHash, rol, id_usuario);
  } else {
    db.prepare(
      'UPDATE usuario SET nombre = ?, telefono = ?, email = ?, login = ?, rol = ? WHERE id_usuario = ?'
    ).run(nombre.trim(), telefono?.trim() || null, email.trim(), login, rol, id_usuario);
  }
}

export function findByEmailExcludingId(email: string, id_usuario: number): UsuarioType | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM usuario WHERE email = ? AND id_usuario != ?').get(email.trim(), id_usuario) as UsuarioType | undefined;
}
