import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
const router = Router();
const c = new ReportController();
router.get('/summary', c.getSummary);
router.get('/stock', c.getStock);
export default router;
