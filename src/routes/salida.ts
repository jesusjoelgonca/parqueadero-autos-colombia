import { Router } from 'express';
import * as salidaController from '../controllers/salidaController';

const router = Router();
router.get('/registrar', salidaController.getRegistrar);
router.post('/registrar/buscar', salidaController.postBuscar);
router.post('/registrar/confirmar', salidaController.postConfirmarSalida);
export default router;
