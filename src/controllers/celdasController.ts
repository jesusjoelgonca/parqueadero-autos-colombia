import { Request, Response } from 'express';
import * as celdaModel from '../models/Celda';
import type { TipoVehiculo, EstadoCelda } from '../types';

function formatFechaHora(d: Date): string {
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const h = d.getHours();
  const m = d.getMinutes();
  return `${day}/${month}/${year} — ${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getReporte(req: Request, res: Response): void {
  const total = celdaModel.countTotal();
  const disponibles = celdaModel.countByEstado('Disponible');
  const ocupadas = celdaModel.countByEstado('Ocupada');
  const inactivas = celdaModel.countByEstado('Inactiva');

  const carroTotal = celdaModel.findAll('Carro').length;
  const carroDisponibles = celdaModel.countByTipoAndEstado('Carro', 'Disponible');
  const carroOcupadas = celdaModel.countByTipoAndEstado('Carro', 'Ocupada');
  const carroInactivas = celdaModel.countByTipoAndEstado('Carro', 'Inactiva');

  const motoTotal = celdaModel.findAll('Moto').length;
  const motoDisponibles = celdaModel.countByTipoAndEstado('Moto', 'Disponible');
  const motoOcupadas = celdaModel.countByTipoAndEstado('Moto', 'Ocupada');
  const motoInactivas = celdaModel.countByTipoAndEstado('Moto', 'Inactiva');

  const disponibilidadGeneral = total > 0 ? Math.round((disponibles / total) * 100) : 0;
  const carroDisponibilidad = carroTotal > 0 ? Math.round((carroDisponibles / carroTotal) * 100) : 0;
  const motoDisponibilidad = motoTotal > 0 ? Math.round((motoDisponibles / motoTotal) * 100) : 0;

  const carroPctD = carroTotal > 0 ? Math.round((carroDisponibles / carroTotal) * 100) : 0;
  const carroPctO = carroTotal > 0 ? Math.round((carroOcupadas / carroTotal) * 100) : 0;
  const carroPctI = carroTotal > 0 ? Math.round((carroInactivas / carroTotal) * 100) : 0;
  const motoPctD = motoTotal > 0 ? Math.round((motoDisponibles / motoTotal) * 100) : 0;
  const motoPctO = motoTotal > 0 ? Math.round((motoOcupadas / motoTotal) * 100) : 0;
  const motoPctI = motoTotal > 0 ? Math.round((motoInactivas / motoTotal) * 100) : 0;

  const ahora = new Date();

  res.render('celdas/reporte', {
    title: 'Reporte de Ocupación de Celdas',
    active: 'reportes',
    total,
    disponibles,
    ocupadas,
    inactivas,
    disponibilidadGeneral,
    carroTotal,
    carroDisponibles,
    carroOcupadas,
    carroInactivas,
    carroDisponibilidad,
    carroPctD,
    carroPctO,
    carroPctI,
    motoTotal,
    motoDisponibles,
    motoOcupadas,
    motoInactivas,
    motoDisponibilidad,
    motoPctD,
    motoPctO,
    motoPctI,
    ultimaActualizacion: formatFechaHora(ahora),
  });
}

export function index(req: Request, res: Response): void {
  const tipo = (req.query.tipo as string) || '';
  const estado = (req.query.estado as string) || '';
  const filtroTipo = tipo === 'Carro' || tipo === 'Moto' ? (tipo as TipoVehiculo) : undefined;
  const filtroEstado = estado === 'Disponible' || estado === 'Ocupada' || estado === 'Inactiva' ? (estado as EstadoCelda) : undefined;

  const celdas = celdaModel.findAll(filtroTipo, filtroEstado);
  const total = celdaModel.countTotal();
  const disponibles = celdaModel.countByEstado('Disponible');
  const ocupadas = celdaModel.countByEstado('Ocupada');
  const inactivas = celdaModel.countByEstado('Inactiva');

  res.render('celdas/index', {
    title: 'Gestionar Celdas',
    active: 'celdas',
    celdas,
    total,
    disponibles,
    ocupadas,
    inactivas,
    filtroTipo: tipo || 'Todos',
    filtroEstado: estado || 'Todos',
    mensaje: (req.query.mensaje as string) || null,
    error: (req.query.error as string) || null,
  });
}

export function getNueva(req: Request, res: Response): void {
  res.render('celdas/nueva', {
    title: 'Nueva Celda',
    active: 'celdas',
    error: null,
  });
}

export function postNueva(req: Request, res: Response): void {
  const numero = (req.body.numero_celda as string)?.trim();
  const tipo = req.body.tipo_celda as string;

  if (!numero || (tipo !== 'Carro' && tipo !== 'Moto')) {
    res.render('celdas/nueva', {
      title: 'Nueva Celda',
      active: 'celdas',
      error: 'Indique el número de celda y el tipo (Carro o Moto).',
    });
    return;
  }

  if (celdaModel.findByNumero(numero)) {
    res.render('celdas/nueva', {
      title: 'Nueva Celda',
      active: 'celdas',
      error: 'Ya existe una celda con ese número. El número de celda no puede duplicarse.',
    });
    return;
  }

  celdaModel.create(numero, tipo as TipoVehiculo);
  res.redirect('/celdas?mensaje=' + encodeURIComponent('Celda registrada correctamente. Queda en estado Disponible.'));
}

export function getEditar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const celda = celdaModel.findById(id);
  if (!celda) {
    res.redirect('/celdas?error=' + encodeURIComponent('Celda no encontrada.'));
    return;
  }
  res.render('celdas/editar', {
    title: 'Editar Celda',
    active: 'celdas',
    celda,
    error: null,
  });
}

export function postEditar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const celda = celdaModel.findById(id);
  if (!celda) {
    res.redirect('/celdas?error=' + encodeURIComponent('Celda no encontrada.'));
    return;
  }

  const tipo = req.body.tipo_celda as string;
  const estado = req.body.estado as string;

  if (tipo !== 'Carro' && tipo !== 'Moto') {
    res.render('celdas/editar', {
      title: 'Editar Celda',
      active: 'celdas',
      celda,
      error: 'Seleccione tipo Carro o Moto.',
    });
    return;
  }
  if (estado !== 'Disponible' && estado !== 'Ocupada' && estado !== 'Inactiva') {
    res.render('celdas/editar', {
      title: 'Editar Celda',
      active: 'celdas',
      celda,
      error: 'Seleccione un estado válido.',
    });
    return;
  }

  if (celda.estado === 'Ocupada' && estado === 'Inactiva') {
    res.render('celdas/editar', {
      title: 'Editar Celda',
      active: 'celdas',
      celda,
      error: 'No se puede desactivar una celda ocupada. Registre primero la salida del vehículo.',
    });
    return;
  }

  celdaModel.update(id, tipo as TipoVehiculo, estado as EstadoCelda);
  res.redirect('/celdas?mensaje=' + encodeURIComponent('Celda actualizada correctamente.'));
}

export function postDesactivar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const celda = celdaModel.findById(id);
  if (!celda) {
    res.redirect('/celdas?error=' + encodeURIComponent('Celda no encontrada.'));
    return;
  }
  if (celda.estado === 'Ocupada') {
    res.redirect('/celdas?error=' + encodeURIComponent('No se puede desactivar una celda ocupada. Libérela primero desde Registrar Salida.'));
    return;
  }
  if (celda.estado === 'Inactiva') {
    res.redirect('/celdas?mensaje=' + encodeURIComponent('La celda ya está inactiva.'));
    return;
  }
  celdaModel.updateEstado(id, 'Inactiva');
  res.redirect('/celdas?mensaje=' + encodeURIComponent('Celda desactivada. No aparecerá como disponible en entradas.'));
}
