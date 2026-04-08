import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';
const router = Router();
const c = new WarehouseController();
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
