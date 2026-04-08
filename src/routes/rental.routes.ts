import { Router } from 'express';
import { RentalController } from '../controllers/rental.controller';

const router = Router();
const rentalController = new RentalController();

router.get('/', rentalController.getAllRentals);
router.post('/', rentalController.createRental);
router.put('/:id/status', rentalController.changeStatus);

export default router;
