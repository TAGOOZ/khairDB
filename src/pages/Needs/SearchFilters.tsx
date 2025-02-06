import React from 'react';
import { NeedCategory } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            {t('search')}
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder={t('searchPlaceholder')}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            {t('category')}
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => onFilterChange({ ...filters, category: e.target.value as NeedCategory | '' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">{t('allCategories')}</option>
            <option value="medical">{t('medical')}</option>
            <option value="financial">{t('financial')}</option>
            <option value="food">{t('food')}</option>
            <option value="shelter">{t('shelter')}</option>
            <option value="clothing">{t('clothing')}</option>
            <option value="education">{t('education')}</option>
            <option value="employment">{t('employment')}</option>
            <option value="transportation">{t('transportation')}</option>
            <option value="other">{t('other')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            {t('status')}
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value as 'pending' | 'in_progress' | 'completed' | '' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="pending">{t('pending')}</option>
            <option value="in_progress">{t('inProgress')}</option>
            <option value="completed">{t('completed')}</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            {t('priority')}
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => onFilterChange({ ...filters, priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent' | '' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">{t('allPriorities')}</option>
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
            <option value="urgent">{t('urgent')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}