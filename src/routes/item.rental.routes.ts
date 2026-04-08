import { Router } from 'express';
import { ItemRentalController } from '../controllers/item.rental.controller';
const router = Router();
const c = new ItemRentalController();
router.get('/',          c.getAll);
router.post('/',         c.create);
router.put('/:id/status', c.updateStatus);
router.delete('/:id',    c.remove);
export default router;
