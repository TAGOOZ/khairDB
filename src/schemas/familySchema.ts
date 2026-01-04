import { z } from 'zod';

// Relation options matching the Individual form's additional_members
export const relationOptions = [
  'wife',
  'husband',
  'sister',
  'brother',
  'mother',
  'father',
  'mother_in_law',
  'father_in_law',
  'son',
  'daughter',
  'other'
] as const;

export type RelationType = typeof relationOptions[number];

// Relations that count as "parent/head of household"
export const parentRelations: RelationType[] = ['wife', 'husband', 'mother', 'father'];

export const familyMemberSchema = z.object({
  id: z.string().uuid('Invalid member ID'),
  relation: z.enum(relationOptions, {
    required_error: 'Member relation is required',
  }),
});

export const familySchema = z.object({
  name: z.string()
    .min(1, 'Family name is required')
    .max(100, 'Family name cannot exceed 100 characters'),
  members: z.array(familyMemberSchema)
    .min(1, 'At least one member is required')
    .refine(
      members => members.some(member => parentRelations.includes(member.relation)),
      'At least one parent (husband, wife, mother, or father) is required'
    ),
  status: z.enum(['green', 'yellow', 'red'], {
    required_error: 'Family status is required',
  }),
  primary_contact_id: z.string().nullable().optional(),
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
