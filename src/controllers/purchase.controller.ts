import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class PurchaseController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const data = await prisma.purchase.findMany({
        include: { supplier: true, items: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { supplierId, date, paid, notes, items } = req.body;
      if (!supplierId || !items?.length) return res.status(400).json({ success: false, message: 'supplierId and items are required' });

      const total = items.reduce((s: number, i: any) => s + i.qty * i.unitCost, 0);

      const purchase = await prisma.$transaction(async (tx) => {
        const p = await tx.purchase.create({
          data: {
            supplierId, date: date ? new Date(date) : new Date(),
            total, paid: +paid || 0,
            status: +paid >= total ? 'PAID' : +paid > 0 ? 'PARTIAL' : 'PENDING',
            notes,
            items: {
              create: items.map((i: any) => ({
                productId: i.productId, qty: +i.qty, unitCost: +i.unitCost, total: +i.qty * +i.unitCost
              }))
            }
          },
          include: { items: true }
        });

        // Update stock
        for (const i of items) {
          if (i.warehouseId) {
            await tx.stock.upsert({
              where: { productId_warehouseId: { productId: i.productId, warehouseId: i.warehouseId } },
              update: { quantity: { increment: +i.qty } },
              create: { productId: i.productId, warehouseId: i.warehouseId, quantity: +i.qty }
            });
          }
        }
        return p;
      });

      return res.status(201).json({ success: true, data: purchase });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.purchase.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Deleted' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
