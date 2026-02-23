import { Request, Response } from 'express';
import * as registroModel from '../models/RegistroEntradaSalida';
import * as celdaModel from '../models/Celda';

const PAGE_SIZE = 10;

export function index(req: Request, res: Response): void {
  const tipo = (req.query.tipo as string) || 'Todos';
  let pagina = Math.max(1, parseInt(String(req.query.page), 10) || 1);

  const listaCompleta = registroModel.getEstacionados(tipo);
  const totalVehiculos = listaCompleta.length;
  const totalPaginas = Math.max(1, Math.ceil(totalVehiculos / PAGE_SIZE));
  pagina = Math.min(pagina, totalPaginas);

  const desde = totalVehiculos === 0 ? 0 : (pagina - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(pagina * PAGE_SIZE, totalVehiculos);
  const lista = listaCompleta.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const totalCeldas = celdaModel.countTotal();
  const disponibles = celdaModel.countByEstado('Disponible');
  const carros = listaCompleta.filter((v) => v.tipo_vehiculo === 'Carro').length;
  const motos = listaCompleta.filter((v) => v.tipo_vehiculo === 'Moto').length;
  const porcentaje = totalCeldas > 0 ? Math.round((disponibles / totalCeldas) * 100) : 0;

  res.render('estacionados/index', {
    title: 'Vehículos Estacionados',
    active: 'estacionados',
    lista,
    totalCeldas,
    disponibles,
    porcentaje,
    carros,
    motos,
    tipoFiltro: tipo,
    paginaActual: pagina,
    totalPaginas,
    totalVehiculos,
    desde,
    hasta,
    pageSize: PAGE_SIZE,
  });
}
