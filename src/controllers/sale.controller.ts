import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class SaleController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const data = await prisma.sale.findMany({
        include: { customer: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { customerId, date, paid, notes, items } = req.body;
      if (!customerId || !items?.length) return res.status(400).json({ success: false, message: 'customerId and items are required' });

      const total = items.reduce((s: number, i: any) => s + i.qty * i.unitPrice, 0);

      const sale = await prisma.$transaction(async (tx) => {
        const s = await tx.sale.create({
          data: {
            customerId, date: date ? new Date(date) : new Date(),
            total, paid: +paid || 0,
            status: +paid >= total ? 'PAID' : +paid > 0 ? 'PARTIAL' : 'PENDING',
            notes,
            items: {
              create: items.map((i: any) => ({
                productId: i.productId, qty: +i.qty, unitPrice: +i.unitPrice, total: +i.qty * +i.unitPrice
              }))
            }
          },
          include: { items: true }
        });

        // Deduct stock
        for (const i of items) {
          if (i.warehouseId) {
            await tx.stock.upsert({
              where: { productId_warehouseId: { productId: i.productId, warehouseId: i.warehouseId } },
              update: { quantity: { decrement: +i.qty } },
              create: { productId: i.productId, warehouseId: i.warehouseId, quantity: 0 }
            });
          }
        }
        return s;
      });

      return res.status(201).json({ success: true, data: sale });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.sale.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Deleted' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
