import { Request, Response } from 'express';
import * as usuarioModel from '../models/Usuario';
import * as vehiculoModel from '../models/Vehiculo';
import * as celdaModel from '../models/Celda';
import * as registroModel from '../models/RegistroEntradaSalida';
import type { TipoVehiculo } from '../types';

function today(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function nowTime(): string {
  const d = new Date();
  const h = d.getHours();
  const m = d.getMinutes();
  const am = h < 12;
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
}

export function getRegistrar(req: Request, res: Response): void {
  const celdasCarro = celdaModel.findAllByTipo('Carro');
  const celdasMoto = celdaModel.findAllByTipo('Moto');
  res.render('entrada/registrar', {
    title: 'Registrar Entrada',
    active: 'entrada',
    celdasCarro,
    celdasMoto,
    mensaje: null,
    error: null,
  });
}

export function postRegistrar(req: Request, res: Response): void {
  const { placa, tipo_vehiculo, nombre_propietario, id_celda } = req.body as {
    placa?: string;
    tipo_vehiculo?: TipoVehiculo;
    nombre_propietario?: string;
    id_celda?: string;
  };
  const celdasCarro = celdaModel.findAllByTipo('Carro');
  const celdasMoto = celdaModel.findAllByTipo('Moto');

  if (!placa?.trim() || !tipo_vehiculo || !nombre_propietario?.trim() || !id_celda) {
    res.render('entrada/registrar', {
      title: 'Registrar Entrada',
      active: 'entrada',
      celdasCarro,
      celdasMoto,
      mensaje: null,
      error: 'Complete todos los campos y seleccione una celda.',
    });
    return;
  }

  const activo = registroModel.findActivoByPlaca(placa.trim());
  if (activo) {
    res.render('entrada/registrar', {
      title: 'Registrar Entrada',
      active: 'entrada',
      celdasCarro,
      celdasMoto,
      mensaje: null,
      error: 'La placa ya está registrada como vehículo dentro del parqueadero.',
    });
    return;
  }

  const idCeldaNum = parseInt(id_celda, 10);
  const celda = celdaModel.findById(idCeldaNum);
  if (!celda || celda.estado !== 'Disponible') {
    res.render('entrada/registrar', {
      title: 'Registrar Entrada',
      active: 'entrada',
      celdasCarro,
      celdasMoto,
      mensaje: null,
      error: 'Celda no disponible. Seleccione otra.',
    });
    return;
  }

  if (tipo_vehiculo === 'Carro' && celda.tipo_celda !== 'Carro') {
    res.render('entrada/registrar', {
      title: 'Registrar Entrada',
      active: 'entrada',
      celdasCarro,
      celdasMoto,
      mensaje: null,
      error: 'La celda seleccionada no corresponde al tipo de vehículo.',
    });
    return;
  }

  try {
    const { id_usuario } = usuarioModel.findOrCreatePropietario(nombre_propietario.trim());
    const { id_vehiculo } = vehiculoModel.findOrCreate(placa.trim(), tipo_vehiculo, id_usuario);
    const fecha = today();
    const hora = nowTime();
    registroModel.createEntrada(id_vehiculo, idCeldaNum, fecha, hora);
    celdaModel.updateEstado(idCeldaNum, 'Ocupada');
    res.render('entrada/registrar', {
      title: 'Registrar Entrada',
      active: 'entrada',
      celdasCarro: celdaModel.findAllByTipo('Carro'),
      celdasMoto: celdaModel.findAllByTipo('Moto'),
      mensaje: `[OK] Vehiculo registrado exitosamente en la celda ${celda.numero_celda}.`,
      error: null,
    });
  } catch (e) {
    res.render('entrada/registrar', {
      title: 'Registrar Entrada',
      active: 'entrada',
      celdasCarro,
      celdasMoto,
      mensaje: null,
      error: 'Error al registrar. Intente de nuevo.',
    });
  }
}
