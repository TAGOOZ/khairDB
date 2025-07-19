import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { IndividualFormData } from '../../../schemas/individualSchema';

export function EmploymentStep() {
  const { t } = useLanguage();
  const { 
    register, 
    formState: { errors }, 
    watch, 
    control 
  } = useFormContext<IndividualFormData>();

  const employmentStatus = watch('employment_status');
  const showSalaryField = employmentStatus === 'has_salary';

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium mb-4 pb-2 border-b">
        {t('employmentInformation')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="job">
            {t('job')}
          </label>
          <input 
            id="job"
            type="text" 
            {...register('job')} 
            className="w-full p-2 border rounded-md border-gray-300" 
            placeholder={t('enterJobTitle')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="employment_status">
            {t('employmentStatus')}
            <Tooltip content={t('employmentStatusTooltip')} position="right" />
          </label>
          <select 
            id="employment_status"
            {...register('employment_status')} 
            className="w-full p-2 border rounded-md border-gray-300"
          >
            <option value="no_salary">{t('noSalary')}</option>
            <option value="has_salary">{t('hasSalary')}</option>
            <option value="social_support">{t('socialSupport')}</option>
          </select>
        </div>
      </div>
      
      {/* Show salary field conditionally */}
      {showSalaryField && (
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="salary">
            {t('salary')}
          </label>
          <Controller
            name="salary"
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <input
                type="number"
                id="salary"
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                className="w-full p-2 border rounded-md border-gray-300"
                placeholder="0"
              />
            )}
          />
        </div>
      )}
    </div>
  );
} 