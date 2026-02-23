import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import authRoutes from './auth';
import entradaRoutes from './entrada';
import salidaRoutes from './salida';
import estacionadosRoutes from './estacionados';
import busquedaRoutes from './busqueda';
import historialRoutes from './historial';

const router = Router();

router.use('/auth', authRoutes);

router.use(requireAuth);
router.use('/entrada', entradaRoutes);
router.use('/salida', salidaRoutes);
router.use('/estacionados', estacionadosRoutes);
router.use('/busqueda', busquedaRoutes);
router.use('/historial', requireAdmin, historialRoutes);

export default router;
