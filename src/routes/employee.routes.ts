import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
const router = Router();
const c = new EmployeeController();
router.get('/', c.getAll);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
export default router;
