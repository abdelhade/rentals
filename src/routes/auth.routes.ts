import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const c = new AuthController();

router.post('/login', c.login);

// ADMIN only routes
router.post('/register', authenticate, authorize('ADMIN'), c.register);
router.get('/users', authenticate, authorize('ADMIN'), c.getAll);
router.put('/users/:id', authenticate, authorize('ADMIN'), c.update);
router.delete('/users/:id', authenticate, authorize('ADMIN'), c.remove);

// Any authenticated user
router.get('/me', authenticate, c.me);

export default router;
