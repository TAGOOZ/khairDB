// User types
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

// Assistance Details types
export type TranslationKey =
  | AssistanceTranslationKey
  | CommonTranslationKey
  | 'dashboard'
  | 'individuals'
  | 'families'
  | 'needs'
  | 'distributions'
  | 'reports'
  | 'projects'
  | 'add'
  | 'edit'
  | 'delete'
  | 'save'
  | 'cancel'
  | 'search'
  | 'status'
  | 'actions'
  | 'close'
  | 'remove'
  | 'all'
  | 'allCategories'
  | 'allDistricts'
  | 'searchPlaceholder'
  | 'signIn'
  | 'signOut'
  | 'email'
  | 'password'
  | 'firstName'
  | 'lastName'
  | 'idNumber'
  | 'dateOfBirth'
  | 'gender'
  | 'male'
  | 'female'
  | 'phone'
  | 'address'
  | 'district'
  | 'description'
  | 'maritalStatus'
  | 'single'
  | 'married'
  | 'widowed'
  | 'job'
  | 'employmentStatus'
  | 'salary'
  | 'noSalary'
  | 'hasSalary'
  | 'socialSupport'
  | 'listStatus'
  | 'whitelist'
  | 'blacklist'
  | 'waitinglist'
  | 'assistanceInformation'
  | 'typeOfMedicalAssistance'
  | 'medicationDistributionFrequency'
  | 'estimatedCostOfTreatment'
  | 'healthInsuranceCoverage'
  | 'additionalDetails'
  | 'typeOfFoodAssistance'
  | 'foodSupplyCard'
  | 'marriageSupportNeeded'
  | 'weddingContractSigned'
  | 'weddingDate'
  | 'specificNeeds'
  | 'debtStatus'
  | 'debtAmount'
  | 'reasonForDebt'
  | 'familyEducationLevel'
  | 'desireForEducation'
  | 'childrenEducationalNeeds'
  | 'typeOfHousing'
  | 'housingCondition'
  | 'numberOfRooms'
  | 'householdAppliances'
  | 'confirmDelete'
  | 'successAdd'
  | 'successEdit'
  | 'successDelete'
  | 'error'
  | 'loading'
  | 'noDataAvailable'
  | 'viewHistory'
  | 'print'
  | 'export'
  | 'filter'
  | 'clearFilters'
  | 'next'
  | 'previous'
  | 'finish'
  | 'switchLanguage'
  | 'currentLanguage'
  | 'distributionHistory'
  | 'totalDistributions'
  | 'totalValueReceived'
  | 'quantityReceived'
  | 'value'
  | 'pending'
  | 'inProgress'
  | 'completed';

export type AssistanceTranslationKey = 
  | 'medicalHelp'
  | 'foodAssistance'
  | 'marriageAssistance'
  | 'debtAssistance'
  | 'educationAssistance'
  | 'shelterAssistance';

export type CommonTranslationKey =
  | 'yearsOld'
  | 'addedBy'
  | 'yes'
  | 'no'
  | 'pending'
  | 'inProgress'
  | 'completed'
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export type AssistanceType = 
  | 'medical_help'
  | 'food_assistance'
  | 'marriage_assistance'
  | 'debt_assistance'
  | 'education_assistance'
  | 'shelter_assistance';

export interface AssistanceDetails {
  id: string;
  individual_id: string;
  assistance_type: AssistanceType;
  details: any; // Using any since each type has a different schema
  created_at: string;
  updated_at: string;
}

// Individual types
export interface Individual {
  id: string;
  first_name: string;
  last_name: string;
  id_number: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  marital_status: 'single' | 'married' | 'widowed';
  phone: string | null;
  district: string;
  family_id: string | null;
  address: string | null;
  description: string | null;
  job: string | null;
  employment_status: 'no_salary' | 'has_salary' | 'social_support';
  salary: number | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  created_by_user?: {
    first_name: string;
    last_name: string;
  };
  needs: Need[];
  distributions: Distribution[];
  list_status: 'whitelist' | 'blacklist' | 'waitinglist';
  additional_members: AdditionalMember[];
  children: Child[];
  assistance_details?: AssistanceDetails[]; // Added field for assistance details
  id_card_image_url?: string | null; // URL for the ID card image
  id_card_image_path?: string | null; // Storage path for the ID card image
  hashtags?: string[]; // Added field for hashtags
  google_drive_folder_id?: string | null; // Google Drive folder ID
  google_drive_folder_url?: string | null; // Google Drive folder URL
}

// Child types
export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'boy' | 'girl';
  school_stage?: 'kindergarten' | 'primary' | 'preparatory' | 'secondary';
  description?: string;
  parent_id: string;
  family_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Additional Member types
export interface AdditionalMember {
  id: string;
  name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  role: 'spouse' | 'sibling' | 'grandparent' | 'other';
  job_title?: string;
  phone_number?: string;
  relation: string;
}

// Need types
export type NeedCategory = 
  | 'medical'
  | 'financial'
  | 'food'
  | 'shelter'
  | 'clothing'
  | 'education'
  | 'employment'
  | 'transportation'
  | 'other';

export type NeedPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NeedStatus = 'pending' | 'in_progress' | 'completed';

export interface Need {
  id: string;
  individual_id: string;
  category: NeedCategory;
  priority: NeedPriority;
  status: NeedStatus;
  description: string;
  created_at: string;
  updated_at: string;
}

// Family types
export interface Family {
  id: string;
  name: string;
  status: 'green' | 'yellow' | 'red';
  district: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  members: (Individual & { family_role: 'parent' | 'child' })[];
}

// Distribution types
export type AidType = 'food' | 'clothing' | 'financial' | 'medical' | 'education' | 'shelter' | 'other';

export interface Distribution {
  id: string;
  date: string;
  aid_type: AidType;
  description: string;
  quantity: number;
  value: number;
  status: 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  recipients: DistributionRecipient[];
}

export interface DistributionRecipient {
  id: string;
  distribution_id: string;
  individual_id: string;
  individual: Individual;
  quantity_received: number;
  value_received: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Pending Request types
export interface PendingRequest {
  id: string;
  type: 'individual' | 'family' | 'need';
  data: any;
  status: 'pending' | 'approved' | 'rejected';
  submitted_by: string;
  submitted_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  admin_comment: string | null;
  submitted_by_user?: {
    first_name: string;
    last_name: string;
  };
  reviewed_by_user?: {
    first_name: string;
    last_name: string;
  };
}
