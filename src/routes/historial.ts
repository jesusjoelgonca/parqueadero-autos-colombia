import { Router } from 'express';
import * as historialController from '../controllers/historialController';

const router = Router();
router.get('/', historialController.index);
export default router;
