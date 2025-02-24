import React, { useEffect } from 'react';
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
import { Input } from '../ui/Input';
import { Plus, Trash2, Heart, Home, GraduationCap, DollarSign, BellRing as Ring, Utensils } from 'lucide-react';
import { AddMemberButton } from './individual/AddMemberButton';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../ui/Card';

interface IndividualFormProps {
  onSubmit: (data: IndividualFormData) => Promise<void>;
  isLoading: boolean;
  families: Family[];
  initialData?: Individual;
}

export function IndividualForm({ onSubmit, isLoading, families, initialData }: IndividualFormProps) {
  const { t } = useLanguage();
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
        estimated_cost_ability: '',
        has_health_insurance: false,
        additional_details: ''
      },
      food_assistance: {
        type_of_food_assistance_needed: [],
        food_supply_card: false
      },
      marriage_assistance: {
        needs_marriage_assistance: false,
        marriage_contract_signed: false,
        wedding_date: '',
        specific_needs: ''
      },
      debt_assistance: {
        has_debt: false,
        debt_reason: '',
        debt_amount: '',
        has_official_documents: false
      },
      education_assistance: {
        education_level: '',
        desire_for_education: '',
        children_educational_needs: []
      },
      shelter_assistance: {
        housing_type: '',
        housing_condition: '',
        number_of_rooms: '',
        household_appliances: []
      }
    }
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
      await onSubmit(data);
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
        description: memberData.description,
        role: 'child'
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <div className="p-6 space-y-6">
          <PersonalInfoFields register={register} errors={errors} />
          <ContactFields register={register} errors={errors} families={families} setValue={setValue} />
          <EmploymentFields register={register} errors={errors} control={control} />
        </div>
      </Card>

      {/* Medical Assistance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">{t('medicalAssistance')}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('typeOfMedicalAssistance')}
                </label>
                <div className="space-y-2">
                  {['Medical Checkup', 'Lab Tests', 'X-rays/Scans', 'Surgeries'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('medical_help.type_of_medical_assistance_needed')}
                        value={type}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{t(type.toLowerCase())}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Select
                  label={t('medicationFrequency')}
                  {...register('medical_help.medication_distribution_frequency')}
                  options={[
                    { value: 'Monthly', label: t('monthly') },
                    { value: 'Intermittent', label: t('intermittent') }
                  ]}
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('estimatedCostAbility')}
                  </label>
                  <div className="space-y-2">
                    {['Able', 'Unable', 'Partially'].map(ability => (
                      <label key={ability} className="flex items-center gap-2">
                        <input
                          type="radio"
                          {...register('medical_help.estimated_cost_ability')}
                          value={ability}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{t(ability.toLowerCase())}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('medical_help.has_health_insurance')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t('hasHealthInsurance')}</span>
                  </label>
                </div>
              </div>
            </div>
            <TextArea
              label={t('additionalDetails')}
              {...register('medical_help.additional_details')}
            />
          </div>
        </div>
      </Card>

      {/* Food Assistance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Utensils className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">{t('foodAssistance')}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('typeOfFoodAssistance')}
                </label>
                <div className="space-y-2">
                  {['Ready-made meals', 'Non-ready meals'].map(type => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        {...register('food_assistance.type_of_food_assistance_needed')}
                        value={type}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{t(type.toLowerCase())}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('food_assistance.food_supply_card')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t('hasSupplyCard')}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Marriage Assistance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ring className="w-5 h-5 text-pink-500" />
            <h2 className="text-lg font-semibold">{t('marriageAssistance')}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('marriage_assistance.needs_marriage_assistance')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t('needsMarriageAssistance')}</span>
                </label>
                <label className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    {...register('marriage_assistance.marriage_contract_signed')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t('marriageContractSigned')}</span>
                </label>
              </div>
              <div>
                <Input
                  type="date"
                  label={t('weddingDate')}
                  {...register('marriage_assistance.wedding_date')}
                />
              </div>
            </div>
            <TextArea
              label={t('specificNeeds')}
              {...register('marriage_assistance.specific_needs')}
            />
          </div>
        </div>
      </Card>

      {/* Debt Assistance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold">{t('debtAssistance')}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...register('debt_assistance.has_debt')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{t('hasDebt')}</span>
                </label>
              </div>
              <div>
                <Input
                  label={t('debtAmount')}
                  {...register('debt_assistance.debt_amount')}
                />
              </div>
            </div>
            <TextArea
              label={t('debtReason')}
              {...register('debt_assistance.debt_reason')}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('debt_assistance.has_official_documents')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('hasOfficialDocuments')}</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Education Assistance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold">{t('educationAssistance')}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('educationLevel')}
                {...register('education_assistance.education_level')}
                options={[
                  { value: 'higher', label: t('higherEducation') },
                  { value: 'intermediate', label: t('intermediateEducation') },
                  { value: 'literate', label: t('literate') },
                  { value: 'illiterate', label: t('illiterate') }
                ]}
              />
              {watch('education_assistance.education_level') === 'illiterate' && (
                <Select
                  label={t('desireForEducation')}
                  {...register('education_assistance.desire_for_education')}
                  options={[
                    { value: 'high', label: t('high') },
                    { value: 'medium', label: t('medium') },
                    { value: 'low', label: t('low') }
                  ]}
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('childrenEducationalNeeds')}
              </label>
              <div className="space-y-2">
                {[
                  'Tuition Fees',
                  'School Uniforms',
                  'Books',
                  'Supplies',
                  'Tutoring'
                ].map(need => (
                  <label key={need} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('education_assistance.children_educational_needs')}
                      value={need}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t(need.toLowerCase())}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Shelter Assistance */}
      <Card>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Home className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold">{t('shelterAssistance')}</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label={t('housingType')}
                {...register('shelter_assistance.housing_type')}
                options={[
                  { value: 'owned', label: t('owned') },
                  { value: 'new_rental', label: t('newRental') },
                  { value: 'old_rental', label: t('oldRental') }
                ]}
              />
              <Select
                label={t('housingCondition')}
                {...register('shelter_assistance.housing_condition')}
                options={[
                  { value: 'healthy', label: t('healthy') },
                  { value: 'moderate', label: t('moderate') },
                  { value: 'unhealthy', label: t('unhealthy') }
                ]}
              />
              <Input
                label={t('numberOfRooms')}
                type="number"
                min="1"
                {...register('shelter_assistance.number_of_rooms')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('householdAppliances')}
              </label>
              <div className="space-y-2">
                {[
                  'Stove',
                  'Manual Washing Machine',
                  'Automatic Washing Machine',
                  'Refrigerator',
                  'Fan'
                ].map(appliance => (
                  <label key={appliance} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...register('shelter_assistance.household_appliances')}
                      value={appliance}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{t(appliance.toLowerCase())}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Family Members */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">{t('familyMembers')}</h2>
            <div onClick={(e) => e.preventDefault()}>
              <AddMemberButton onAddMember={handleAddMember} />
            </div>
          </div>

          {/* Additional Members */}
          {memberFields.length > 0 && (
            <div className="space-y-4 mb-6">
              <h3 className="text-md font-medium text-gray-800">{t('additionalMembers')}</h3>
              <div className="space-y-4">
                {memberFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        {watch(`additional_members.${index}.name`)} - {watch(`additional_members.${index}.relation`)}
                      </h4>
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
            </div>
          )}

          {/* Children */}
          {childFields.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-800">{t('children')}</h3>
              <div className="space-y-4">
                {childFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        {watch(`children.${index}.first_name`)} {watch(`children.${index}.last_name`)}
                      </h4>
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
            </div>
          )}
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
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
