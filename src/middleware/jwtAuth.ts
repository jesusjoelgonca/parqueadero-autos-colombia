import { Request, Response, NextFunction } from 'express';
import { verify, cookieName } from '../config/jwt';

export function attachUserFromJwt(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.[cookieName];
  if (token) {
    const payload = verify(token);
    if (payload) {
      req.user = { userId: payload.userId, nombre: payload.nombre, rol: payload.rol };
    }
  }
  next();
}
