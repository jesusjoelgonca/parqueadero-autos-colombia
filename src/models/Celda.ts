import { getDb } from '../config/database';
import type { Celda as CeldaType, TipoVehiculo, EstadoCelda } from '../types';

export function create(numero_celda: string, tipo_celda: TipoVehiculo): number {
  const db = getDb();
  const r = db.prepare(
    'INSERT INTO celda (numero_celda, tipo_celda, estado) VALUES (?, ?, ?)'
  ).run(numero_celda.trim(), tipo_celda, 'Disponible');
  return r.lastInsertRowid as number;
}

export function findDisponiblesByTipo(tipo_celda: TipoVehiculo): CeldaType[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM celda WHERE tipo_celda = ? AND estado = ? ORDER BY numero_celda')
    .all(tipo_celda, 'Disponible') as CeldaType[];
  return rows;
}

export function findAll(filtroTipo?: TipoVehiculo, filtroEstado?: EstadoCelda): CeldaType[] {
  const db = getDb();
  let sql = 'SELECT * FROM celda WHERE 1=1';
  const params: (string | undefined)[] = [];
  if (filtroTipo) {
    sql += ' AND tipo_celda = ?';
    params.push(filtroTipo);
  }
  if (filtroEstado) {
    sql += ' AND estado = ?';
    params.push(filtroEstado);
  }
  sql += ' ORDER BY numero_celda';
  const rows = (params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as CeldaType[];
  return rows;
}

export function findAllByTipo(tipo_celda: TipoVehiculo): CeldaType[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM celda WHERE tipo_celda = ? ORDER BY numero_celda')
    .all(tipo_celda) as CeldaType[];
  return rows;
}

export function findById(id_celda: number): CeldaType | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM celda WHERE id_celda = ?').get(id_celda) as CeldaType | undefined;
  return row;
}

export function findByNumero(numero_celda: string): CeldaType | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM celda WHERE numero_celda = ?').get(numero_celda) as CeldaType | undefined;
  return row;
}

export function updateEstado(id_celda: number, estado: EstadoCelda): void {
  const db = getDb();
  db.prepare('UPDATE celda SET estado = ? WHERE id_celda = ?').run(estado, id_celda);
}

export function update(id_celda: number, tipo_celda: TipoVehiculo, estado: EstadoCelda): void {
  const db = getDb();
  db.prepare('UPDATE celda SET tipo_celda = ?, estado = ? WHERE id_celda = ?').run(tipo_celda, estado, id_celda);
}

export function countTotal(): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as total FROM celda').get() as { total: number };
  return row.total;
}

export function countByEstado(estado: EstadoCelda): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as total FROM celda WHERE estado = ?').get(estado) as { total: number };
  return row.total;
}

export function countByTipoAndEstado(tipo_celda: TipoVehiculo, estado: EstadoCelda): number {
  const db = getDb();
  const row = db.prepare('SELECT COUNT(*) as total FROM celda WHERE tipo_celda = ? AND estado = ?')
    .get(tipo_celda, estado) as { total: number };
  return row.total;
}
