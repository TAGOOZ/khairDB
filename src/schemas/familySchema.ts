import { z } from 'zod';

export const familyMemberSchema = z.object({
  id: z.string().uuid('Invalid member ID'),
  role: z.enum(['parent', 'child'], {
    required_error: 'Member role is required',
  }),
});

export const familySchema = z.object({
  name: z.string()
    .min(1, 'Family name is required')
    .max(100, 'Family name cannot exceed 100 characters'),
  members: z.array(familyMemberSchema)
    .min(1, 'At least one member is required')
    .refine(
      members => members.some(member => member.role === 'parent'),
      'At least one parent is required'
    ),
  status: z.enum(['green', 'yellow', 'red'], {
    required_error: 'Family status is required',
  }),
  district: z.string().nullable(),
  phone: z.string()
    .nullable()
    .refine(
      val => val === null || /^\+?[0-9\s-()]{10,}$/.test(val),
      'Invalid phone number format'
    ),
  address: z.string()
    .nullable()
    .transform(val => val?.trim() || null),
});

export type FamilyMemberData = z.infer<typeof familyMemberSchema>;
export type FamilyFormData = z.infer<typeof familySchema>;
