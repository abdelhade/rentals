import { Router } from 'express';
import { VoucherController } from '../controllers/voucher.controller';
const router = Router();
const c = new VoucherController();
router.get('/receipts', c.getAllReceipts);
router.post('/receipts', c.createReceipt);
router.get('/payments', c.getAllPayments);
router.post('/payments', c.createPayment);
export default router;
