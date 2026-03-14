export type RolUsuario = 'Propietario' | 'Operador' | 'Administrador';
export type TipoVehiculo = 'Carro' | 'Moto';
export type EstadoCelda = 'Disponible' | 'Ocupada' | 'Inactiva';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  cedula: string | null;
  telefono: string | null;
  email: string | null;
  login: string | null;
  password_hash: string | null;
  rol: RolUsuario;
  fecha_registro: string | null;
  activo?: number | null;
}

export interface Vehiculo {
  id_vehiculo: number;
  placa: string;
  tipo_vehiculo: TipoVehiculo;
  marca: string | null;
  color: string | null;
  id_usuario: number;
}

export interface Celda {
  id_celda: number;
  numero_celda: string;
  tipo_celda: TipoVehiculo;
  estado: EstadoCelda;
}

export interface RegistroEntradaSalida {
  id_registro: number;
  fecha_entrada: string;
  hora_entrada: string;
  fecha_salida: string | null;
  hora_salida: string | null;
  tiempo_permanencia: string | null;
  id_vehiculo: number;
  id_celda: number;
}

export interface SessionUser {
  userId: number;
  nombre: string;
  rol: RolUsuario;
}

export interface AuthUser {
  userId: number;
  nombre: string;
  rol: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
    interface SessionData {
      user?: SessionUser;
    }
  }
}
