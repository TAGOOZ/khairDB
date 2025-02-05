import React from 'react';
import { NeedCategory } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

interface FiltersState {
  search: string;
  needCategory: NeedCategory | '';
  district: string;
}

interface SearchFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const districts = Array.from({ length: 10 }, (_, i) => ({
    value: `${i + 1}`,
    label: `District ${i + 1}`
  }));

  const needCategories = [
    { value: '', label: 'All Categories' },
    { value: 'medical', label: 'Medical' },
    { value: 'financial', label: 'Financial' },
    { value: 'food', label: 'Food' },
    { value: 'shelter', label: 'Shelter' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'education', label: 'Education' },
    { value: 'employment', label: 'Employment' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Search"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search by name, phone, or description..."
        />

        <Select
          label="Need Category"
          value={filters.needCategory}
          onChange={(e) => onFilterChange({ ...filters, needCategory: e.target.value as NeedCategory | '' })}
          options={needCategories}
        />

        <Select
          label="District"
          value={filters.district}
          onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
          options={[
            { value: '', label: 'All Districts' },
            ...districts
          ]}
        />
      </div>
    </div>
  );
}
