import { prisma } from '../prisma';
import { CreateRentalInput } from '../validators/rental.validator';

export class RentalRepository {
  async findOverlappingRentals(suitItemId: string, startDate: Date, endDate: Date) {
    return prisma.rentalOrder.findMany({
      where: {
        suitItemId,
        orderStatus: {
          in: ['BOOKED', 'PICKED_UP', 'CLEANING']
        },
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate }
          }
        ]
      }
    });
  }

  async createRental(data: CreateRentalInput, totalPrice: number) {
    return prisma.rentalOrder.create({
      data: {
        userId: data.userId,
        suitItemId: data.suitItemId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        depositAmount: data.depositAmount,
        totalPrice,
        orderStatus: 'BOOKED',
        depositStatus: 'PENDING'
      }
    });
  }

  async getAllRentals() {
    return prisma.rentalOrder.findMany({
      include: {
        user: true,
        suitItem: {
          include: { suitModel: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateOrderStatus(rentalId: string, newStatus: string) {
    return prisma.rentalOrder.update({
      where: { id: rentalId },
      data: { orderStatus: newStatus },
      include: { suitItem: true }
    });
  }

  async updateSuitStatus(suitItemId: string, status: string) {
    return prisma.suitItem.update({
      where: { id: suitItemId },
      data: { status }
    });
  }
}
