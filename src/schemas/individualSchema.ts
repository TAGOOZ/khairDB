import { z } from 'zod';
import { needSchema } from './needSchema';

const childSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine(date => {
      const age = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age < 18;
    }, 'Child must be under 18 years old'),
  gender: z.enum(['male', 'female']),
  school_stage: z.enum(['kindergarten', 'primary', 'preparatory', 'secondary']).optional(),
  description: z.string().optional()
});

const additionalMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  role: z.enum(['spouse', 'sibling', 'grandparent', 'other']),
  job_title: z.string().optional(),
  phone_number: z.string()
    .optional()
    .refine(val => !val || /^[0-9+\-\s()]*$/.test(val), 'Invalid phone number format'),
  relation: z.string().min(1, 'Relation is required')
});

export const individualSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  id_number: z.string()
    .length(14, 'ID Number must be exactly 14 digits')
    .regex(/^\d+$/, 'ID Number must contain only numbers'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], {
    required_error: 'Please select a gender',
  }),
  marital_status: z.enum(['single', 'married', 'widowed'], {
    required_error: 'Please select marital status',
  }),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  family_id: z.string().optional().nullable(),
  new_family_name: z.string().optional(),
  district: z.string().min(1, 'District is required'),
  description: z.string().optional().nullable(),
  job: z.string().optional().nullable(),
  employment_status: z.enum(['no_salary', 'has_salary', 'social_support'] as const, {
    required_error: 'Please select employment status',
  }).default('no_salary'),
  salary: z.number().nullable().optional(),
  needs: z.array(needSchema).optional().default([]),
  list_status: z.enum(['whitelist', 'blacklist', 'waitinglist'] as const, {
    required_error: 'Please select list status'
  }).default('whitelist'),
  children: z.array(childSchema).optional().default([]),
  additional_members: z.array(additionalMemberSchema).optional().default([])
}).refine(data => {
  // If there are children, either family_id or new_family_name must be provided
  if (data.children && data.children.length > 0) {
    return data.family_id || data.new_family_name;
  }
  return true;
}, {
  message: "A family must be selected or created when adding children",
  path: ["family_id"]
});

export type IndividualFormData = z.infer<typeof individualSchema>;
