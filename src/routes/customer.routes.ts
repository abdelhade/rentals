import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
const router = Router();
const c = new CustomerController();
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
