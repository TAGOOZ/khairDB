import { z } from 'zod';
import { AidType } from '../types';

export const distributionSchema = z.object({
  date: z.string().min(1, 'Distribution date is required'),
  aid_type: z.enum(['food', 'clothing', 'financial', 'medical', 'education', 'shelter', 'other'] as const, {
    required_error: 'Aid type is required',
  }),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().optional(),
  value: z.number().min(0, 'Value must be 0 or greater'),
  value_per_unit: z.number().min(0).optional(),
  status: z.enum(['in_progress', 'completed']).default('completed'),
  recipients: z.array(z.object({
    individual_id: z.string().min(1, 'Individual ID is required'),
    quantity_received: z.number().min(1, 'Quantity must be at least 1'),
    notes: z.string().optional(),
    name: z.string().optional(), // For walk-ins
  })).min(1, 'At least one recipient is required'),
});

export type DistributionFormData = z.infer<typeof distributionSchema>;
