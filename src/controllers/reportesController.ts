import { Request, Response } from 'express';

export function index(req: Request, res: Response): void {
  res.render('reportes/index', {
    title: 'Reportes',
    active: 'reportes',
  });
}
