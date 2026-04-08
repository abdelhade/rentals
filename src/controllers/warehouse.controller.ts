import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class WarehouseController {
  public getAll = async (req: Request, res: Response) => {
    try {
      const data = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { name, location } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'name is required' });
      const data = await prisma.warehouse.create({ data: { name, location } });
      return res.status(201).json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ success: false, message: 'Warehouse already exists' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { name, location } = req.body;
      const data = await prisma.warehouse.update({ where: { id: req.params.id }, data: { name, location } });
      return res.json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.warehouse.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'Deleted' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'Not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
