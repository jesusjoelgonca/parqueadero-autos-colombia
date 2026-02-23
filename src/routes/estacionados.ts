import { Router } from 'express';
import * as estacionadosController from '../controllers/estacionadosController';

const router = Router();
router.get('/', estacionadosController.index);
export default router;
