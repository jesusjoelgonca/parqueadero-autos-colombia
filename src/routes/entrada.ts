import { Router } from 'express';
import * as entradaController from '../controllers/entradaController';

const router = Router();
router.get('/registrar', entradaController.getRegistrar);
router.post('/registrar', entradaController.postRegistrar);
export default router;
