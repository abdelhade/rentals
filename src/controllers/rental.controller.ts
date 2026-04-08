import { Request, Response } from 'express';
import { RentalService } from '../services/rental.service';
import { createRentalSchema } from '../validators/rental.validator';

export class RentalController {
  private rentalService: RentalService;

  constructor() {
    this.rentalService = new RentalService();
  }

  public getAllRentals = async (req: Request, res: Response) => {
    try {
      const rentals = await this.rentalService.getAllRentals();
      return res.status(200).json({ success: true, data: rentals });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  };

  public createRental = async (req: Request, res: Response) => {
    try {
      const validatedData = createRentalSchema.parse(req.body);
      const rentalOrder = await this.rentalService.processRentalOrder(validatedData);
      
      return res.status(201).json({
        success: true,
        message: 'Rental Order created successfully',
        data: rentalOrder
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
      }
      return res.status(409).json({ success: false, message: error.message || 'An error occurred' });
    }
  };

  public changeStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedRental = await this.rentalService.changeRentalStatus(id, status);
      
      return res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data: updatedRental
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
