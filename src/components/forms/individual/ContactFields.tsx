import React, { useState } from 'react';
import { UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
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
  setValue: UseFormSetValue<IndividualFormData>;
}

export function ContactFields({ register, errors, families, setValue }: ContactFieldsProps) {
  const { t } = useLanguage();
  const [familyOption, setFamilyOption] = useState<'existing' | 'new'>('existing');
  const [newFamilyName, setNewFamilyName] = useState('');
  
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

  const handleFamilyOptionChange = (option: 'existing' | 'new') => {
    setFamilyOption(option);
    if (option === 'new') {
      setValue('family_id', null);
      setValue('new_family_name', newFamilyName);
    } else {
      setValue('new_family_name', '');
    }
  };

  const handleNewFamilyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewFamilyName(value);
    setValue('new_family_name', value);
  };

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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('familyOption')}
          </label>
          <div className="flex space-x-4 mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                checked={familyOption === 'existing'}
                onChange={() => handleFamilyOptionChange('existing')}
              />
              <span className="mr-2">{t('chooseExistingFamily')}</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                checked={familyOption === 'new'}
                onChange={() => handleFamilyOptionChange('new')}
              />
              <span className="mr-2">{t('createNewFamily')}</span>
            </label>
          </div>

          {familyOption === 'existing' ? (
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
          ) : (
            <Input
              label={t('newFamilyName')}
              value={newFamilyName}
              onChange={handleNewFamilyNameChange}
              placeholder={t('enterFamilyName')}
              error={errors.new_family_name?.message}
            />
          )}
        </div>

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
