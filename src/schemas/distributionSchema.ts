import { z } from 'zod';
import { AidType } from '../types';

export const distributionSchema = z.object({
  date: z.string().min(1, 'Distribution date is required'),
  aid_type: z.enum(['food', 'clothing', 'financial', 'medical', 'education', 'shelter', 'other'] as const, {
    required_error: 'Aid type is required',
  }),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().optional(), // Made optional since it will be calculated
  value: z.number().min(0, 'Value must be 0 or greater'),
  recipients: z.array(z.object({
    individual_id: z.string().min(1, 'Individual ID is required'), // Changed from UUID to string to allow additional member IDs
    quantity_received: z.number().min(1, 'Quantity must be at least 1'),
  })).min(1, 'At least one recipient is required'),
});

export type DistributionFormData = z.infer<typeof distributionSchema>;
