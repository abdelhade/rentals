import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
const router = Router();
const c = new CategoryController();
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
