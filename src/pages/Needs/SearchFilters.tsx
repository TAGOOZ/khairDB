import React from 'react';
import { NeedCategory } from '../../types';

interface FiltersState {
  search: string;
  category: NeedCategory | '';
  status: 'pending' | 'in_progress' | 'completed' | '';
  priority: 'low' | 'medium' | 'high' | 'urgent' | '';
}

interface SearchFiltersProps {
  filters: FiltersState;
  onFilterChange: (filters: FiltersState) => void;
}

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            placeholder="Search by description..."
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value as NeedCategory | '' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Categories</option>
            <option value="medical">Medical</option>
            <option value="financial">Financial</option>
            <option value="food">Food</option>
            <option value="shelter">Shelter</option>
            <option value="clothing">Clothing</option>
            <option value="education">Education</option>
            <option value="employment">Employment</option>
            <option value="transportation">Transportation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'pending' | 'in_progress' | 'completed' | '' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' | '' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>
    </div>
  );
}
