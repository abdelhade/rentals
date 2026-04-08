import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
const router = Router();
const c = new ProductController();
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
