import { Router } from 'express';
import { requireAdmin } from '../middleware/auth';
import * as usuariosController from '../controllers/usuariosController';

const router = Router();

router.use(requireAdmin);

router.get('/', usuariosController.index);
router.get('/editar/:id', usuariosController.getEditar);
router.post('/editar/:id', usuariosController.postEditar);
router.get('/registrar', usuariosController.getRegistrar);
router.post('/registrar', usuariosController.postRegistrar);
router.post('/:id/desactivar', usuariosController.postDesactivar);
router.post('/:id/activar', usuariosController.postActivar);

export default router;
