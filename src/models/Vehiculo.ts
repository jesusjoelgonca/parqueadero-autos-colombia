import { getDb } from '../config/database';
import type { Vehiculo as VehiculoType, TipoVehiculo } from '../types';

export function findByPlaca(placa: string): VehiculoType | undefined {
  const db = getDb();
  const row = db.prepare('SELECT * FROM vehiculo WHERE placa = ?').get(placa) as VehiculoType | undefined;
  return row;
}

export function create(placa: string, tipo_vehiculo: TipoVehiculo, id_usuario: number, marca?: string, color?: string): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO vehiculo (placa, tipo_vehiculo, id_usuario, marca, color) VALUES (?, ?, ?, ?, ?)'
  ).run(placa, tipo_vehiculo, id_usuario, marca ?? null, color ?? null);
  return result.lastInsertRowid as number;
}

export function findOrCreate(placa: string, tipo_vehiculo: TipoVehiculo, id_usuario: number): { id_vehiculo: number } {
  const existing = findByPlaca(placa);
  if (existing) return { id_vehiculo: existing.id_vehiculo };
  const id = create(placa, tipo_vehiculo, id_usuario);
  return { id_vehiculo: id };
}
