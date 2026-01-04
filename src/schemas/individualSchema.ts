import { z } from 'zod';

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

// Validation message keys - these are translation keys
export const validationMessages = {
  required: 'validationRequired',
  firstNameRequired: 'validationFirstNameRequired',
  lastNameRequired: 'validationLastNameRequired',
  idNumber14Digits: 'validationIdNumber14Digits',
  idNumberOnlyNumbers: 'validationIdNumberOnlyNumbers',
  dateOfBirthRequired: 'validationDateOfBirthRequired',
  selectGender: 'validationSelectGender',
  selectMaritalStatus: 'validationSelectMaritalStatus',
  districtRequired: 'validationDistrictRequired',
  selectEmploymentStatus: 'validationSelectEmploymentStatus',
  selectListStatus: 'validationSelectListStatus',
  childUnder18: 'validationChildUnder18',
  nameRequired: 'validationNameRequired',
  relationRequired: 'validationRelationRequired',
  invalidPhoneFormat: 'validationInvalidPhoneFormat',
  familyRequiredForChildren: 'validationFamilyRequiredForChildren',
} as const;

// Function to create schema with translated messages
export function createIndividualSchema(t: (key: string) => string) {
  const childSchema = z.object({
    id: z.string().optional(),
    first_name: z.string().min(1, t(validationMessages.firstNameRequired)),
    last_name: z.string().min(1, t(validationMessages.lastNameRequired)),
    date_of_birth: z.string()
      .min(1, t(validationMessages.dateOfBirthRequired))
      .refine(date => {
        const age = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age < 18;
      }, t(validationMessages.childUnder18)),
    gender: z.enum(['boy', 'girl'], {
      errorMap: () => ({ message: t(validationMessages.selectGender) })
    }),
    school_stage: z.enum(['kindergarten', 'primary', 'preparatory', 'secondary']).optional(),
    description: z.string().optional()
  });

  const additionalMemberSchema = z.object({
    name: z.string().min(1, t(validationMessages.nameRequired)),
    date_of_birth: z.string().min(1, t(validationMessages.dateOfBirthRequired)),
    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: t(validationMessages.selectGender) })
    }),
    role: z.enum(['spouse', 'sibling', 'grandparent', 'other']).optional(),
    job_title: z.string().optional(),
    phone_number: z.string()
      .optional()
      .refine(val => !val || /^[0-9+\-\s()]*$/.test(val), t(validationMessages.invalidPhoneFormat)),
    relation: z.string().min(1, t(validationMessages.relationRequired))
  });

  return z.object({
    first_name: z.string().min(1, t(validationMessages.firstNameRequired)),
    last_name: z.string().min(1, t(validationMessages.lastNameRequired)),
    id_number: z.string()
      .length(14, t(validationMessages.idNumber14Digits))
      .regex(/^\d+$/, t(validationMessages.idNumberOnlyNumbers)),
    date_of_birth: z.string().min(1, t(validationMessages.dateOfBirthRequired)),
    gender: z.enum(['male', 'female'], {
      errorMap: () => ({ message: t(validationMessages.selectGender) })
    }),
    marital_status: z.enum(['single', 'married', 'widowed'], {
      errorMap: () => ({ message: t(validationMessages.selectMaritalStatus) })
    }),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    family_id: z.string().optional().nullable(),
    new_family_name: z.string().optional(),
    district: z.string().min(1, t(validationMessages.districtRequired)),
    description: z.string().optional().nullable(),
    job: z.string().optional().nullable(),
    employment_status: z.enum(['no_salary', 'has_salary', 'social_support'] as const, {
      errorMap: () => ({ message: t(validationMessages.selectEmploymentStatus) })
    }).default('no_salary'),
    salary: z.number().nullable().optional(),
    list_status: z.enum(['whitelist', 'blacklist', 'waitinglist'] as const, {
      errorMap: () => ({ message: t(validationMessages.selectListStatus) })
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
    }).optional().nullable(),
    debt_assistance: z.object({
      needs_debt_assistance: z.boolean().default(false),
      debt_amount: z.number().default(0),
      household_appliances: z.boolean().default(false),
      hospital_bills: z.boolean().default(false),
      education_fees: z.boolean().default(false),
      business_debt: z.boolean().default(false),
      other_debt: z.boolean().default(false),
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
    }).optional().nullable()
  }).refine(data => {
    if (data.children && data.children.length > 0) {
      return data.family_id || data.new_family_name;
    }
    return true;
  }, {
    message: t(validationMessages.familyRequiredForChildren),
    path: ["family_id"]
  });
}

// Default schema with English fallback (for type inference)
export const individualSchema = createIndividualSchema((key) => {
  // Fallback English messages
  const fallback: Record<string, string> = {
    validationRequired: 'This field is required',
    validationFirstNameRequired: 'First name is required',
    validationLastNameRequired: 'Last name is required',
    validationIdNumber14Digits: 'ID Number must be exactly 14 digits',
    validationIdNumberOnlyNumbers: 'ID Number must contain only numbers',
    validationDateOfBirthRequired: 'Date of birth is required',
    validationSelectGender: 'Please select a gender',
    validationSelectMaritalStatus: 'Please select marital status',
    validationDistrictRequired: 'District is required',
    validationSelectEmploymentStatus: 'Please select employment status',
    validationSelectListStatus: 'Please select list status',
    validationChildUnder18: 'Child must be under 18 years old',
    validationNameRequired: 'Name is required',
    validationRelationRequired: 'Relation is required',
    validationInvalidPhoneFormat: 'Invalid phone number format',
    validationFamilyRequiredForChildren: 'A family must be selected or created when adding children',
  };
  return fallback[key] || key;
});

export type IndividualFormData = z.infer<typeof individualSchema>;
