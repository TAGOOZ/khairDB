import { z } from 'zod';
import { NeedCategory, NeedPriority } from '../types';

export const needSchema = z.object({
  category: z.enum(['medical', 'financial', 'food', 'shelter', 'clothing', 'education', 'employment', 'transportation', 'other'] as const, {
    required_error: 'Please select a category',
  }),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const, {
    required_error: 'Please select a priority level',
  }),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['pending', 'in_progress', 'completed'] as const).default('pending'),
});

export type NeedFormData = z.infer<typeof needSchema>;
