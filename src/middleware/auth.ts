import { Request, Response, NextFunction } from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.user) {
    next();
    return;
  }
  res.redirect('/auth/login');
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.rol === 'Administrador') {
    next();
    return;
  }
  res.redirect('/estacionados');
}
