import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { Family } from '../../../types';
import { Plus, Search } from 'lucide-react';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { Switch } from '../../ui/Switch';

interface ContactInfoStepProps {
  families?: Family[];
}

export function ContactInfoStep({ families = [] }: ContactInfoStepProps) {
  const { t } = useLanguage();
  const { 
    register, 
    formState: { errors }, 
    setValue, 
    watch, 
    control 
  } = useFormContext<IndividualFormData>();

  const selectedFamilyId = watch('family_id');
  const [isNewFamily, setIsNewFamily] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Filter families based on search term
  const filteredFamilies = families.filter(family => 
    family.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // District options from the codebase
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

  const handleFamilyToggle = (checked: boolean) => {
    setIsNewFamily(checked);
    if (checked) {
      setValue('family_id', null);
    } else {
      setValue('new_family_name', undefined);
    }
  };

  const handleFamilySelect = (familyId: string) => {
    setValue('family_id', familyId);
    setValue('new_family_name', undefined);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            {t('phone')}
          </label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="+20 123 456 7890"
            />
            <Tooltip content={t('phoneTooltip')} position="right" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {t('phoneFormat')}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="district">
            {t('district')} <span className="text-red-500">*</span>
          </label>
          <select
            id="district"
            {...register('district')}
            aria-invalid={errors.district ? 'true' : 'false'}
            className={`w-full p-2 border rounded-md ${
              errors.district ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{t('selectDistrict')}</option>
            {districts.map((district) => (
              <option key={district.value} value={district.value}>
                {district.label}
              </option>
            ))}
          </select>
          {errors.district && (
            <p className="mt-1 text-sm text-red-500" role="alert">
              {errors.district.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="address">
          {t('address')}
        </label>
        <textarea
          id="address"
          {...register('address')}
          className="w-full p-2 border rounded-md border-gray-300"
          rows={3}
          placeholder={t('enterAddress')}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-800">
            {t('familyAssignment')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('newFamily')}</span>
            <Controller
              name="isNewFamily"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Switch
                  checked={isNewFamily}
                  onCheckedChange={handleFamilyToggle}
                  aria-label={t('toggleNewFamily')}
                />
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          {isNewFamily ? (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium mb-1" htmlFor="new_family_name">
                {t('newFamilyName')} <span className="text-red-500">*</span>
              </label>
              <input
                id="new_family_name"
                type="text"
                {...register('new_family_name', { required: isNewFamily })}
                className={`w-full p-2 border rounded-md ${
                  errors.new_family_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={t('enterFamilyName')}
              />
              {errors.new_family_name && (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.new_family_name.message}
                </p>
              )}
            </div>
          ) : (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium mb-1" htmlFor="family_search">
                {t('searchFamily')}
              </label>
              <div className="relative">
                <input
                  id="family_search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-10 border rounded-md border-gray-300"
                  placeholder={t('searchFamilyPlaceholder')}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-md">
                {filteredFamilies.length > 0 ? (
                  filteredFamilies.map((family) => (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => handleFamilySelect(family.id)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                        selectedFamilyId === family.id ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      {family.name}
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-500">
                    {searchTerm ? t('noFamiliesFound') : t('startTypingToSearch')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 