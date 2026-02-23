import { Request, Response } from 'express';
import * as registroModel from '../models/RegistroEntradaSalida';

function formatFechaDDMMYYYY(fecha: string): string {
  if (!fecha) return '';
  const [y, m, d] = fecha.split('-');
  return d && m && y ? `${d}/${m}/${y}` : fecha;
}

export function index(req: Request, res: Response): void {
  const placa = (req.query.placa as string)?.trim();
  const raw = placa ? registroModel.findActivoByPlaca(placa) ?? null : null;
  const vehiculo = raw
    ? {
        ...raw,
        fecha_entrada_formato: formatFechaDDMMYYYY(raw.fecha_entrada),
      }
    : null;
  res.render('busqueda/index', {
    title: 'Buscar Vehiculo por Placa',
    active: 'busqueda',
    placa: placa || '',
    vehiculo,
  });
}
