import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class UserController {

  public getAll = async (req: Request, res: Response) => {
    try {
      const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json({ success: true, data: users });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public getOne = async (req: Request, res: Response) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id }, include: { measurements: true } });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { name, email, phone } = req.body;
      if (!name || !email || !phone)
        return res.status(400).json({ success: false, message: 'name, email and phone are required' });

      const user = await prisma.user.create({ data: { name, email, phone } });
      return res.status(201).json({ success: true, data: user });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ success: false, message: 'Email already exists' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { name, email, phone } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { ...(name && { name }), ...(email && { email }), ...(phone && { phone }) }
      });
      return res.json({ success: true, data: user });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.user.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'User deleted' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
