import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as usuarioModel from '../models/Usuario';
import type { RolUsuario } from '../types';

export function getLogin(_req: Request, res: Response): void {
  if (_req.session?.user) {
    res.redirect('/estacionados');
    return;
  }
  res.render('auth/login', { title: 'Login', error: null });
}

export function postLogin(req: Request, res: Response): void {
  const { login, password } = req.body as { login?: string; password?: string };
  if (!login || !password) {
    res.render('auth/login', { title: 'Login', error: 'Ingrese usuario y contraseña.' });
    return;
  }
  const user = usuarioModel.findByLogin(login.trim());
  if (!user || !user.password_hash) {
    res.render('auth/login', { title: 'Login', error: 'Usuario o contraseña incorrectos.' });
    return;
  }
  const rol = user.rol as RolUsuario;
  if (rol !== 'Operador' && rol !== 'Administrador') {
    res.render('auth/login', { title: 'Login', error: 'No tiene permiso para acceder.' });
    return;
  }
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    res.render('auth/login', { title: 'Login', error: 'Usuario o contraseña incorrectos.' });
    return;
  }
  req.session!.user = { userId: user.id_usuario, nombre: user.nombre, rol };
  res.redirect('/estacionados');
}

export function postLogout(req: Request, res: Response): void {
  req.session?.destroy(() => {});
  res.redirect('/auth/login');
}
