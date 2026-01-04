import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { formatDate } from '../../utils/formatters';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/search/SearchInput';
import { Select } from '../../components/ui/Select';
import { useLanguage } from '../../contexts/LanguageContext';
import { Eye, Pencil, Trash2 } from 'lucide-react';

export function Children() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [filters, setFilters] = useState({
    search: '',
    schoolStage: ''
  });

  const { data: children, isLoading } = useQuery({
    queryKey: ['children', filters],
    queryFn: async () => {
      let query = supabase
        .from('children')
        .select(`
          *,
          parent:individuals(
            id, 
            first_name, 
            last_name
          ),
          family:families(
            id,
            name
          )
        `);

      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
        );
      }

      if (filters.schoolStage) {
        query = query.eq('school_stage', filters.schoolStage);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('children')}</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchInput
            label={t('search')}
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder={t('searchPlaceholder')}
          />

          <Select
            label={t('schoolStage')}
            value={filters.schoolStage}
            onChange={(e) => setFilters(prev => ({ ...prev, schoolStage: e.target.value }))}
            options={[
              { value: '', label: t('all') },
              { value: 'kindergarten', label: t('kindergarten') },
              { value: 'primary', label: t('primary') },
              { value: 'preparatory', label: t('preparatory') },
              { value: 'secondary', label: t('secondary') }
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('name')}
                </th>
                <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('dateOfBirth')}
                </th>
                <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('schoolStage')}
                </th>
                <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('parent')}
                </th>
                <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('family')}
                </th>
                <th className={`px-6 py-3 text-${isRTL ? 'left' : 'right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {children?.map((child) => (
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
                      {t(child.school_stage)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {child.parent?.first_name} {child.parent?.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {child.family?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Eye}
                      >
                        {t('view')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Pencil}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
