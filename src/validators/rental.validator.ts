import { z } from 'zod';

export const createRentalSchema = z.object({
  userId: z.string().uuid("Invalid User ID"),
  suitItemId: z.string().uuid("Invalid Suit Item ID"),
  startDate: z.string().datetime("Must be a valid ISO DateTime"),
  endDate: z.string().datetime("Must be a valid ISO DateTime"),
  depositAmount: z.number().min(0, "Deposit must be zero or positive"),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type CreateRentalInput = z.infer<typeof createRentalSchema>;
