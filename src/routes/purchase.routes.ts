import { Router } from 'express';
import { PurchaseController } from '../controllers/purchase.controller';
const router = Router();
const c = new PurchaseController();
router.get('/', c.getAll);
router.post('/', c.create);
router.delete('/:id', c.remove);
export default router;
