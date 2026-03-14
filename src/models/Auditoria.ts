import { getDb } from '../config/database';

export function registrar(accion: string, id_usuario_actor: number, id_usuario_afectado?: number, detalles?: string): void {
  const db = getDb();
  db.prepare(
    'INSERT INTO log_auditoria (accion, id_usuario_afectado, id_usuario_actor, detalles) VALUES (?, ?, ?, ?)'
  ).run(accion, id_usuario_afectado ?? null, id_usuario_actor, detalles ?? null);
}
