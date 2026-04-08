import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class ItemRentalController {

  public getAll = async (req: Request, res: Response) => {
    try {
      const data = await prisma.rentalItem.findMany({
        include: {
          product: { include: { category: true } },
          suitItem: { include: { suitModel: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { customerId, employeeId, startDate, endDate, notes, items } = req.body;

      if (!customerId || !startDate || !endDate || !items?.length)
        return res.status(400).json({ success: false, message: 'customerId, startDate, endDate, items مطلوبة' });

      const start = new Date(startDate);
      const end   = new Date(endDate);
      if (end <= start) return res.status(400).json({ success: false, message: 'تاريخ النهاية يجب أن يكون بعد البداية' });

      const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

      // build rental items with totals
      const rentalItems = items.map((i: any) => ({
        productId:  i.productId  || null,
        suitItemId: i.suitItemId || null,
        startDate:  start,
        endDate:    end,
        dailyRate:  +i.dailyRate || 0,
        total:      (+i.dailyRate || 0) * days * (+i.qty || 1),
        status:     'ACTIVE'
      }));

      // validate — each item needs at least one of productId or suitItemId
      for (const ri of rentalItems) {
        if (!ri.productId && !ri.suitItemId)
          return res.status(400).json({ success: false, message: 'كل صنف يحتاج productId أو suitItemId' });
      }

      const created = await prisma.$transaction(
        rentalItems.map((ri: any) => prisma.rentalItem.create({ data: ri }))
      );

      return res.status(201).json({ success: true, data: created, days });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      const allowed = ['ACTIVE', 'RETURNED', 'OVERDUE'];
      if (!allowed.includes(status))
        return res.status(400).json({ success: false, message: 'حالة غير صحيحة' });

      const data = await prisma.rentalItem.update({
        where: { id: req.params.id },
        data: { status }
      });
      return res.json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'غير موجود' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.rentalItem.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'تم الحذف' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'غير موجود' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
