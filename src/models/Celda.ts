import { getDb } from '../config/database';
import type { Celda as CeldaType, TipoVehiculo, EstadoCelda } from '../types';

export function findDisponiblesByTipo(tipo_celda: TipoVehiculo): CeldaType[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM celda WHERE tipo_celda = ? AND estado = ? ORDER BY numero_celda')
    .all(tipo_celda, 'Disponible') as CeldaType[];
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
