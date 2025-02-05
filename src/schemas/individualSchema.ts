import { z } from 'zod';
    import { needSchema } from './needSchema';
    
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
      }).default('whitelist')
    });
    
    export type IndividualFormData = z.infer<typeof individualSchema>;
