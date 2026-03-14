import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as usuarioModel from '../models/Usuario';
import * as auditoriaModel from '../models/Auditoria';
import type { RolUsuario } from '../types';

const MIN_PASSWORD_LENGTH = 8;
const PAGE_SIZE = 10;

function formatFechaDDMMYYYY(fecha: string | null): string {
  if (!fecha) return '-';
  const d = new Date(fecha);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function index(req: Request, res: Response): void {
  const buscar = (req.query.buscar as string) || '';
  let pagina = Math.max(1, parseInt(String(req.query.page), 10) || 1);

  const listaCompleta = usuarioModel.findAllStaff(undefined, buscar.trim() || undefined);
  const totalUsuarios = listaCompleta.length;
  const totalPaginas = Math.max(1, Math.ceil(totalUsuarios / PAGE_SIZE));
  pagina = Math.min(pagina, totalPaginas);

  const desde = totalUsuarios === 0 ? 0 : (pagina - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(pagina * PAGE_SIZE, totalUsuarios);
  const lista = listaCompleta.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE).map((u) => ({
    ...u,
    estado: u.activo ? 'Activo' : 'Inactivo',
  }));

  res.render('usuarios/index', {
    title: 'Gestión de Usuarios',
    active: 'usuarios',
    lista,
    totalUsuarios,
    buscar,
    paginaActual: pagina,
    totalPaginas,
    desde,
    hasta,
    pageSize: PAGE_SIZE,
    mensaje: (req.query.mensaje as string) || null,
  });
}

function getUsuariosRedirect(query?: Record<string, string>): string {
  const params = new URLSearchParams();
  if (query?.buscar) params.set('buscar', query.buscar);
  if (query?.page) params.set('page', query.page);
  const q = params.toString();
  return '/usuarios' + (q ? '?' + q : '');
}

export function postDesactivar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  if (req.user?.userId === id) {
    const base = getUsuariosRedirect(req.query as Record<string, string>);
    res.redirect(base + (base.includes('?') ? '&' : '?') + 'mensaje=' + encodeURIComponent('No puede desactivar su propio usuario.'));
    return;
  }
  const usuario = usuarioModel.findById(id);
  usuarioModel.updateActivo(id, 0);
  const idActor = req.user?.userId;
  if (idActor && usuario) {
    auditoriaModel.registrar(
      'DESACTIVAR_USUARIO',
      idActor,
      id,
      `Usuario desactivado: ${usuario.nombre} (${usuario.cedula || 'sin cédula'}). No podrá iniciar sesión.`
    );
  }
  const base = getUsuariosRedirect(req.query as Record<string, string>);
  res.redirect(base + (base.includes('?') ? '&' : '?') + 'mensaje=' + encodeURIComponent('Usuario desactivado. No podrá iniciar sesión hasta que sea activado de nuevo.'));
}

export function postActivar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const usuario = usuarioModel.findById(id);
  usuarioModel.updateActivo(id, 1);
  const idActor = req.user?.userId;
  if (idActor && usuario) {
    auditoriaModel.registrar(
      'ACTIVAR_USUARIO',
      idActor,
      id,
      `Usuario activado: ${usuario.nombre} (${usuario.cedula || 'sin cédula'}).`
    );
  }
  const base = getUsuariosRedirect(req.query as Record<string, string>);
  res.redirect(base + (base.includes('?') ? '&' : '?') + 'mensaje=' + encodeURIComponent('Usuario activado.'));
}

export function getEditar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const usuario = usuarioModel.findById(id);
  if (!usuario || (usuario.rol !== 'Operador' && usuario.rol !== 'Administrador')) {
    res.redirect('/usuarios?mensaje=' + encodeURIComponent('Usuario no encontrado.'));
    return;
  }
  res.render('usuarios/registrar', {
    title: 'Editar Usuario',
    active: 'usuarios',
    editar: true,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      telefono: usuario.telefono,
      email: usuario.email,
      rol: usuario.rol,
    },
    mensaje: null,
    error: null,
  });
}

export function postEditar(req: Request, res: Response): void {
  const id = parseInt(String(req.params.id), 10);
  const usuario = usuarioModel.findById(id);
  if (!usuario || (usuario.rol !== 'Operador' && usuario.rol !== 'Administrador')) {
    res.redirect('/usuarios?mensaje=' + encodeURIComponent('Usuario no encontrado.'));
    return;
  }

  const {
    nombre_completo,
    telefono,
    correo,
    password: contraseña,
    confirmar_password,
    rol,
  } = req.body as {
    nombre_completo?: string;
    telefono?: string;
    correo?: string;
    password?: string;
    confirmar_password?: string;
    rol?: string;
  };

  const nombre = nombre_completo?.trim();
  const email = correo?.trim();
  const rolValido = rol === 'Operador' || rol === 'Administrador' ? (rol as RolUsuario) : null;

  if (!nombre || !email || !rolValido) {
    res.render('usuarios/registrar', {
      title: 'Editar Usuario',
      active: 'usuarios',
      editar: true,
      usuario: { ...usuario, nombre: nombre || usuario.nombre, telefono: telefono ?? usuario.telefono, email: email || usuario.email, rol: rolValido || usuario.rol },
      mensaje: null,
      error: 'Complete nombre, correo y rol.',
    });
    return;
  }

  if (contraseña || confirmar_password) {
    if (contraseña && contraseña.length < MIN_PASSWORD_LENGTH) {
      res.render('usuarios/registrar', {
        title: 'Editar Usuario',
        active: 'usuarios',
        editar: true,
        usuario: { id_usuario: usuario.id_usuario, nombre, cedula: usuario.cedula, telefono: telefono ?? usuario.telefono, email, rol: rolValido },
        mensaje: null,
        error: `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
      });
      return;
    }
    if (contraseña !== confirmar_password) {
      res.render('usuarios/registrar', {
        title: 'Editar Usuario',
        active: 'usuarios',
        editar: true,
        usuario: { id_usuario: usuario.id_usuario, nombre, cedula: usuario.cedula, telefono: telefono ?? usuario.telefono, email, rol: rolValido },
        mensaje: null,
        error: 'La contraseña y su confirmación no coinciden.',
      });
      return;
    }
  }

  if (usuarioModel.findByEmailExcludingId(email, id)) {
    res.render('usuarios/registrar', {
      title: 'Editar Usuario',
      active: 'usuarios',
      editar: true,
      usuario: { id_usuario: usuario.id_usuario, nombre, cedula: usuario.cedula, telefono: telefono ?? usuario.telefono, email, rol: rolValido },
      mensaje: null,
      error: 'Ya existe otro usuario con ese correo electrónico.',
    });
    return;
  }

  try {
    const passwordHash = contraseña && contraseña.length >= MIN_PASSWORD_LENGTH ? bcrypt.hashSync(contraseña, 10) : null;
    usuarioModel.updateStaffUser(
      id,
      nombre,
      telefono?.trim() || null,
      email,
      rolValido as 'Operador' | 'Administrador',
      passwordHash ?? undefined
    );
    const idActor = req.user?.userId;
    if (idActor) {
      auditoriaModel.registrar('EDITAR_USUARIO', idActor, id, `Usuario ${usuario.nombre} (${usuario.cedula}) actualizado.`);
    }
    res.redirect('/usuarios?mensaje=' + encodeURIComponent('Usuario actualizado correctamente.'));
  } catch (e) {
    res.render('usuarios/registrar', {
      title: 'Editar Usuario',
      active: 'usuarios',
      editar: true,
      usuario: { id_usuario: usuario.id_usuario, nombre, cedula: usuario.cedula, telefono: telefono ?? usuario.telefono, email, rol: rolValido },
      mensaje: null,
      error: 'Error al actualizar. Intente de nuevo.',
    });
  }
}

export function getRegistrar(_req: Request, res: Response): void {
  res.render('usuarios/registrar', {
    title: 'Registrar Nuevo Usuario',
    active: 'usuarios',
    mensaje: null,
    error: null,
  });
}

export function postRegistrar(req: Request, res: Response): void {
  const {
    nombre_completo,
    cedula,
    telefono,
    correo,
    password: contraseña,
    confirmar_password,
    rol,
  } = req.body as {
    nombre_completo?: string;
    cedula?: string;
    telefono?: string;
    correo?: string;
    password?: string;
    confirmar_password?: string;
    rol?: string;
  };

  const nombre = nombre_completo?.trim();
  const cedulaTrim = cedula?.trim();
  const email = correo?.trim();
  const password = contraseña;
  const confirmPassword = confirmar_password;
  const rolValido = rol === 'Operador' || rol === 'Administrador' ? (rol as RolUsuario) : null;

  if (!nombre || !cedulaTrim || !email || !password || !rolValido) {
    res.render('usuarios/registrar', {
      title: 'Registrar Nuevo Usuario',
      active: 'usuarios',
      mensaje: null,
      error: 'Complete todos los campos obligatorios.',
    });
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    res.render('usuarios/registrar', {
      title: 'Registrar Nuevo Usuario',
      active: 'usuarios',
      mensaje: null,
      error: `La contraseña debe tener mínimo ${MIN_PASSWORD_LENGTH} caracteres.`,
    });
    return;
  }

  if (password !== confirmPassword) {
    res.render('usuarios/registrar', {
      title: 'Registrar Nuevo Usuario',
      active: 'usuarios',
      mensaje: null,
      error: 'La contraseña y su confirmación no coinciden.',
    });
    return;
  }

  if (usuarioModel.findByCedula(cedulaTrim)) {
    res.render('usuarios/registrar', {
      title: 'Registrar Nuevo Usuario',
      active: 'usuarios',
      mensaje: null,
      error: 'Ya existe un usuario registrado con esa cédula.',
    });
    return;
  }

  if (usuarioModel.findByEmail(email)) {
    res.render('usuarios/registrar', {
      title: 'Registrar Nuevo Usuario',
      active: 'usuarios',
      mensaje: null,
      error: 'Ya existe un usuario registrado con ese correo electrónico.',
    });
    return;
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    usuarioModel.createStaffUser(
      nombre,
      cedulaTrim,
      telefono?.trim() || null,
      email,
      passwordHash,
      rolValido as 'Operador' | 'Administrador'
    );
    res.redirect('/usuarios?mensaje=' + encodeURIComponent('Usuario registrado correctamente. Ya puede acceder al sistema con su correo y contraseña.'));
    return;
  } catch (e) {
    res.render('usuarios/registrar', {
      title: 'Registrar Nuevo Usuario',
      active: 'usuarios',
      mensaje: null,
      error: 'Error al registrar el usuario. Verifique que la cédula y el correo no estén en uso.',
    });
  }
}
