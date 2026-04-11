import { Request, Response } from 'express';
import { prisma } from '../prisma';

async function generateSku(): Promise<string> {
  const count = await prisma.product.count();
  return `PRD-${String(count + 1).padStart(5, '0')}`;
}

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
      const { name, description, sku, unit, costPrice, salePrice, categoryId, image } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'name is required' });

      // Auto-generate SKU if not provided
      const finalSku = sku?.trim() || await generateSku();

      const data = await prisma.product.create({
        data: { name, description, sku: finalSku, unit, costPrice: +costPrice || 0, salePrice: +salePrice || 0, categoryId: categoryId || null, image: image || null }
      });
      return res.status(201).json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ success: false, message: 'SKU already exists' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { name, description, sku, unit, costPrice, salePrice, categoryId, image } = req.body;
      const data = await prisma.product.update({
        where: { id: req.params.id },
        data: { name, description, sku, unit, costPrice: +costPrice, salePrice: +salePrice, categoryId: categoryId || null, image: image ?? undefined }
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
