import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { IndividualFormData } from '../../../schemas/individualSchema';

export function NeedsStep() {
  const { t } = useLanguage();
  const { control, register, formState: { errors } } = useFormContext<IndividualFormData>();
  
  // Setup field array for needs
  const { 
    fields: needFields, 
    append: appendNeed, 
    remove: removeNeed 
  } = useFieldArray({
    control,
    name: 'needs'
  });

  // Add a new need
  const handleAddNeed = () => {
    appendNeed({
      category: 'medical',
      priority: 'medium',
      description: '',
      status: 'pending'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">
          {t('specificNeeds')}
        </h3>
        <Tooltip content={t('specificNeedsTooltip')} position="left" />
      </div>
      
      <p className="text-gray-600 mb-4">
        {t('specificNeedsDescription')}
      </p>
      
      {/* Need items */}
      <div className="space-y-4">
        {needFields.map((field, index) => (
          <div key={field.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <AlertTriangle className={`w-5 h-5 mr-2 
                  ${register(`needs.${index}.priority`).value === 'urgent' ? 'text-red-500' : 
                    register(`needs.${index}.priority`).value === 'high' ? 'text-orange-500' : 
                    register(`needs.${index}.priority`).value === 'medium' ? 'text-yellow-500' : 
                    'text-blue-500'}`} 
                />
                <h4 className="text-md font-medium text-gray-800">
                  {t('need')} {index + 1}
                </h4>
              </div>
              
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
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor={`needs.${index}.category`}>
                  {t('category')}
                </label>
                <select
                  id={`needs.${index}.category`}
                  {...register(`needs.${index}.category`)}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="medical">{t('medical')}</option>
                  <option value="financial">{t('financial')}</option>
                  <option value="food">{t('food')}</option>
                  <option value="shelter">{t('shelter')}</option>
                  <option value="clothing">{t('clothing')}</option>
                  <option value="education">{t('education')}</option>
                  <option value="employment">{t('employment')}</option>
                  <option value="transportation">{t('transportation')}</option>
                  <option value="other">{t('other')}</option>
                </select>
                {errors.needs?.[index]?.category && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {errors.needs?.[index]?.category?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor={`needs.${index}.priority`}>
                  {t('priority')}
                </label>
                <select
                  id={`needs.${index}.priority`}
                  {...register(`needs.${index}.priority`)}
                  className="w-full p-2 border rounded-md border-gray-300"
                >
                  <option value="low">{t('low')}</option>
                  <option value="medium">{t('medium')}</option>
                  <option value="high">{t('high')}</option>
                  <option value="urgent">{t('urgent')}</option>
                </select>
                {errors.needs?.[index]?.priority && (
                  <p className="mt-1 text-sm text-red-500" role="alert">
                    {errors.needs?.[index]?.priority?.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor={`needs.${index}.description`}>
                {t('description')}
              </label>
              <textarea
                id={`needs.${index}.description`}
                {...register(`needs.${index}.description`)}
                className={`w-full p-2 border rounded-md ${
                  errors.needs?.[index]?.description ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder={t('describeNeed')}
              />
              {errors.needs?.[index]?.description && (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.needs?.[index]?.description?.message}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Add need button */}
      <div className="flex justify-center mt-4">
        <Button
          type="button"
          variant="outline"
          icon={Plus}
          onClick={handleAddNeed}
        >
          {t('addNeed')}
        </Button>
      </div>
      
      {needFields.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          {t('noNeedsYet')}
        </div>
      )}
    </div>
  );
} 