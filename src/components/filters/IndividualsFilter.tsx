import React from 'react';
import { NeedCategory, NeedPriority } from '../../types';
import { SearchInput } from '../search/SearchInput';
import { Select } from '../ui/Select';
import { useLanguage } from '../../contexts/LanguageContext';

interface NeedFilter {
  category: NeedCategory | '';
  priority: NeedPriority | '';
}

interface FiltersState {
  search: string;
  district: string;
  needs: NeedFilter[];
  status?: 'green' | 'yellow' | 'red' | '';
  distributionStatus: 'all' | 'with' | 'without';
  listStatus: 'whitelist' | 'blacklist' | 'waitinglist' | '';
}

interface IndividualsFilterProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function IndividualsFilter({ filters, onFilterChange }: IndividualsFilterProps) {
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

  const needCategories = [
    { value: '', label: t('allCategories') },
    { value: 'medical', label: t('medical') },
    { value: 'financial', label: t('financial') },
    { value: 'food', label: t('food') },
    { value: 'shelter', label: t('shelter') },
    { value: 'clothing', label: t('clothing') },
    { value: 'education', label: t('education') },
    { value: 'employment', label: t('employment') },
    { value: 'transportation', label: t('transportation') },
    { value: 'other', label: t('other') }
  ];

  const priorityOptions = [
    { value: '', label: t('allPriorities') },
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') },
    { value: 'urgent', label: t('urgent') }
  ];

  const addNeedFilter = () => {
    onFilterChange({
      ...filters,
      needs: [...filters.needs, { category: '', priority: '' }]
    });
  };

  const removeNeedFilter = (index: number) => {
    const newNeeds = [...filters.needs];
    newNeeds.splice(index, 1);
    onFilterChange({ ...filters, needs: newNeeds });
  };

  const updateNeedFilter = (index: number, field: keyof NeedFilter, value: string) => {
    const newNeeds = [...filters.needs];
    newNeeds[index] = {
      ...newNeeds[index],
      [field]: value
    };
    onFilterChange({ ...filters, needs: newNeeds });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SearchInput
          label={t('search')}
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder={t('searchPlaceholder')}
        />

        <Select
          label={t('district')}
          value={filters.district}
          onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
          options={[
            { value: '', label: t('allDistricts') },
            ...districts
          ]}
        />

        <Select
          label={t('listStatus')}
          value={filters.listStatus}
          onChange={(e) => onFilterChange({ ...filters, listStatus: e.target.value as 'whitelist' | 'blacklist' | 'waitinglist' | '' })}
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
          <h3 className="text-sm font-medium text-gray-700">{t('needs')}</h3>
          <button
            type="button"
            onClick={addNeedFilter}
            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + {t('addNeed')}
          </button>
        </div>

        {filters.needs.map((need, index) => (
          <div key={index} className="flex gap-4 items-end bg-gray-50 p-3 rounded-lg">
            <div className="flex-1">
              <Select
                label={t('category')}
                value={need.category}
                onChange={(e) => updateNeedFilter(index, 'category', e.target.value)}
                options={needCategories}
              />
            </div>
            <div className="flex-1">
              <Select
                label={t('priority')}
                value={need.priority}
                onChange={(e) => updateNeedFilter(index, 'priority', e.target.value)}
                options={priorityOptions}
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
