import { RentalRepository } from '../repositories/rental.repository';
import { CreateRentalInput } from '../validators/rental.validator';
import { prisma } from '../prisma';

export class RentalService {
  private rentalRepository: RentalRepository;

  constructor() {
    this.rentalRepository = new RentalRepository();
  }

  async processRentalOrder(data: CreateRentalInput) {
    const requestedStartDate = new Date(data.startDate);
    const requestedEndDate = new Date(data.endDate);

    const bufferEndDate = new Date(requestedEndDate);
    bufferEndDate.setHours(bufferEndDate.getHours() + 24);

    const overlappingFiles = await this.rentalRepository.findOverlappingRentals(
      data.suitItemId,
      requestedStartDate,
      bufferEndDate
    );

    if (overlappingFiles.length > 0) {
      throw new Error("Suit item is not available for requested dates.");
    }

    const suitItem = await prisma.suitItem.findUnique({
      where: { id: data.suitItemId },
      include: { suitModel: true }
    });

    if (!suitItem) throw new Error("Suit Item not found");

    const timeDiff = requestedEndDate.getTime() - requestedStartDate.getTime();
    const daysRented = Math.ceil(timeDiff / (1000 * 3600 * 24));
    let calculatedPrice = (daysRented > 0 ? daysRented : 1) * suitItem.suitModel.basePrice;

    return this.rentalRepository.createRental(data, calculatedPrice);
  }

  async getAllRentals() {
    return this.rentalRepository.getAllRentals();
  }

  // State Machine logic
  async changeRentalStatus(rentalId: string, newStatus: string) {
    const validStatuses = ['BOOKED', 'PICKED_UP', 'RETURNED', 'CLEANING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error('Invalid Status');
    }

    const rental = await this.rentalRepository.updateOrderStatus(rentalId, newStatus);

    // Sync Suit Item Physical Status appropriately
    if (newStatus === 'PICKED_UP') {
      await this.rentalRepository.updateSuitStatus(rental.suitItemId, 'RENTED');
    } else if (newStatus === 'RETURNED' || newStatus === 'CLEANING') {
      await this.rentalRepository.updateSuitStatus(rental.suitItemId, 'CLEANING');
    } else if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
      await this.rentalRepository.updateSuitStatus(rental.suitItemId, 'AVAILABLE');
    }

    return rental;
  }
}
