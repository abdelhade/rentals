import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const c = new UserController();

router.get('/', c.getAll);
router.get('/:id', c.getOne);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);

export default router;
