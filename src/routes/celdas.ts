import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import * as celdasController from '../controllers/celdasController';

const router = Router();

router.get('/', celdasController.index);
router.get('/reporte', celdasController.getReporte);
router.get('/nueva', requireAdmin, celdasController.getNueva);
router.post('/nueva', requireAdmin, celdasController.postNueva);
router.get('/editar/:id', requireAdmin, celdasController.getEditar);
router.post('/editar/:id', requireAdmin, celdasController.postEditar);
router.post('/:id/desactivar', requireAdmin, celdasController.postDesactivar);

export default router;
