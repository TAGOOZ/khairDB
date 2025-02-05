import { z } from 'zod';
import { AidType } from '../types';

export const distributionSchema = z.object({
  date: z.string().min(1, 'Distribution date is required'),
  aid_type: z.enum(['food', 'clothing', 'financial', 'medical', 'education', 'shelter', 'other'] as const, {
    required_error: 'Aid type is required',
  }),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0, 'Quantity must be 0 or greater'),
  value: z.number().min(0, 'Value must be 0 or greater'),
  recipients: z.array(z.object({
    individual_id: z.string().uuid('Invalid individual ID'),
    quantity_received: z.number().min(0, 'Quantity must be 0 or greater'),
  })).min(1, 'At least one recipient is required'),
});

export type DistributionFormData = z.infer<typeof distributionSchema>;
