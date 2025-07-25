import { z } from 'zod';
import { needSchema } from './needSchema';

// Define available hashtags/projects 
export const availableHashtags = [
  'خير رمضان',
  'قلم وكراسة ملابس',
  'اضحية',
  'بطاطين',
  'كفالة شهرية',
  'زكاة مال',
  'عيدية'
] as const;

export type HashtagType = typeof availableHashtags[number];

const childSchema = z.object({
  id: z.string().optional(), // Optional ID for existing children
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string()
    .min(1, 'Date of birth is required')
    .refine(date => {
      const age = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age < 18;
    }, 'Child must be under 18 years old'),
  gender: z.enum(['boy', 'girl']),
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
  additional_members: z.array(additionalMemberSchema).optional().default([]),
  hashtags: z.array(z.string()).optional().default([]),
  medical_help: z.object({
    type_of_medical_assistance_needed: z.array(z.string()).default([]),
    medication_distribution_frequency: z.string().optional().nullable(),
    estimated_cost_of_treatment: z.string().optional().nullable(),
    health_insurance_coverage: z.boolean().default(false),
    additional_details: z.string().optional().nullable()
  }).refine(data => {
    if (!data) return true;
    // If any medical assistance is selected, ensure it's meaningful
    const hasAssistanceTypes = data.type_of_medical_assistance_needed.length > 0;
    const hasOtherDetails = data.medication_distribution_frequency || 
                           data.estimated_cost_of_treatment || 
                           data.health_insurance_coverage || 
                           data.additional_details;
    // If no assistance types are selected, other fields should be empty/false
    if (!hasAssistanceTypes && hasOtherDetails) {
      return false;
    }
    return true;
  }, {
    message: "Please select at least one type of medical assistance if providing medical details",
    path: ["type_of_medical_assistance_needed"]
  }).optional().nullable(),
  food_assistance: z.object({
    type_of_food_assistance_needed: z.array(z.string()).default([]),
    food_supply_card: z.boolean().default(false)
  }).optional().nullable(),
  marriage_assistance: z.object({
    marriage_support_needed: z.boolean().default(false),
    wedding_contract_signed: z.boolean().default(false),
    wedding_date: z.string().optional().nullable(),
    specific_needs: z.string().optional().nullable()
  }).refine(data => {
    if (!data) return true;
    // If marriage support is not needed, other fields should be empty
    if (!data.marriage_support_needed) {
      return !data.wedding_contract_signed && 
             !data.wedding_date && 
             !data.specific_needs;
    }
    return true;
  }, {
    message: "When marriage support is not needed, all marriage fields must be cleared",
    path: ["marriage_support_needed"]
  }).optional().nullable(),
  debt_assistance: z.object({
    needs_debt_assistance: z.boolean().default(false),
    debt_amount: z.number().default(0),
    household_appliances: z.boolean().default(false),
    hospital_bills: z.boolean().default(false),
    education_fees: z.boolean().default(false),
    business_debt: z.boolean().default(false),
    other_debt: z.boolean().default(false),
  }).refine(data => {
    if (!data) return true;
    // If needs_debt_assistance is true, then debt_amount must be greater than 0
    if (data.needs_debt_assistance && data.debt_amount <= 0) {
      return false;
    }
    // If needs_debt_assistance is false, ensure all other debt fields are false and amount is 0
    if (!data.needs_debt_assistance) {
      return data.debt_amount === 0 && 
             !data.household_appliances && 
             !data.hospital_bills && 
             !data.education_fees && 
             !data.business_debt && 
             !data.other_debt;
    }
    return true;
  }, {
    message: "When debt assistance is needed, debt amount must be greater than 0. When not needed, all debt fields must be cleared.",
    path: ["debt_amount"]
  }).optional().nullable(),
  education_assistance: z.object({
    family_education_level: z.string().optional().nullable(),
    desire_for_education: z.string().optional().nullable(),
    children_educational_needs: z.array(z.string()).default([])
  }).optional().nullable(),
  shelter_assistance: z.object({
    type_of_housing: z.string().optional().nullable(),
    housing_condition: z.string().optional().nullable(),
    number_of_rooms: z.number().default(0),
    household_appliances: z.array(z.string()).default([])
  }).refine(data => {
    if (!data) return true;
    // If any housing details are provided, ensure they are valid
    if (data.type_of_housing || data.housing_condition || data.number_of_rooms > 0 || data.household_appliances.length > 0) {
      return data.number_of_rooms >= 0;
    }
    return true;
  }, {
    message: "Number of rooms must be 0 or greater",
    path: ["number_of_rooms"]
  }).optional().nullable()
}).refine(data => {
  if (data.children && data.children.length > 0) {
    return data.family_id || data.new_family_name;
  }
  return true;
}, {
  message: "A family must be selected or created when adding children",
  path: ["family_id"]
});

export type IndividualFormData = z.infer<typeof individualSchema>;
