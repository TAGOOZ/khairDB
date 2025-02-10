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
      children: []
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
      await onSubmit({
        ...data,
        children: data.children || [],
        additional_members: data.additional_members || [],
        needs: data.needs || []
      });
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <PersonalInfoFields register={register} errors={errors} />
      <ContactFields register={register} errors={errors} families={families} setValue={setValue} />
      <EmploymentFields register={register} errors={errors} control={control} />

      {/* Family Members Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{t('familyMembers')}</h3>
          <div onClick={(e) => e.preventDefault()}>
            <AddMemberButton onAddMember={handleAddMember} />
          </div>
        </div>

        {/* Display Additional Members */}
        {memberFields.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">{t('additionalMembers')}</h4>
            {memberFields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-medium text-gray-900">
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
              <div key={field.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="flex justify-between items-start">
                  <h5 className="text-sm font-medium text-gray-900">
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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{t('needs')}</h3>
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

        {needFields.map((field, index) => (
          <div key={field.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
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