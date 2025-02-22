import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/search/SearchInput';
import { useLanguage } from '../../contexts/LanguageContext';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  role: string;
  family_id: string;
}

interface ChildrenFilters {
  search: string;
}

const fetchChildren = async (filters: ChildrenFilters) => {
  let query = supabase
    .from('individuals')
    .select(`
      id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      role,
      family_id
    `)
    .eq('role', 'child');

  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch children: ${error.message}`);
  }

  return data as Child[];
};

export function Children() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ChildrenFilters>({
    search: ''
  });

  const { 
    data: children, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['children', filters],
    queryFn: () => fetchChildren(filters)
  });

  const renderError = () => (
    <div className="p-4 text-center">
      <div className="text-red-600 mb-2">{t('errorLoadingChildren')}</div>
      <div className="text-sm text-gray-600">
        {error instanceof Error ? error.message : t('unknownError')}
      </div>
    </div>
  );

  const renderLoading = () => (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
  );

  const renderChildRow = (child: Child) => (
    <tr key={child.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">
          {child.first_name} {child.last_name}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {formatDate(child.date_of_birth)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">
          {t(child.gender)}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <Button variant="ghost" size="sm" icon={Eye}>
            {t('view')}
          </Button>
          <Button variant="ghost" size="sm" icon={Pencil}>
            {t('edit')}
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2}>
            {t('delete')}
          </Button>
        </div>
      </td>
    </tr>
  );

  const renderTable = () => (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('name')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('dateOfBirth')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('gender')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children && children.length > 0 ? (
            children.map(renderChildRow)
          ) : (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                {t('noChildrenFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('children')}</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <SearchInput
          label={t('search')}
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder={t('searchPlaceholder')}
        />
      </div>

      {error ? renderError() : isLoading ? renderLoading() : renderTable()}
    </div>
  );
}
