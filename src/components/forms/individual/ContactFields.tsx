import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { TextArea } from '../../ui/TextArea';
import { Family } from '../../../types';
import { useLanguage } from '../../../contexts/LanguageContext';

interface ContactFieldsProps {
  register: UseFormRegister<IndividualFormData>;
  errors: FieldErrors<IndividualFormData>;
  families: Family[];
}

export function ContactFields({ register, errors, families }: ContactFieldsProps) {
  const { t } = useLanguage();
  
  const districts = [
    { value: 'الكنيسة', label: 'الكنيسة' },
    { value: 'عمارة المعلمين', label: 'عمارة المعلمين' },
    { value: 'المرور', label: 'المرور' },
    { value: 'المنشية', label: 'المنشية' },
    { value: 'الرشيدية', label: 'الرشيدية' },
    { value: 'شارع الثورة', label: 'شارع الثورة' },
    { value: 'الزهور', label: 'الزهور' },
    { value: 'أبو خليل', label: 'أبو خليل' },
    { value: 'الكوادي', label: 'الكوادي' },
    { value: 'القطعة', label: 'القطعة' },
    { value: 'كفر امليط', label: 'كفر امليط' },
    { value: 'الشيخ زايد', label: 'الشيخ زايد' },
    { value: 'السببل', label: 'السببل' },
    { value: 'قري', label: 'قري' }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{t('contactInfo')}</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          type="tel"
          label={t('phone')}
          {...register('phone')}
          error={errors.phone?.message}
          placeholder={t('enterPhone')}
        />

        <Select
          label={t('district')}
          {...register('district')}
          error={errors.district?.message}
          options={[
            { value: '', label: t('selectDistrict') },
            ...districts
          ]}
        />

        <Select
          label={t('familyName')}
          {...register('family_id')}
          error={errors.family_id?.message}
          options={[
            { value: '', label: t('noFamily') },
            ...families.map(family => ({
              value: family.id,
              label: family.name
            }))
          ]}
        />

        <Input
          label={t('address')}
          {...register('address')}
          error={errors.address?.message}
          placeholder={t('enterAddress')}
        />
      </div>

      <TextArea
        label={t('description')}
        {...register('description')}
        error={errors.description?.message}
        placeholder={t('enterDescription')}
      />
    </div>
  );
}