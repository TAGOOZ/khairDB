import React from 'react';
import { NeedsList } from './NeedsList';
import { SearchFilters } from './SearchFilters';
import { useNeeds } from '../../hooks/useNeeds';
import { useLanguage } from '../../contexts/LanguageContext';

export function Needs() {
  const { t } = useLanguage();
  const { 
    needs, 
    isLoading, 
    filters, 
    setFilters 
  } = useNeeds();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('needs')}</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          {t('addNeed')}
        </button>
      </div>

      <SearchFilters filters={filters} onFilterChange={setFilters} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <NeedsList needs={needs} />
      )}
    </div>
  );
}
