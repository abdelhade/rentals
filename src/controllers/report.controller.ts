import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class ReportController {
  public getSummary = async (req: Request, res: Response) => {
    try {
      const [customers, suppliers, products, purchases, sales, rentals, receipts, payments] = await Promise.all([
        prisma.customer.count(),
        prisma.supplier.count(),
        prisma.product.count(),
        prisma.purchase.aggregate({ _sum: { total: true } }),
        prisma.sale.aggregate({ _sum: { total: true } }),
        prisma.rentalOrder.aggregate({ _sum: { totalPrice: true } }),
        prisma.receiptVoucher.aggregate({ _sum: { amount: true } }),
        prisma.paymentVoucher.aggregate({ _sum: { amount: true } }),
      ]);
      return res.json({
        success: true,
        data: {
          customers,
          suppliers,
          products,
          totalPurchases: purchases._sum.total || 0,
          totalSales: sales._sum.total || 0,
          totalRentals: rentals._sum.totalPrice || 0,
          totalReceipts: receipts._sum.amount || 0,
          totalPayments: payments._sum.amount || 0,
        }
      });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public getStock = async (req: Request, res: Response) => {
    try {
      const data = await prisma.stock.findMany({
        include: { product: { include: { category: true } }, warehouse: true },
        orderBy: { product: { name: 'asc' } }
      });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };
}
