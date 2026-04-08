import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
const router = Router();
const c = new SaleController();
router.get('/', c.getAll);
router.post('/', c.create);
router.delete('/:id', c.remove);
export default router;
