import React from 'react';
import { Input } from '../../../components/ui/Input';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FiltersState {
  search: string;
}

interface SearchFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <Input
        label={t('searchFamilies')}
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        placeholder={t('searchByFamilyName')}
      />
    </div>
  );
}
