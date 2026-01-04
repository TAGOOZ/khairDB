import React from 'react';
import { AssistanceType, TranslationKey } from '../../types';
import { SearchInput } from '../search/SearchInput';
import { Select } from '../ui/Select';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDistricts } from '../../hooks/useDistricts';

interface NeedFilter {
  category: AssistanceType | '';
}

interface FiltersState {
  search: string;
  district: string;
  needs: NeedFilter[];
  status?: 'green' | 'yellow' | 'red' | '';
  distributionStatus: 'all' | 'with' | 'without';
  listStatus: 'whitelist' | 'blacklist' | 'waitinglist' | '';
  page: number;
  perPage: number;
}

interface IndividualsFilterProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function IndividualsFilter({ filters, onFilterChange }: IndividualsFilterProps) {
  const { t } = useLanguage();
  const { districts, isLoading: loadingDistricts } = useDistricts();

  const assistanceCategories = [
    { value: '', label: t('allCategories') },
    { value: 'medical_help', label: t('medicalHelp') },
    { value: 'food_assistance', label: t('foodAssistance') },
    { value: 'marriage_assistance', label: t('marriageAssistance') },
    { value: 'debt_assistance', label: t('debtAssistance') },
    { value: 'education_assistance', label: t('educationAssistance') },
    { value: 'shelter_assistance', label: t('shelterAssistance') }
  ];

  const addNeedFilter = () => {
    // Keep existing filters and add a new one, reset page
    const existingFilters = filters.needs.filter(need => need.category !== '');
    onFilterChange({
      ...filters,
      needs: [...existingFilters, { category: '' }],
      page: 1
    });
  };

  const removeNeedFilter = (index: number) => {
    const newNeeds = [...filters.needs];
    newNeeds.splice(index, 1);
    // Only keep filters that have a selected category
    const validFilters = newNeeds.filter(need => need.category !== '');
    onFilterChange({ ...filters, needs: validFilters, page: 1 });
  };

  const updateNeedFilter = (index: number, field: keyof NeedFilter, value: AssistanceType | '') => {
    const newNeeds = [...filters.needs];
    newNeeds[index] = {
      ...newNeeds[index],
      [field]: value
    };
    // Only keep filters that have a selected category
    const validFilters = newNeeds.filter(need => need.category !== '');
    onFilterChange({ ...filters, needs: validFilters, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value, page: 1 });
  };

  const handleDistrictChange = (value: string) => {
    onFilterChange({ ...filters, district: value, page: 1 });
  };

  const handleListStatusChange = (value: 'whitelist' | 'blacklist' | 'waitinglist' | '') => {
    onFilterChange({ ...filters, listStatus: value, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchInput
          label={t('search')}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('searchPlaceholder')}
        />

        {loadingDistricts ? (
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{t('district')}</label>
            <div className="animate-pulse h-10 bg-gray-200 rounded-lg"></div>
          </div>
        ) : (
          <Select
            label={t('district')}
            value={filters.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            options={[
              { value: '', label: t('allDistricts') },
              ...districts.map(d => ({ value: d.name, label: d.name }))
            ]}
          />
        )}

        <Select
          label={t('listStatus')}
          value={filters.listStatus}
          onChange={(e) => handleListStatusChange(e.target.value as any)}
          options={[
            { value: '', label: t('all') },
            { value: 'whitelist', label: t('whitelist') },
            { value: 'blacklist', label: t('blacklist') },
            { value: 'waitinglist', label: t('waitinglist') }
          ]}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">{t('assistanceInformation')}</h3>
          <button
            type="button"
            onClick={addNeedFilter}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + {t('add')}
          </button>
        </div>

        {filters.needs.map((need, index) => (
          <div key={index} className="flex gap-4 items-end bg-gray-50 p-3 rounded-lg">
            <div className="flex-1">
              <Select
                label={t('category')}
                value={need.category}
                onChange={(e) => updateNeedFilter(index, 'category', e.target.value as AssistanceType | '')}
                options={assistanceCategories}
              />
            </div>
            <button
              type="button"
              onClick={() => removeNeedFilter(index)}
              className="px-2 py-2 text-red-600 hover:text-red-700"
            >
              {t('remove')}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
