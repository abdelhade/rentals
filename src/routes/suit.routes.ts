import { Router } from 'express';
import { SuitController } from '../controllers/suit.controller';

const router = Router();
const suitController = new SuitController();

router.get('/', suitController.getAllSuits);

export default router;
