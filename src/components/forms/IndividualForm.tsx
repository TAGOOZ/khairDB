import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { individualSchema, IndividualFormData } from '../../schemas/individualSchema';
import { Individual, Family } from '../../types';
import { PersonalInfoFields } from './individual/PersonalInfoFields';
import { ContactFields } from './individual/ContactFields';
import { EmploymentFields } from './individual/EmploymentFields';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Plus, Trash2 } from 'lucide-react';
import { AddMemberButton } from './individual/AddMemberButton';
import { useLanguage } from '../../contexts/LanguageContext';

interface IndividualFormProps {
  onSubmit: (data: IndividualFormData) => Promise<void>;
  isLoading: boolean;
  families: Family[];
  initialData?: Individual;
}

export function IndividualForm({ onSubmit, isLoading, families, initialData }: IndividualFormProps) {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch
  } = useForm<IndividualFormData>({
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
        debt_status: false,
        reason_for_debt: '',
        debt_amount: 0,
        official_debt_documents: null
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
    }
  });

  const { fields: needFields, append: appendNeed, remove: removeNeed } = useFieldArray({
    control,
    name: 'needs'
  });

  const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({
    control,
    name: 'additional_members'
  });

  const { fields: childFields, append: appendChild, remove: removeChild } = useFieldArray({
    control,
    name: 'children'
  });

  const handleFormSubmit = async (data: IndividualFormData) => {
    try {
      // Transform the data to include role information
      const formattedData = {
        ...data,
        role: 'parent',
        children: data.children?.map(child => ({
          first_name: child.first_name,
          last_name: child.last_name,
          date_of_birth: child.date_of_birth,
          gender: child.gender || 'male',
          marital_status: 'single',
          employment_status: 'no_salary',
          salary: null,
          role: 'child',
          family_id: data.family_id,
          description: child.description || '',
          school_stage: child.school_stage || null,
          // Add any other required fields with default values
          phone: '',
          district: '',
          address: '',
          job: '',
          id_number: ''
        })) || [],
        additional_members: data.additional_members || [],
        needs: data.needs || []
      };
    
      console.log('Submitting data:', formattedData);
      
      await onSubmit(formattedData);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleAddMember = (memberData: any) => {
    if (memberData.gender === 'boy' || memberData.gender === 'girl') {
      appendChild({
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        date_of_birth: memberData.date_of_birth,
        gender: memberData.gender === 'boy' ? 'male' : 'female',
        school_stage: memberData.school_stage,
        description: memberData.description
      });
    } else {
      appendMember({
        name: memberData.name,
        date_of_birth: memberData.date_of_birth,
        gender: memberData.gender,
        role: memberData.role,
        job_title: memberData.job_title,
        phone_number: memberData.phone_number,
        relation: memberData.relation
      });
    }
  };

  return (
    <form 
      onSubmit={handleSubmit(handleFormSubmit)} 
      className={`space-y-6 max-w-4xl mx-auto ${isRTL ? 'rtl text-right' : 'ltr text-left'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <PersonalInfoFields register={register} errors={errors} />
      <ContactFields register={register} errors={errors} families={families} setValue={setValue} />
      
      {/* Employment Fields */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('employmentInformation')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('job')}</label>
            <input 
              type="text" 
              {...register('job')} 
              className="w-full p-2 border rounded-md" 
              placeholder={t('enterJobTitle')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('employmentStatus')}</label>
            <select 
              {...register('employment_status')} 
              className="w-full p-2 border rounded-md"
            >
              <option value="no_salary">{t('noSalary')}</option>
              <option value="with_salary">{t('hasSalary')}</option>
              <option value="social_support">{t('socialSupport')}</option>
            </select>
          </div>
        </div>
        <EmploymentFields register={register} errors={errors} control={control} />
      </div>

      {/* Medical Help Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('medicalHelp')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('typeOfMedicalAssistance')}</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center space-x-2 rtl:space-x-reverse">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="Medical Checkup" 
                  className="mr-0"
                />
                <span>{t('medicalCheckup')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="Lab Tests" 
                  className="mr-2"
                />
                <span>{t('labTests')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="X-rays/Scans" 
                  className="mr-2"
                />
                <span>{t('xraysScans')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('medical_help.type_of_medical_assistance_needed')} 
                  value="Surgeries" 
                  className="mr-2"
                />
                <span>{t('surgeries')}</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('additionalDetails')}</label>
            <textarea 
              {...register('medical_help.additional_details')} 
              className="w-full p-2 border rounded-md" 
              placeholder={t('additionalDetails')}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('medicationDistributionFrequency')}</label>
              <select 
                {...register('medical_help.medication_distribution_frequency')} 
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t('choose')}</option>
                <option value="Monthly">{t('monthly')}</option>
                <option value="Intermittent">{t('intermittent')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('estimatedCostOfTreatment')}</label>
              <select 
                {...register('medical_help.estimated_cost_of_treatment')} 
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t('choose')}</option>
                <option value="Able">{t('ableToAfford')}</option>
                <option value="Unable">{t('unableToAfford')}</option>
                <option value="Partially">{t('partiallyAble')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('medical_help.health_insurance_coverage')} 
                className="mr-2"
              />
              <span>{t('healthInsuranceCoverage')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Food Assistance Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('foodAssistance')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('typeOfFoodAssistance')}</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('food_assistance.type_of_food_assistance_needed')} 
                  value="Ready-made meals" 
                  className="mr-2"
                />
                <span>{t('readyMadeMeals')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('food_assistance.type_of_food_assistance_needed')} 
                  value="Non-ready meals" 
                  className="mr-2"
                />
                <span>{t('nonReadyMeals')}</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('food_assistance.food_supply_card')} 
                className="mr-2"
              />
              <span>{t('foodSupplyCard')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Marriage Assistance Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('marriageAssistance')}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('marriage_assistance.marriage_support_needed')} 
                  className="mr-2"
                />
                <span>{t('marriageSupportNeeded')}</span>
              </label>
            </div>
            <div>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('marriage_assistance.wedding_contract_signed')} 
                  className="mr-2"
                />
                <span>{t('weddingContractSigned')}</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('weddingDate')}</label>
            <input 
              type="date" 
              {...register('marriage_assistance.wedding_date')} 
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('specificNeeds')}</label>
            <textarea 
              {...register('marriage_assistance.specific_needs')} 
              className="w-full p-2 border rounded-md" 
              placeholder={t('whatAreTheNeeds')}
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Debt Assistance Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('debtAssistance')}</h3>
        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                {...register('debt_assistance.debt_status')} 
                className="mr-2"
              />
              <span>{t('debtStatus')}</span>
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('reasonForDebt')}</label>
            <input 
              type="text" 
              {...register('debt_assistance.reason_for_debt')} 
              className="w-full p-2 border rounded-md" 
              placeholder={t('whatIsReasonForDebt')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('debtAmount')}</label>
            <input 
              type="number" 
              {...register('debt_assistance.debt_amount')} 
              className="w-full p-2 border rounded-md" 
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('uploadOfficialDebtDocuments')}</label>
            <input 
              type="file" 
              {...register('debt_assistance.official_debt_documents')} 
              className="w-full p-2"
            />
          </div>
        </div>
      </div>

      {/* Education Assistance Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('educationAssistance')}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('familyEducationLevel')}</label>
            <select 
              {...register('education_assistance.family_education_level')} 
              className="w-full p-2 border rounded-md"
            >
              <option value="">{t('choose')}</option>
              <option value="Higher Education">{t('higherEducation')}</option>
              <option value="Intermediate Education">{t('intermediateEducation')}</option>
              <option value="Literate">{t('literate')}</option>
              <option value="Illiterate">{t('illiterate')}</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('desireForEducation')}</label>
            <input 
              type="text" 
              {...register('education_assistance.desire_for_education')} 
              className="w-full p-2 border rounded-md" 
              placeholder={t('whatIsDesireForEducation')}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('childrenEducationalNeeds')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Tuition Fees" 
                  className="mr-2"
                />
                <span>{t('tuitionFees')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="School Uniforms" 
                  className="mr-2"
                />
                <span>{t('schoolUniforms')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Books" 
                  className="mr-2"
                />
                <span>{t('books')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Supplies" 
                  className="mr-2"
                />
                <span>{t('supplies')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('education_assistance.children_educational_needs')} 
                  value="Tutoring" 
                  className="mr-2"
                />
                <span>{t('tutoring')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Shelter Assistance Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 pb-2 border-b">{t('shelterAssistance')}</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('typeOfHousing')}</label>
              <select 
                {...register('shelter_assistance.type_of_housing')} 
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t('choose')}</option>
                <option value="Owned">{t('owned')}</option>
                <option value="New Rental">{t('newRental')}</option>
                <option value="Old Rental">{t('oldRental')}</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">{t('housingCondition')}</label>
              <select 
                {...register('shelter_assistance.housing_condition')} 
                className="w-full p-2 border rounded-md"
              >
                <option value="">{t('choose')}</option>
                <option value="Healthy">{t('healthy')}</option>
                <option value="Moderate">{t('moderate')}</option>
                <option value="Unhealthy">{t('unhealthy')}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t('numberOfRooms')}</label>
            <input 
              type="number" 
              {...register('shelter_assistance.number_of_rooms')} 
              className="w-full p-2 border rounded-md" 
              placeholder="0"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">{t('householdAppliances')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Stove" 
                  className="mr-2"
                />
                <span>{t('stove')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Manual Washing Machine" 
                  className="mr-2"
                />
                <span>{t('manualWashingMachine')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Automatic Washing Machine" 
                  className="mr-2"
                />
                <span>{t('automaticWashingMachine')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Refrigerator" 
                  className="mr-2"
                />
                <span>{t('refrigerator')}</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  {...register('shelter_assistance.household_appliances')} 
                  value="Fan" 
                  className="mr-2"
                />
                <span>{t('fan')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-medium">{t('familyMembers')}</h3>
          <div onClick={(e) => e.preventDefault()}>
            <AddMemberButton onAddMember={handleAddMember} />
          </div>
        </div>

        {/* Display Additional Members */}
        {memberFields.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-medium text-gray-800">{t('additionalMembers')}</h4>
            {memberFields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-medium">
                    {watch(`additional_members.${index}.name`)} - {watch(`additional_members.${index}.relation`)}
                  </h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => removeMember(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('remove')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    {...register(`additional_members.${index}.name`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('name')}
                  />
                  <input
                    type="date"
                    {...register(`additional_members.${index}.date_of_birth`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <Select
                    {...register(`additional_members.${index}.role`)}
                    options={[
                      { value: 'spouse', label: t('spouse') },
                      { value: 'sibling', label: t('sibling') },
                      { value: 'grandparent', label: t('grandparent') },
                      { value: 'other', label: t('other') }
                    ]}
                  />
                  <input
                    type="text"
                    {...register(`additional_members.${index}.job_title`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('jobTitle')}
                  />
                  <input
                    type="tel"
                    {...register(`additional_members.${index}.phone_number`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('phoneNumber')}
                  />
                  <Select
                    {...register(`additional_members.${index}.relation`)}
                    options={[
                      { value: 'wife', label: t('wife') },
                      { value: 'husband', label: t('husband') },
                      { value: 'sister', label: t('sister') },
                      { value: 'brother', label: t('brother') },
                      { value: 'mother', label: t('mother') },
                      { value: 'father', label: t('father') },
                      { value: 'mother_in_law', label: t('motherInLaw') },
                      { value: 'father_in_law', label: t('fatherInLaw') }
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Display Children */}
        {childFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">{t('children')}</h4>
            {childFields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg border space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-medium">
                    {watch(`children.${index}.first_name`)} {watch(`children.${index}.last_name`)}
                  </h5>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => removeChild(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('remove')}
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    {...register(`children.${index}.first_name`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('firstName')}
                  />
                  <input
                    type="text"
                    {...register(`children.${index}.last_name`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder={t('lastName')}
                  />
                  <input
                    type="date"
                    {...register(`children.${index}.date_of_birth`)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <Select
                    {...register(`children.${index}.school_stage`)}
                    options={[
                      { value: 'kindergarten', label: t('kindergarten') },
                      { value: 'primary', label: t('primary') },
                      { value: 'preparatory', label: t('preparatory') },
                      { value: 'secondary', label: t('secondary') }
                    ]}
                  />
                  <div className="md:col-span-2">
                    <TextArea
                      {...register(`children.${index}.description`)}
                      placeholder={t('description')}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Needs Section */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-lg font-medium">{t('needs')}</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => appendNeed({
              category: 'medical',
              priority: 'medium',
              description: '',
              status: 'pending'
            })}
          >
            {t('addNeed')}
          </Button>
        </div>

        <div className="space-y-4">
          {needFields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 p-4 rounded-lg border space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-900">{t('need')} {index + 1}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon={Trash2}
                  onClick={() => removeNeed(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  {t('remove')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label={t('category')}
                  {...register(`needs.${index}.category`)}
                  error={errors.needs?.[index]?.category?.message}
                  options={[
                    { value: 'medical', label: t('medical') },
                    { value: 'financial', label: t('financial') },
                    { value: 'food', label: t('food') },
                    { value: 'shelter', label: t('shelter') },
                    { value: 'clothing', label: t('clothing') },
                    { value: 'education', label: t('education') },
                    { value: 'employment', label: t('employment') },
                    { value: 'transportation', label: t('transportation') },
                    { value: 'other', label: t('other') }
                  ]}
                />

                <Select
                  label={t('priority')}
                  {...register(`needs.${index}.priority`)}
                  error={errors.needs?.[index]?.priority?.message}
                  options={[
                    { value: 'low', label: t('low') },
                    { value: 'medium', label: t('medium') },
                    { value: 'high', label: t('high') },
                    { value: 'urgent', label: t('urgent') }
                  ]}
                />

                <div className="md:col-span-2">
                  <TextArea
                    label={t('description')}
                    {...register(`needs.${index}.description`)}
                    error={errors.needs?.[index]?.description?.message}
                    placeholder={t('describeNeed')}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} space-x-3 rtl:space-x-reverse pt-4`}>
        <Button
          type="button"
          variant="outline"
          onClick={() => reset()}
          disabled={isLoading}
        >
          {t('reset')}
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {t('saveIndividual')}
        </Button>
      </div>
    </form>
  );
}
