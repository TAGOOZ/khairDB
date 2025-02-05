import { z } from 'zod';
import { NeedCategory, NeedPriority, NeedStatus } from '../types';

// Individual Schema
export const individualSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select a gender',
  }),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  family_id: z.string().optional().nullable(),
  district: z.string().min(1, 'District is required'),
  description: z.string().optional().nullable(),
});

export type IndividualFormData = z.infer<typeof individualSchema>;

// Family Schema
export const familyMemberSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['parent', 'child'], {
    required_error: 'Member role is required',
  }),
});

export const familySchema = z.object({
  name: z.string().min(1, 'Family name is required'),
  members: z.array(familyMemberSchema).optional(),
  status: z.enum(['green', 'yellow', 'red'], {
    required_error: 'Family status is required',
  }),
  primary_contact_id: z.string().uuid('Invalid contact ID').optional().nullable(),
  district: z.string().optional().nullable(),
});

export type FamilyMemberData = z.infer<typeof familyMemberSchema>;
export type FamilyFormData = z.infer<typeof familySchema>;

// Need Schema
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

// Distribution Schema
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
