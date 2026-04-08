import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class SuitController {
  
  // Get all suits with their basic models
  public getAllSuits = async (req: Request, res: Response) => {
    try {
      const suits = await prisma.suitItem.findMany({
        include: {
          suitModel: true
        }
      });
      
      return res.status(200).json({
        success: true,
        data: suits
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Unable to fetch suits',
        error: error.message
      });
    }
  };
}
