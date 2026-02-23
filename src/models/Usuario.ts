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
