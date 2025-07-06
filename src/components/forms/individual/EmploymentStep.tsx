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
        <div className="animate-fadeIn">
          <label className="block text-sm font-medium mb-1" htmlFor="salary">
            {t('monthlySalary')}
          </label>
          <div className="relative mt-1 rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              id="salary"
              type="number"
              {...register('salary', { valueAsNumber: true })}
              className="w-full pl-7 p-2 border rounded-md border-gray-300"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
        </div>
      )}
      
      <div className="mt-4">
        <div className="flex items-center mb-2">
          <h4 className="text-md font-medium text-gray-800">{t('workEnvironment')}</h4>
          <Tooltip content={t('workEnvironmentTooltip')} position="right" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h5 className="font-medium text-sm mb-2">{t('skills')}</h5>
            <textarea 
              {...register('employment_skills')} 
              className="w-full p-2 border rounded-md border-gray-300" 
              rows={3}
              placeholder={t('workSkillsPlaceholder')}
            />
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h5 className="font-medium text-sm mb-2">{t('preferences')}</h5>
            <textarea 
              {...register('employment_preferences')} 
              className="w-full p-2 border rounded-md border-gray-300" 
              rows={3}
              placeholder={t('workPreferencesPlaceholder')}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 