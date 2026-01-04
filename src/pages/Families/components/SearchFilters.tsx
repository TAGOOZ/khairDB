import React from 'react';
import { Input } from '../../../components/ui/Input';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FiltersState {
  search: string;
  page: number;
  perPage: number;
}

interface SearchFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const { t } = useLanguage();

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value, page: 1 });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <Input
        label={t('searchFamilies')}
        value={filters.search}
        onChange={(e) => handleSearchChange(e.target.value)}
        placeholder={t('searchByFamilyName')}
      />
    </div>
  );
}
