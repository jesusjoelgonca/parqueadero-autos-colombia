import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import authRoutes from './auth';
import entradaRoutes from './entrada';
import salidaRoutes from './salida';
import estacionadosRoutes from './estacionados';
import busquedaRoutes from './busqueda';
import historialRoutes from './historial';
import reportesRoutes from './reportes';
import usuariosRoutes from './usuarios';
import celdasRoutes from './celdas';

const router = Router();

router.use('/auth', authRoutes);

router.use(requireAuth);
router.use('/entrada', entradaRoutes);
router.use('/salida', salidaRoutes);
router.use('/estacionados', estacionadosRoutes);
router.use('/busqueda', busquedaRoutes);
router.use('/historial', requireAdmin, historialRoutes);
router.use('/reportes', reportesRoutes);
router.use('/celdas', celdasRoutes);
router.use('/usuarios', usuariosRoutes);

export default router;
