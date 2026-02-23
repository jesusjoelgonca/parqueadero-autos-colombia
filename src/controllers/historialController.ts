import { Request, Response } from 'express';
import * as registroModel from '../models/RegistroEntradaSalida';

const PAGE_SIZE = 10;

function formatFechaDDMMYYYY(fecha: string | null): string {
  if (!fecha) return '-';
  const [y, m, d] = fecha.split('-');
  return d && m && y ? `${d}/${m}/${y}` : fecha;
}

export function index(req: Request, res: Response): void {
  const fechaInicio = (req.query.fechaInicio as string) || '';
  const fechaFin = (req.query.fechaFin as string) || '';
  const placa = (req.query.placa as string) || '';
  let pagina = Math.max(1, parseInt(String(req.query.page), 10) || 1);

  const listaCompleta = registroModel.getHistorial(
    fechaInicio || undefined,
    fechaFin || undefined,
    placa || undefined
  );
  const totalRegistros = listaCompleta.length;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / PAGE_SIZE));
  pagina = Math.min(pagina, totalPaginas);

  const slice = listaCompleta.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);
  const registros = slice.map((r) => ({
    ...r,
    fecha_entrada_f: formatFechaDDMMYYYY(r.fecha_entrada),
    fecha_salida_f: formatFechaDDMMYYYY(r.fecha_salida),
  }));

  const periodo =
    fechaInicio && fechaFin
      ? `${fechaInicio.slice(8, 10)}/${fechaInicio.slice(5, 7)} - ${fechaFin.slice(8, 10)}/${fechaFin.slice(5, 7)}`
      : '';

  const desde = totalRegistros === 0 ? 0 : (pagina - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(pagina * PAGE_SIZE, totalRegistros);

  res.render('historial/index', {
    title: 'Historial de Entradas y Salidas',
    active: 'historial',
    registros,
    totalRegistros,
    periodo,
    fechaInicio,
    fechaFin,
    placa,
    paginaActual: pagina,
    totalPaginas,
    desde,
    hasta,
    pageSize: PAGE_SIZE,
  });
}
