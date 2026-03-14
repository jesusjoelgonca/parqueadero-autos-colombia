import { Router } from 'express';
import * as reportesController from '../controllers/reportesController';

const router = Router();

router.get('/', reportesController.index);

export default router;
