import React from 'react';
import { Input } from '../../../components/ui/Input';

interface FiltersState {
  search: string;
}

interface SearchFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <Input
        label="Search Families"
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        placeholder="Search by family name..."
      />
    </div>
  );
}
