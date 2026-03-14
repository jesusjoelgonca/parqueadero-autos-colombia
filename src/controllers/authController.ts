import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as usuarioModel from '../models/Usuario';
import { sign, cookieName, cookieOptions } from '../config/jwt';
import type { RolUsuario } from '../types';

export function getLogin(req: Request, res: Response): void {
  if (req.user) {
    res.redirect(req.user.rol === 'Administrador' ? '/usuarios' : '/estacionados');
    return;
  }
  res.render('auth/login', { title: 'Login', error: null });
}

export function postLogin(req: Request, res: Response): void {
  const { correo, password } = req.body as { correo?: string; password?: string };
  if (!correo?.trim() || !password) {
    res.render('auth/login', { title: 'Login', error: 'Ingrese correo electrónico y contraseña.' });
    return;
  }
  const user = usuarioModel.findByLoginOrEmail(correo.trim());
  if (!user || !user.password_hash) {
    res.render('auth/login', { title: 'Login', error: 'Correo o contraseña incorrectos.' });
    return;
  }
  const rol = user.rol as RolUsuario;
  if (rol !== 'Operador' && rol !== 'Administrador') {
    res.render('auth/login', { title: 'Login', error: 'No tiene permiso para acceder.' });
    return;
  }
  if (user.activo === 0) {
    res.render('auth/login', { title: 'Login', error: 'La cuenta está deshabilitada. Contacte al administrador.' });
    return;
  }
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    res.render('auth/login', { title: 'Login', error: 'Correo o contraseña incorrectos.' });
    return;
  }
  const token = sign({ userId: user.id_usuario, nombre: user.nombre, rol });
  res.cookie(cookieName, token, cookieOptions);
  res.redirect(rol === 'Administrador' ? '/usuarios' : '/estacionados');
}

export function postLogout(req: Request, res: Response): void {
  res.clearCookie(cookieName, { path: '/' });
  res.redirect('/auth/login');
}
