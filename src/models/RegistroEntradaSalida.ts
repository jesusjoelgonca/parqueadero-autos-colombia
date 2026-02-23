import { getDb } from '../config/database';
import type { RegistroEntradaSalida as RegistroType } from '../types';

export function findActivoByPlaca(placa: string): (RegistroType & { placa: string; numero_celda: string; nombre_propietario: string; tipo_vehiculo: string }) | undefined {
  const db = getDb();
  const row = db.prepare(`
    SELECT r.*, v.placa, c.numero_celda, u.nombre as nombre_propietario, v.tipo_vehiculo
    FROM registro_entrada_salida r
    JOIN vehiculo v ON v.id_vehiculo = r.id_vehiculo
    JOIN celda c ON c.id_celda = r.id_celda
    JOIN usuario u ON u.id_usuario = v.id_usuario
    WHERE v.placa = ? AND r.fecha_salida IS NULL
  `).get(placa) as (RegistroType & { placa: string; numero_celda: string; nombre_propietario: string; tipo_vehiculo: string }) | undefined;
  return row;
}

export function createEntrada(id_vehiculo: number, id_celda: number, fecha_entrada: string, hora_entrada: string): number {
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO registro_entrada_salida (id_vehiculo, id_celda, fecha_entrada, hora_entrada) VALUES (?, ?, ?, ?)'
  ).run(id_vehiculo, id_celda, fecha_entrada, hora_entrada);
  return result.lastInsertRowid as number;
}

export function registrarSalida(
  id_registro: number,
  fecha_salida: string,
  hora_salida: string,
  tiempo_permanencia: string
): void {
  const db = getDb();
  db.prepare(
    'UPDATE registro_entrada_salida SET fecha_salida = ?, hora_salida = ?, tiempo_permanencia = ? WHERE id_registro = ?'
  ).run(fecha_salida, hora_salida, tiempo_permanencia, id_registro);
}

export function getEstacionados(tipo?: string): Array<{ id_registro: number; placa: string; tipo_vehiculo: string; numero_celda: string; hora_entrada: string; nombre_propietario: string }> {
  const db = getDb();
  let sql = `
    SELECT r.id_registro, v.placa, v.tipo_vehiculo, c.numero_celda, r.hora_entrada, u.nombre as nombre_propietario
    FROM registro_entrada_salida r
    JOIN vehiculo v ON v.id_vehiculo = r.id_vehiculo
    JOIN celda c ON c.id_celda = r.id_celda
    JOIN usuario u ON u.id_usuario = v.id_usuario
    WHERE r.fecha_salida IS NULL
  `;
  const params: (string | undefined)[] = [];
  if (tipo && tipo !== 'Todos') {
    sql += ' AND v.tipo_vehiculo = ?';
    params.push(tipo);
  }
  sql += ' ORDER BY r.hora_entrada';
  const rows = (params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as Array<{ id_registro: number; placa: string; tipo_vehiculo: string; numero_celda: string; hora_entrada: string; nombre_propietario: string }>;
  return rows;
}

export function getRegistroAbiertoById(id_registro: number): { id_celda: number; numero_celda: string; fecha_entrada: string; hora_entrada: string } | undefined {
  const db = getDb();
  const row = db.prepare(`
    SELECT r.id_registro, r.fecha_entrada, r.hora_entrada, c.id_celda, c.numero_celda
    FROM registro_entrada_salida r JOIN celda c ON c.id_celda = r.id_celda
    WHERE r.id_registro = ? AND r.fecha_salida IS NULL
  `).get(id_registro) as { id_celda: number; numero_celda: string; fecha_entrada: string; hora_entrada: string } | undefined;
  return row;
}

export function getHistorial(fechaInicio?: string, fechaFin?: string, placa?: string): Array<{
  id_registro: number; placa: string; fecha_entrada: string; hora_entrada: string;
  fecha_salida: string | null; hora_salida: string | null; numero_celda: string; tiempo_permanencia: string | null;
}> {
  const db = getDb();
  let sql = `
    SELECT r.id_registro, v.placa, r.fecha_entrada, r.hora_entrada, r.fecha_salida, r.hora_salida, c.numero_celda, r.tiempo_permanencia
    FROM registro_entrada_salida r
    JOIN vehiculo v ON v.id_vehiculo = r.id_vehiculo
    JOIN celda c ON c.id_celda = r.id_celda
    WHERE r.fecha_salida IS NOT NULL
  `;
  const params: (string | undefined)[] = [];
  if (fechaInicio) { sql += ' AND date(r.fecha_entrada) >= date(?)'; params.push(fechaInicio); }
  if (fechaFin) { sql += ' AND date(r.fecha_entrada) <= date(?)'; params.push(fechaFin); }
  if (placa && placa.trim()) { sql += ' AND v.placa LIKE ?'; params.push(`%${placa.trim()}%`); }
  sql += ' ORDER BY r.fecha_entrada DESC, r.hora_entrada DESC';
  const rows = (params.length ? db.prepare(sql).all(...params) : db.prepare(sql).all()) as Array<{
    id_registro: number; placa: string; fecha_entrada: string; hora_entrada: string;
    fecha_salida: string | null; hora_salida: string | null; numero_celda: string; tiempo_permanencia: string | null;
  }>;
  return rows;
}
