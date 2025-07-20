import React, { useState } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { individualSchema, IndividualFormData } from '../../schemas/individualSchema';
import { Individual, Family } from '../../types';
import { Button } from '../ui/Button';
import { Plus, Trash2, HelpCircle, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Tooltip } from '../ui/Tooltip';
import '../../styles/animations.css';

// Form step components (to be imported)
import { PersonalInfoStep } from './individual/PersonalInfoStep';
import { ContactInfoStep } from './individual/ContactInfoStep';
import { EmploymentStep } from './individual/EmploymentStep';
import { AssistanceStep } from './individual/AssistanceStep';
import { FamilyMembersStep } from './individual/FamilyMembersStep';
import { NeedsStep } from './individual/NeedsStep';
import { ReviewSubmitStep } from './individual/ReviewSubmitStep';

interface IndividualFormProps {
  onSubmit: (data: IndividualFormData) => Promise<void>;
  isLoading: boolean;
  families: Family[];
  initialData?: Individual;
}

// Form steps
type FormStepId =
  | 'personal'
  | 'contact'
  | 'employment'
  | 'assistance'
  | 'family'
  | 'needs'
  | 'review';

interface FormStep {
  id: FormStepId;
  label: string;
  description: string;
  component: React.ComponentType<{ 
    families?: Family[]; 
    handleAddMember?: (data: any) => void; 
    removeMember?: (index: number) => void; 
    removeChild?: (index: number) => void;
  }>;
}

export function IndividualForm({ onSubmit, isLoading, families, initialData }: IndividualFormProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [activeStep, setActiveStep] = useState<FormStepId>('personal');
  const [formProgress, setFormProgress] = useState<number>(0);

  // Define form steps
  const formSteps: FormStep[] = [
    {
      id: 'personal',
      label: t('personalInformation'),
      description: t('basicPersonalDetails'),
      component: PersonalInfoStep
    },
    {
      id: 'contact',
      label: t('contactInformation'),
      description: t('addressAndContact'),
      component: ContactInfoStep
    },
    {
      id: 'employment',
      label: t('employmentInformation'),
      description: t('jobAndIncome'),
      component: EmploymentStep
    },
    {
      id: 'assistance',
      label: t('assistanceNeeds'),
      description: t('supportTypes'),
      component: AssistanceStep
    },
    {
      id: 'family',
      label: t('familyMembers'),
      description: t('dependentsAndRelatives'),
      component: FamilyMembersStep
    },
    {
      id: 'needs',
      label: t('specificNeeds'),
      description: t('detailsOfRequirements'),
      component: NeedsStep
    },
    {
      id: 'review',
      label: t('reviewAndSubmit'),
      description: t('finalCheckSubmit'),
      component: ReviewSubmitStep
    }
  ];
  
  // Find active step index
  const activeStepIndex = formSteps.findIndex(step => step.id === activeStep);
  
  // Create form methods with improved default values
  const formMethods = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      id_number: '',
      date_of_birth: '',
      gender: 'male',
      marital_status: 'single',
      phone: '',
      district: '',
      family_id: null,
      address: '',
      description: '',
      job: '',
      employment_status: 'no_salary',
      salary: null,
      needs: [],
      additional_members: [],
      children: [],
      hashtags: [],
      medical_help: {
        type_of_medical_assistance_needed: [],
        medication_distribution_frequency: '',
        estimated_cost_of_treatment: '',
        health_insurance_coverage: false,
        additional_details: ''
      },
      food_assistance: {
        type_of_food_assistance_needed: [],
        food_supply_card: false
      },
      marriage_assistance: {
        marriage_support_needed: false,
        wedding_contract_signed: false,
        wedding_date: '',
        specific_needs: ''
      },
      debt_assistance: {
        needs_debt_assistance: false,
        debt_amount: 0,
        household_appliances: false,
        hospital_bills: false,
        education_fees: false,
        business_debt: false,
        other_debt: false
      },
      education_assistance: {
        family_education_level: '',
        desire_for_education: '',
        children_educational_needs: []
      },
      shelter_assistance: {
        type_of_housing: '',
        housing_condition: '',
        number_of_rooms: 0,
        household_appliances: []
      }
    },
    mode: 'onChange'
  });

  const { handleSubmit, reset, control, formState } = formMethods;
  
  // Set up field arrays for dynamic fields
  const { 
    fields: memberFields, 
    append: appendMember, 
    remove: removeMember 
  } = useFieldArray({
    control,
    name: 'additional_members'
  });

  const { 
    fields: childFields, 
    append: appendChild, 
    remove: removeChild 
  } = useFieldArray({
    control,
    name: 'children'
  });

  const { 
    fields: needFields, 
    append: appendNeed, 
    remove: removeNeed 
  } = useFieldArray({
    control,
    name: 'needs'
  });

  // Calculate form completion percentage
  React.useEffect(() => {
    const totalFields = Object.keys(formState.dirtyFields).length;
    const requiredFields = 8; // Minimum required fields
    const progress = Math.min(100, Math.round((totalFields / requiredFields) * 100));
    setFormProgress(progress);
  }, [formState.dirtyFields]);

  // Handle member addition logic
  const handleAddMember = (memberData: any) => {
    if (memberData.first_name && memberData.last_name) {
      appendChild({
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        date_of_birth: memberData.date_of_birth,
        gender: memberData.gender as 'boy' | 'girl',
        school_stage: memberData.school_stage,
        description: memberData.description
      });
    } else {
      appendMember({
        name: memberData.name || '',
        date_of_birth: memberData.date_of_birth,
        gender: memberData.gender as 'male' | 'female',
        role: memberData.role || 'other',
        job_title: memberData.job_title,
        phone_number: memberData.phone_number,
        relation: memberData.relation || ''
      });
    }
  };

  // Navigate between steps
  const goToNextStep = () => {
    const currentIndex = formSteps.findIndex(step => step.id === activeStep);
    if (currentIndex < formSteps.length - 1) {
      setActiveStep(formSteps[currentIndex + 1].id);
      window.scrollTo(0, 0);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = formSteps.findIndex(step => step.id === activeStep);
    if (currentIndex > 0) {
      setActiveStep(formSteps[currentIndex - 1].id);
      window.scrollTo(0, 0);
    }
  };

  const goToStep = (stepId: FormStepId) => {
    setActiveStep(stepId);
    window.scrollTo(0, 0);
  };

  // Form submission handler
  const handleFormSubmit = async (data: IndividualFormData) => {
    try {
      window.scrollTo(0, 0);
      
      // Filter out duplicate children by first and last name
      const uniqueChildren = (data.children || []).filter((child, index, self) =>
        index === self.findIndex(c => c.first_name === child.first_name && c.last_name === child.last_name)
      );

      // Helper to check if assistance object has meaningful values
      const hasNonEmptyValues = (obj: any, type: string) => {
        if (!obj) return false;
        switch (type) {
          case 'debt_assistance':
            return obj.needs_debt_assistance === true;
          case 'marriage_assistance':
            return obj.marriage_support_needed === true;
          case 'medical_help':
            return (Array.isArray(obj.type_of_medical_assistance_needed) && obj.type_of_medical_assistance_needed.length > 0) ||
              obj.health_insurance_coverage === true ||
              (obj.medication_distribution_frequency && obj.medication_distribution_frequency.trim().length > 0) ||
              (obj.estimated_cost_of_treatment && obj.estimated_cost_of_treatment.trim().length > 0) ||
              (obj.additional_details && obj.additional_details.trim().length > 0);
          case 'food_assistance':
            return (Array.isArray(obj.type_of_food_assistance_needed) && obj.type_of_food_assistance_needed.length > 0) || obj.food_supply_card === true;
          case 'education_assistance':
            return (obj.family_education_level && obj.family_education_level.trim().length > 0) ||
              (obj.desire_for_education && obj.desire_for_education.trim().length > 0) ||
              (Array.isArray(obj.children_educational_needs) && obj.children_educational_needs.length > 0);
          case 'shelter_assistance':
            return (obj.type_of_housing && obj.type_of_housing.trim().length > 0) ||
              (obj.housing_condition && obj.housing_condition.trim().length > 0) ||
              (obj.number_of_rooms && obj.number_of_rooms > 0) ||
              (Array.isArray(obj.household_appliances) && obj.household_appliances.length > 0);
          default:
            return Object.entries(obj).some(([_, value]) => {
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === 'boolean') return value === true;
              if (typeof value === 'number') return value > 0;
              if (typeof value === 'string') return value.trim().length > 0;
              return false;
            });
        }
      };

      // Format the data for submission
      const formattedData = {
        ...data,
        children: uniqueChildren.map(child => ({
          id: child.id, // Preserve the child ID for proper deletion tracking
          first_name: child.first_name,
          last_name: child.last_name,
          date_of_birth: child.date_of_birth,
          gender: child.gender,
          description: child.description || '',
          school_stage: child.school_stage || undefined
        })),
        additional_members: data.additional_members?.map(member => ({
          name: member.name,
          date_of_birth: member.date_of_birth,
          gender: member.gender,
          role: member.role,
          job_title: member.job_title,
          phone_number: member.phone_number,
          relation: member.relation
        })) || [],
        needs: data.needs || [],
        hashtags: data.hashtags || [],
        medical_help: hasNonEmptyValues(data.medical_help, 'medical_help') ? data.medical_help : undefined,
        food_assistance: hasNonEmptyValues(data.food_assistance, 'food_assistance') ? data.food_assistance : undefined,
        marriage_assistance: hasNonEmptyValues(data.marriage_assistance, 'marriage_assistance') ? data.marriage_assistance : undefined,
        debt_assistance: hasNonEmptyValues(data.debt_assistance, 'debt_assistance') ? data.debt_assistance : undefined,
        education_assistance: hasNonEmptyValues(data.education_assistance, 'education_assistance') ? data.education_assistance : undefined,
        shelter_assistance: hasNonEmptyValues(data.shelter_assistance, 'shelter_assistance') ? data.shelter_assistance : undefined
      };
      
      await onSubmit(formattedData);
      reset();
      setActiveStep('personal');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Get current step component
  const ActiveStepComponent = formSteps[activeStepIndex].component;

  return (
    <FormProvider {...formMethods}>
      <div className={`max-w-4xl mx-auto ${isRTL ? 'rtl text-right' : 'ltr text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Form progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('formProgress')}
            </span>
            <span className="text-sm font-medium text-gray-700">
              {formProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${formProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Form steps navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {formSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              disabled={index > activeStepIndex + 1}
              className={`
                py-2 px-4 rounded-full text-sm font-medium flex items-center
                ${index <= activeStepIndex ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-400'}
                ${activeStep === step.id ? 'ring-2 ring-blue-500' : ''}
                ${index > activeStepIndex + 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'}
              `}
              aria-current={activeStep === step.id ? 'step' : undefined}
            >
              <span className="w-5 h-5 inline-flex items-center justify-center rounded-full mr-2 bg-white">
                {index < activeStepIndex ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </span>
              {step.label}
            </button>
          ))}
        </div>

        {/* Current step heading */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {formSteps[activeStepIndex].label}
          </h2>
          <p className="text-gray-600">
            {formSteps[activeStepIndex].description}
          </p>
        </div>

        {/* Form step content */}
        <form id="individualForm" className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <ActiveStepComponent 
              families={families}
              handleAddMember={handleAddMember}
              removeMember={removeMember}
              removeChild={removeChild}
            />
          </div>

          {/* Navigation buttons */}
          <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-3 rtl:space-x-reverse pt-4`}>
            {activeStepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                icon={ArrowLeft}
                onClick={goToPreviousStep}
                disabled={isLoading}
              >
                {t('previous')}
              </Button>
            )}

            {/* Go to Review button - only show if not on last step */}
            {activeStepIndex < formSteps.length - 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => goToStep('review')}
                className="mr-auto"
              >
                {t('skipToReview')}
              </Button>
            )}

            {activeStepIndex < formSteps.length - 1 ? (
              <Button
                type="button"
                variant="primary"
                icon={ArrowRight}
                onClick={goToNextStep}
              >
                {t('next')}
              </Button>
            ) : (
              <Button
                type="button" 
                variant="primary"
                isLoading={isLoading}
                onClick={handleSubmit(handleFormSubmit)}
              >
                {t('saveIndividual')}
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
