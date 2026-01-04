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
  | 'completed'
  | 'yes'
  | 'no'
  | 'medicalCheckup'
  | 'labTests'
  | 'xraysAndScans'
  | 'surgeries'
  | 'monthly'
  | 'intermittent'
  | 'ableToAfford'
  | 'unableToAfford'
  | 'partiallyAble'
  | 'choose'
  | 'readyMeals'
  | 'nonReadyMeals'
  | 'noEducation'
  | 'primaryEducation'
  | 'intermediateEducation'
  | 'secondaryEducation'
  | 'universityEducation'
  | 'literate'
  | 'illiterate'
  | 'tuitionFees'
  | 'supplies'
  | 'uniforms'
  | 'transportation'
  | 'books'
  | 'tutoring'
  | 'stove'
  | 'automaticWashingMachine'
  | 'manualWashingMachine'
  | 'refrigerator'
  | 'tv'
  | 'fan'
  | 'owned'
  | 'newRental'
  | 'oldRental'
  | 'healthy'
  | 'moderate'
  | 'unhealthy'
  | 'contactInformation'
  | 'personalInformation'
  | 'familyMembers'
  | 'assistanceNeeds'
  | 'employmentInformation'
  | 'reviewAndSubmit'
  | 'readyToSubmit'
  | 'reviewYourInformation'
  | 'finalCheckSubmit'
  | 'summaryOfInformation'
  | 'assistanceRequested'
  | 'familyAssignment'
  | 'searchFamily'
  | 'newFamily'
  | 'skipToReview'
  | 'userManagement'
  | 'addIndividual'
  | 'createDistribution'
  | 'submitIndividualRequest'
  | 'addFamily'
  | 'category'
  | 'whitelistedIndividuals'
  | 'blacklistedIndividuals'
  | 'waitinglistIndividuals'
  | 'totalFamilies'
  | 'urgentNeeds'
  | 'completedCases'
  | 'needsByCategory'
  | 'requests'
  | 'searchRequests'
  | 'requestFrom'
  | 'submittedOn'
  | 'approve'
  | 'reject'
  | 'approved'
  | 'rejected'
  | 'additionalInformation'
  | 'adminComment'
  | 'noRequestsFound'
  | 'rejectRequest'
  | 'addRejectionComment'
  | 'confirmDelete'
  | 'confirmDeleteRequest'
  | 'familyName'
  | 'contactInfo'
  | 'members'
  | 'searchFamilies'
  | 'searchByFamilyName'
  | 'created'
  | 'contactInformation'
  | 'parents'
  | 'children'
  | 'noContactInformation'
  | 'noFamilyMembers'
  | 'green'
  | 'yellow'
  | 'red'
  | 'addChild'
  | 'addFamilyMember'
  | 'saveAsPlanned'
  | 'distributeNow'
  | 'calculationMethod'
  | 'valuePerUnit'
  | 'addWalkin'
  | 'addWalkinRecipient'
  | 'enterName'
  | 'quantity'
  | 'selectFamilyMembers'
  | 'howToAddFamily'
  | 'headOfHousehold'
  | 'headOnlyDesc'
  | 'allMembers'
  | 'allMembersDesc'
  | 'parents'
  | 'notes';

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
  | 'urgent'
  | 'active'
  | 'inactive'
  | 'failed'
  | 'cancelled'
  | 'children'
  | 'boy'
  | 'girl'
  | 'kindergarten'
  | 'primary'
  | 'preparatory'
  | 'secondary'
  | 'assistanceInformation'
  | 'needsDebtAssistance';

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
  details: Record<string, unknown>;
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
  distributions: Distribution[];
  list_status: 'whitelist' | 'blacklist' | 'waitinglist';
  additional_members: AdditionalMember[];
  children: Child[];
  assistance_details?: AssistanceDetails[]; // Assistance details (medical, food, etc.)
  id_card_image_url?: string | null; // URL for the ID card image
  id_card_image_path?: string | null; // Storage path for the ID card image
  hashtags?: string[]; // Added field for hashtags
  google_drive_folder_id?: string | null; // Google Drive folder ID
  google_drive_folder_url?: string | null; // Google Drive folder URL
  family?: { // Family association from join
    id: string;
    name: string;
    status: 'green' | 'yellow' | 'red';
    phone: string | null;
    address: string | null;
    district: string | null;
  } | null;
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

// Legacy Need types - kept for backwards compatibility but no longer used
// The system now uses AssistanceDetails instead
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

/** @deprecated Use AssistanceDetails instead */
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
  primary_contact_id: string | null;
  created_at: string;
  updated_at: string;
  members: (Individual & { family_relation: 'wife' | 'husband' | 'sister' | 'brother' | 'mother' | 'father' | 'mother_in_law' | 'father_in_law' | 'son' | 'daughter' | 'other' })[];
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
  individual_id: string | null;
  child_id: string | null;
  individual?: Individual;
  child?: Child;
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

// Individual Request types (stored in individual_requests table)
export interface IndividualRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  details: any; // JSONB containing all request data
  created_at: string;
  updated_at: string;
}

// Approval Log types
export interface ApprovalLog {
  id: string;
  action: string;
  request_id: string | null;
  request_type: string | null;
  admin_id: string | null;
  admin_name: string | null;
  target_name: string | null;
  details: any;
  created_at: string;
}

// Activity Log types (for monitoring user activity)
export interface ActivityLog {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, any> | null;
  ip_address: string | null;
  created_at: string;
}
