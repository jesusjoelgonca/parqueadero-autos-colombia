import { Request, Response } from 'express';
import * as registroModel from '../models/RegistroEntradaSalida';
import * as celdaModel from '../models/Celda';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function nowTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

function calcularTiempo(horaEntrada: string, horaSalida: string, fechaEntrada: string, fechaSalida: string): string {
  const parseDate = (f: string, h: string) => {
    const [fd, fm, fa] = f.split(/[-/]/).map(Number);
    const am = h.toUpperCase().includes('AM');
    const match = h.match(/(\d+):(\d+)/);
    let ho = match ? parseInt(match[1], 10) : 0;
    const mi = match ? parseInt(match[2], 10) : 0;
    if (!am && ho !== 12) ho += 12;
    if (am && ho === 12) ho = 0;
    return new Date(fa, (fm || 1) - 1, fd || 1, ho, mi, 0).getTime();
  };
  const ms = parseDate(fechaSalida, horaSalida) - parseDate(fechaEntrada, horaEntrada);
  const min = Math.floor(ms / 60000);
  const horas = Math.floor(min / 60);
  const mins = min % 60;
  if (horas > 0) return `${horas}h ${mins}min`;
  return `${mins}min`;
}

export function getRegistrar(req: Request, res: Response): void {
  res.render('salida/registrar', {
    title: 'Registrar Salida',
    active: 'salida',
    placa: '',
    vehiculo: null,
    tiempoPermanencia: null,
    horaSalida: null,
    error: null,
    mensaje: null,
  });
}

export function postBuscar(req: Request, res: Response): void {
  const placa = (req.body.placa as string)?.trim();
  if (!placa) {
    res.render('salida/registrar', {
      title: 'Registrar Salida',
      active: 'salida',
      placa: '',
      vehiculo: null,
      tiempoPermanencia: null,
      horaSalida: null,
      error: 'Ingrese la placa del vehículo.',
      mensaje: null,
    });
    return;
  }
  const vehiculo = registroModel.findActivoByPlaca(placa);
  if (!vehiculo) {
    res.render('salida/registrar', {
      title: 'Registrar Salida',
      active: 'salida',
      placa,
      vehiculo: null,
      tiempoPermanencia: null,
      horaSalida: null,
      error: 'Vehículo no encontrado o no está dentro del parqueadero.',
      mensaje: null,
    });
    return;
  }
  const horaSalida = nowTime();
  const fechaSalida = today();
  const tiempoPermanencia = calcularTiempo(
    vehiculo.hora_entrada,
    horaSalida,
    vehiculo.fecha_entrada,
    fechaSalida
  );
  res.render('salida/registrar', {
    title: 'Registrar Salida',
    active: 'salida',
    placa,
    vehiculo,
    tiempoPermanencia,
    horaSalida,
    fechaSalida,
    error: null,
    mensaje: null,
  });
}

export function postConfirmarSalida(req: Request, res: Response): void {
  const { id_registro } = req.body as { id_registro?: string };
  if (!id_registro) {
    res.redirect('/salida/registrar');
    return;
  }
  const id = parseInt(id_registro, 10);
  const row = registroModel.getRegistroAbiertoById(id);
  if (!row) {
    res.render('salida/registrar', {
      title: 'Registrar Salida',
      placa: '',
      vehiculo: null,
      tiempoPermanencia: null,
      horaSalida: null,
      error: 'Registro no encontrado.',
      mensaje: null,
    });
    return;
  }
  const fechaSalida = today();
  const horaSalida = nowTime();
  const tiempoPermanencia = calcularTiempo(row.hora_entrada, horaSalida, row.fecha_entrada, fechaSalida);
  registroModel.registrarSalida(id, fechaSalida, horaSalida, tiempoPermanencia);
  celdaModel.updateEstado(row.id_celda, 'Disponible');
  res.render('salida/registrar', {
    title: 'Registrar Salida',
    active: 'salida',
    placa: '',
    vehiculo: null,
    tiempoPermanencia: null,
    horaSalida: null,
    error: null,
    mensaje: `[OK] Salida registrada exitosamente. La celda ${row.numero_celda} ha sido liberada.`,
  });
}
