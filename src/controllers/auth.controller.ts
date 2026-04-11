import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'luxe-suits-secret';

export class AuthController {

  public login = async (req: Request, res: Response) => {
    try {
      const { name, password } = req.body;
      if (!name || !password)
        return res.status(400).json({ success: false, message: 'name and password are required' });

      const user = await prisma.systemUser.findUnique({ where: { name } });
      if (!user || !user.active)
        return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
      return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public register = async (req: Request, res: Response) => {
    try {
      const { name, email, phone, password, role } = req.body;
      if (!name || !email || !phone || !password)
        return res.status(400).json({ success: false, message: 'name, email, phone and password are required' });

      const hashed = await bcrypt.hash(password, 10);
      const user = await prisma.systemUser.create({
        data: { name, email, phone, password: hashed, role: role || 'CASHIER' },
        select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true }
      });
      return res.status(201).json({ success: true, data: user });
    } catch (e: any) {
      if (e.code === 'P2002') return res.status(409).json({ success: false, message: 'Name or email already exists' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public getAll = async (req: Request, res: Response) => {
    try {
      const users = await prisma.systemUser.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, data: users });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public update = async (req: Request, res: Response) => {
    try {
      const { name, email, phone, role, active, password } = req.body;
      const data: any = {};
      if (name)     data.name = name;
      if (email)    data.email = email;
      if (phone)    data.phone = phone;
      if (role)     data.role = role;
      if (active !== undefined) data.active = active;
      if (password) data.password = await bcrypt.hash(password, 10);

      const user = await prisma.systemUser.update({
        where: { id: req.params.id },
        data,
        select: { id: true, name: true, email: true, phone: true, role: true, active: true, createdAt: true }
      });
      return res.json({ success: true, data: user });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public remove = async (req: Request, res: Response) => {
    try {
      await prisma.systemUser.delete({ where: { id: req.params.id } });
      return res.json({ success: true, message: 'User deleted' });
    } catch (e: any) {
      if (e.code === 'P2025') return res.status(404).json({ success: false, message: 'User not found' });
      return res.status(500).json({ success: false, message: e.message });
    }
  };

  public me = async (req: Request, res: Response) => {
    try {
      const user = await prisma.systemUser.findUnique({
        where: { id: req.user!.id },
        select: { id: true, name: true, email: true, phone: true, role: true, active: true }
      });
      return res.json({ success: true, data: user });
    } catch (e: any) {
      return res.status(500).json({ success: false, message: e.message });
    }
  };
}
