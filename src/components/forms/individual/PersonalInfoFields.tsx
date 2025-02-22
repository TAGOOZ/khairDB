import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { useLanguage } from '../../../contexts/LanguageContext';

interface PersonalInfoFieldsProps {
  register: UseFormRegister<IndividualFormData>;
  errors: FieldErrors<IndividualFormData>;
}

export function PersonalInfoFields({ register, errors }: PersonalInfoFieldsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{t('personalInfo')}</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label={t('firstName')}
          {...register('first_name')}
          error={errors.first_name?.message}
          placeholder={t('enterFirstName')}
        />

        <Input
          label={t('lastName')}
          {...register('last_name')}
          error={errors.last_name?.message}
          placeholder={t('enterLastName')}
        />

        <Input
          label={t('idNumber')}
          {...register('id_number')}
          error={errors.id_number?.message}
          placeholder={t('enterIdNumber')}
          maxLength={14}
        />

        <Input
          type="date"
          label={t('dateOfBirth')}
          {...register('date_of_birth')}
          error={errors.date_of_birth?.message}
          max={new Date().toISOString().split('T')[0]}
        />

        <Select
          label={t('gender')}
          {...register('gender')}
          error={errors.gender?.message}
          options={[
            { value: '', label: t('selectGender') },
            { value: 'male', label: t('male') },
            { value: 'female', label: t('female') }
          ]}
        />

        <Select
          label={t('maritalStatus')}
          {...register('marital_status')}
          error={errors.marital_status?.message}
          options={[
            { value: '', label: t('selectMaritalStatus') },
            { value: 'single', label: t('single') },
            { value: 'married', label: t('married') },
            { value: 'widowed', label: t('widowed') }
          ]}
        />
        
        <Select
          label={t('listStatus')}
          {...register('list_status')}
          error={errors.list_status?.message}
          options={[
            { value: 'whitelist', label: t('whitelist') },
            { value: 'blacklist', label: t('blacklist') },
            { value: 'waitinglist', label: t('waitinglist') }
          ]}
        />
      </div>
    </div>
  );
}
