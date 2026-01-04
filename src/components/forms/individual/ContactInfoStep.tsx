import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { Family, TranslationKey } from '../../../types';
import { Search } from 'lucide-react';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { Switch } from '../../ui/Switch';
import { supabase } from '../../../lib/supabase';
import { useDistricts } from '../../../hooks/useDistricts';

export function ContactInfoStep() {
  const { t } = useLanguage();
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<IndividualFormData>();

  const selectedFamilyId = watch('family_id');
  const [isNewFamily, setIsNewFamily] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Family[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);

  const { districts, isLoading: loadingDistricts } = useDistricts();

  const handleFamilyToggle = (checked: boolean) => {
    setIsNewFamily(checked);
    if (checked) {
      setValue('family_id', null);
    } else {
      setValue('new_family_name', undefined);
    }
  };

  const handleFamilySelect = (familyId: string, familyName: string) => {
    setValue('family_id', familyId);
    setValue('new_family_name', undefined);
    setSearchTerm(familyName);
    setSearchResults([]);
  };

  React.useEffect(() => {
    const searchFamilies = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data } = await supabase
          .from('families')
          .select('*')
          .ilike('name', `%${searchTerm}%`)
          .limit(10);
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching families:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchFamilies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

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
              dir="ltr"
              {...register('phone')}
              className="w-full p-2 border rounded-md border-gray-300"
              placeholder="+20 123 456 7890"
            />
            <Tooltip content={t('phone' as TranslationKey)} position="right" />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {t('phone' as TranslationKey)}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="district">
            {t('district')} <span className="text-red-500">*</span>
          </label>
          {loadingDistricts ? (
            <div className="w-full p-2 border rounded-md border-gray-300 bg-gray-50 text-gray-500">
              {t('loading' as TranslationKey)}...
            </div>
          ) : (
            <select
              id="district"
              {...register('district')}
              aria-invalid={errors.district ? 'true' : 'false'}
              className={`w-full p-2 border rounded-md ${errors.district ? 'border-red-500' : 'border-gray-300'
                }`}
            >
              <option value="">{t('district' as TranslationKey)}</option>
              {districts.map((district) => (
                <option key={district.id} value={district.name}>
                  {district.name}
                </option>
              ))}
            </select>
          )}
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
          placeholder={t('address' as TranslationKey)}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-md font-medium text-gray-800">
            {t('familyAssignment')}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t('newFamily')}</span>
            <Switch
              checked={isNewFamily}
              onCheckedChange={handleFamilyToggle}
              aria-label={t('newFamily')}
            />
          </div>
        </div>

        <div className="space-y-4">
          {isNewFamily ? (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium mb-1" htmlFor="new_family_name">
                {t('newFamily')} <span className="text-red-500">*</span>
              </label>
              <input
                id="new_family_name"
                type="text"
                {...register('new_family_name', { required: isNewFamily })}
                className={`w-full p-2 border rounded-md ${errors.new_family_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder={t('newFamily')}
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
                {t('searchByFamilyName')}
              </label>
              <div className="relative">
                <input
                  id="family_search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (selectedFamilyId) setValue('family_id', null);
                  }}
                  className="w-full p-2 pl-10 border rounded-md border-gray-300"
                  placeholder={t('searchByFamilyName')}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                {isSearching && (
                  <div className="absolute right-3 top-2.5 h-5 w-5">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>

              {searchResults.length > 0 && !selectedFamilyId && (
                <div className="mt-2 max-h-48 overflow-y-auto border rounded-md bg-white shadow-sm">
                  {searchResults.map((family) => (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => handleFamilySelect(family.id, family.name)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      {family.name}
                    </button>
                  ))}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && !isSearching && !selectedFamilyId && (
                <div className="mt-2 p-2 text-sm text-gray-500 border rounded-md bg-white">
                  {t('noDataAvailable')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}