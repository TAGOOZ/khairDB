import React from 'react';
import { UseFormRegister, FieldErrors, Control, useWatch } from 'react-hook-form';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { useLanguage } from '../../../contexts/LanguageContext';

interface EmploymentFieldsProps {
  register: UseFormRegister<IndividualFormData>;
  errors: FieldErrors<IndividualFormData>;
  control: Control<IndividualFormData>;
}

export function EmploymentFields({ register, errors, control }: EmploymentFieldsProps) {
  const { t } = useLanguage();
  
  const employmentStatus = useWatch({
    control,
    name: 'employment_status'
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">{t('employmentInfo')}</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label={t('job')}
          {...register('job')}
          error={errors.job?.message}
          placeholder={t('enterJobTitle')}
        />

        <Select
          label={t('employmentStatus')}
          {...register('employment_status')}
          error={errors.employment_status?.message}
          options={[
            { value: 'no_salary', label: t('noSalary') },
            { value: 'has_salary', label: t('hasSalary') },
            { value: 'social_support', label: t('socialSupport') }
          ]}
        />

        {employmentStatus === 'has_salary' && (
          <Input
            type="number"
            label={t('salary')}
            {...register('salary', { 
              valueAsNumber: true,
              setValueAs: v => v === '' ? null : parseFloat(v)
            })}
            error={errors.salary?.message}
            placeholder="0.00"
          />
        )}
      </div>
    </div>
  );
}
