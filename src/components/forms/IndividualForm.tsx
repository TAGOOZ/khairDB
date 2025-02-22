import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { individualSchema, IndividualFormData } from '../../schemas/individualSchema';
import { Individual, Family, NeedTag } from '../../types';
import { PersonalInfoFields } from './individual/PersonalInfoFields';
import { ContactFields } from './individual/ContactFields';
import { EmploymentFields } from './individual/EmploymentFields';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Plus, Trash2 } from 'lucide-react';
import { AddMemberButton } from './individual/AddMemberButton';
import { useLanguage } from '../../contexts/LanguageContext';
import { Checkbox } from '../ui/Checkbox';
import { RadioGroup } from '../ui/RadioGroup';
import { Tag } from '../ui/Tag';
import { NeedsForm } from './NeedsForm';  // Add this import

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
      medical_need: {
        chronic_disease: 'no',
        treatment_frequency: 'irregular',
        treatment_affordability: 'incapable',
        health_insurance: 'no'
      },
      food_need: {
        type: 'none',
        has_supply_card: false
      },
      marriage_need: {
        status: 'none'
      },
      need_tags: []
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

  const needTags: { value: NeedTag; label: string }[] = [
    { value: 'ramadan', label: 'خير رمضان' },
    { value: 'school_supplies', label: 'قلم وكراسة' },
    { value: 'clothes', label: 'ملابس' },
    { value: 'adha', label: 'اضحية' },
    { value: 'blankets', label: 'بطاطين' },
    { value: 'monthly_sponsorship', label: 'كفالة شهرية' },
    { value: 'zakat', label: 'زكاة مال' },
    { value: 'eid', label: 'عيدية' },
  ];

  const renderMedicalNeedSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Checkbox
            label="كشف"
            checked={watch('medical_need.examination')}
            onChange={(e) => setValue('medical_need.examination', e.target.checked)}
          />
          {watch('medical_need.examination') && (
            <Textarea
              label="تفاصيل الكشف"
              value={watch('medical_need.examination_description')}
              onChange={(e) => setValue('medical_need.examination_description', e.target.value)}
            />
          )}
        </div>
        <div>
          <Checkbox
            label="تحاليل"
            checked={watch('medical_need.tests')}
            onChange={(e) => setValue('medical_need.tests', e.target.checked)}
          />
          {watch('medical_need.tests') && (
            <Textarea
              label="تفاصيل التحاليل"
              value={watch('medical_need.tests_description')}
              onChange={(e) => setValue('medical_need.tests_description', e.target.value)}
            />
          )}
        </div>
        <div>
          <Checkbox
            label="اشعة"
            checked={watch('medical_need.xray')}
            onChange={(e) => setValue('medical_need.xray', e.target.checked)}
          />
          {watch('medical_need.xray') && (
            <Textarea
              label="تفاصيل الاشعة"
              value={watch('medical_need.xray_description')}
              onChange={(e) => setValue('medical_need.xray_description', e.target.value)}
            />
          )}
        </div>
        <div>
          <Checkbox
            label="عمليات"
            checked={watch('medical_need.operations')}
            onChange={(e) => setValue('medical_need.operations', e.target.checked)}
          />
          {watch('medical_need.operations') && (
            <Textarea
              label="تفاصيل العمليات"
              value={watch('medical_need.operations_description')}
              onChange={(e) => setValue('medical_need.operations_description', e.target.value)}
            />
          )}
        </div>
      </div>

      <RadioGroup
        label="هل يعاني احد افراد الاسرة من امراض مزمنة"
        value={watch('medical_need.chronic_disease')}
        onChange={(value) => setValue('medical_need.chronic_disease', value)}
        options={[
          { value: 'yes', label: 'نعم' },
          { value: 'no', label: 'لا' }
        ]}
      />

      <RadioGroup
        label="ما هي دورية صرف العلاج"
        value={watch('medical_need.treatment_frequency')}
        onChange={(value) => setValue('medical_need.treatment_frequency', value)}
        options={[
          { value: 'monthly', label: 'شهري' },
          { value: 'irregular', label: 'غير منتظم' }
        ]}
      />

      <RadioGroup
        label="مدى قدرة الاسرة على نفقات العلاج"
        value={watch('medical_need.treatment_affordability')}
        onChange={(value) => setValue('medical_need.treatment_affordability', value)}
        options={[
          { value: 'capable', label: 'قادرة' },
          { value: 'incapable', label: 'غير قادرة' },
          { value: 'partially', label: 'الى حد ما' }
        ]}
      />

      <RadioGroup
        label="هل هناك أحد من أفراد الاسرة مشترك في التأمين الصحي"
        value={watch('medical_need.health_insurance')}
        onChange={(value) => setValue('medical_need.health_insurance', value)}
        options={[
          { value: 'yes', label: 'نعم' },
          { value: 'no', label: 'لا' }
        ]}
      />
    </div>
  );

  const renderFoodNeedSection = () => (
    <div className="space-y-4">
      <RadioGroup
        label="الحالة من ملف اطعام"
        value={watch('food_need.type')}
        onChange={(value) => setValue('food_need.type', value)}
        options={[
          { value: 'ready', label: 'تحتاج الى اطعام جاهز' },
          { value: 'not_ready', label: 'تحتاج الى اطعام غير جاهز' },
          { value: 'none', label: 'لا تحتاج' }
        ]}
      />

      <RadioGroup
        label="هل يوجد اشتراك في بطاقة التموين"
        value={watch('food_need.has_supply_card')}
        onChange={(value) => setValue('food_need.has_supply_card', value)}
        options={[
          { value: true, label: 'نعم' },
          { value: false, label: 'لا' }
        ]}
      />
    </div>
  );

  const renderMarriageNeedSection = () => (
    <div className="space-y-4">
      <RadioGroup
        label="ملف الزواج"
        value={watch('marriage_need.status')}
        onChange={(value) => setValue('marriage_need.status', value)}
        options={[
          { value: 'katb_ketab', label: 'مرحلة كتب الكتاب' },
          { value: 'not_yet', label: 'لم يتم كتب الكتاب' },
          { value: 'none', label: 'لا تحتاج' }
        ]}
      />

      {watch('marriage_need.status') !== 'none' && (
        <>
          <input
            type="date"
            {...register('marriage_need.wedding_date')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="ميعاد الفرح"
          />
          <Textarea
            label="الاحتياجات المطلوبة"
            value={watch('marriage_need.requirements')}
            onChange={(e) => setValue('marriage_need.requirements', e.target.value)}
          />
        </>
      )}
    </div>
  );

  const renderNeedTags = () => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        الاحتياجات
      </label>
      <div className="flex flex-wrap gap-2">
        {needTags.map((tag) => (
          <Tag
            key={tag.value}
            label={tag.label}
            selected={watch('need_tags')?.includes(tag.value)}
            onClick={() => {
              const currentTags = watch('need_tags') || [];
              if (currentTags.includes(tag.value)) {
                setValue('need_tags', currentTags.filter(t => t !== tag.value));
              } else {
                setValue('need_tags', [...currentTags, tag.value]);
              }
            }}
          />
        ))}
      </div>
    </div>
  );

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
                    <Textarea
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
                <Textarea
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

      {/* Replace the entire Needs Section with NeedsForm */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{t('needs')}</h3>
        </div>
        
        <NeedsForm
          onSubmit={(needsData) => {
            setValue('medical_need', needsData.medicalChecks);
            setValue('food_need', needsData.feedingStatus);
            setValue('marriage_need', {
              status: needsData.marriageStage,
              wedding_date: needsData.weddingDate,
              requirements: needsData.marriageNeeds
            });
            setValue('need_tags', needsData.selectedTags);
          }}
          onCancel={() => {}}
          initialData={watch()}
        />
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