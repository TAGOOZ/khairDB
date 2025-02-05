import React from 'react';

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
      <div>
        <label htmlFor="search" className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          type="text"
          id="search"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Search by family name..."
        />
      </div>
    </div>
  );
}
