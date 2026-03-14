import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'clave-jwt-cambiar-en-produccion';
const COOKIE_NAME = 'authToken';
const EXPIRES_IN = '24h'; // 24 horas

export interface JwtPayload {
  userId: number;
  nombre: string;
  rol: string;
}

export function sign(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verify(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export const cookieName = COOKIE_NAME;
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
  sameSite: 'lax' as const,
};
