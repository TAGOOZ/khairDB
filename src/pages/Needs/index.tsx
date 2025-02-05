import React from 'react';
import { NeedsList } from './NeedsList';
import { SearchFilters } from './SearchFilters';
import { useNeeds } from '../../hooks/useNeeds';

export function Needs() {
  const { 
    needs, 
    isLoading, 
    filters, 
    setFilters 
  } = useNeeds();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Needs</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Need
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
