import { Router } from 'express';
import * as busquedaController from '../controllers/busquedaController';

const router = Router();
router.get('/', busquedaController.index);
export default router;
