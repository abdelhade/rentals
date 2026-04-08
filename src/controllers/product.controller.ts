import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class ProductController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const data = await prisma.product.findMany({
        include: { category: true, stocks: { include: { warehouse: true } } },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { name, description, sku, unit, costPrice, salePrice, categoryId } = req.body;
      if (!name || !sku) return res.status(400).json({ success: false, message: 'name and sku are required' });
      const data = await prisma.product.create({ data: { name, description, sku, unit, costPrice: +costPrice || 0, salePrice: +salePrice || 0, categoryId } });
      return res.status(201).json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ success: false, message: 'SKU already exists' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { name, description, sku, unit, costPrice, salePrice, categoryId } = req.body;
      const data = await prisma.product.update({
        where: { id: req.params.id },
        data: { name, description, sku, unit, costPrice: +costPrice, salePrice: +salePrice, categoryId }
      });
      return res.json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.product.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Deleted' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
