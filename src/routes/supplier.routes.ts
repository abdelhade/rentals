import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller';
const router = Router();
const c = new SupplierController();
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
