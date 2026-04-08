import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class EmployeeController {

  public getAll = async (req: Request, res: Response) => {
    try {
      const data = await prisma.employee.findMany({ orderBy: { createdAt: 'desc' } });
      return res.json({ success: true, data });
    } catch (e: any) { return res.status(500).json({ success: false, message: e.message }); }
  };

  public create = async (req: Request, res: Response) => {
    try {
      const { name, phone, email, jobTitle, salary, hireDate, status } = req.body;
      if (!name) return res.status(400).json({ success: false, message: 'الاسم مطلوب' });
      const data = await prisma.employee.create({
        data: { name, phone, email, jobTitle, salary: +salary || 0, hireDate: hireDate ? new Date(hireDate) : new Date(), status: status || 'ACTIVE' }
      });
      return res.status(201).json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ success: false, message: 'البريد الإلكتروني مستخدم' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { name, phone, email, jobTitle, salary, hireDate, status } = req.body;
      const data = await prisma.employee.update({
        where: { id: req.params.id },
        data: { name, phone, email, jobTitle, salary: +salary, hireDate: hireDate ? new Date(hireDate) : undefined, status }
      });
      return res.json({ success: true, data });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.employee.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'تم الحذف' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'الموظف غير موجود' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
