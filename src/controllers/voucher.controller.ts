import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class VoucherController {
  // ── Receipt (قبض من عميل) ──
  public getAllReceipts = async (req: Request, res: Response) => {
    try {
      const data = await prisma.receiptVoucher.findMany({ include: { customer: true }, orderBy: { createdAt: 'desc' } });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public createReceipt = async (req: Request, res: Response) => {
    try {
      const { customerId, amount, date, notes } = req.body;
      if (!customerId || !amount) return res.status(400).json({ success: false, message: 'customerId and amount are required' });
      const data = await prisma.$transaction(async (tx) => {
        const v = await tx.receiptVoucher.create({ data: { customerId, amount: +amount, date: date ? new Date(date) : new Date(), notes } });
        await tx.customer.update({ where: { id: customerId }, data: { balance: { increment: +amount } } });
        return v;
      });
      return res.status(201).json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  // ── Payment (دفع لمورد) ──
  public getAllPayments = async (req: Request, res: Response) => {
    try {
      const data = await prisma.paymentVoucher.findMany({ include: { supplier: true }, orderBy: { createdAt: 'desc' } });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public createPayment = async (req: Request, res: Response) => {
    try {
      const { supplierId, amount, date, notes } = req.body;
      if (!supplierId || !amount) return res.status(400).json({ success: false, message: 'supplierId and amount are required' });
      const data = await prisma.$transaction(async (tx) => {
        const v = await tx.paymentVoucher.create({ data: { supplierId, amount: +amount, date: date ? new Date(date) : new Date(), notes } });
        await tx.supplier.update({ where: { id: supplierId }, data: { balance: { increment: +amount } } });
        return v;
      });
      return res.status(201).json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };
}
