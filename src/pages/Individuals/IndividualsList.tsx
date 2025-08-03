import React, { useState, useCallback } from 'react';
import { Individual } from '../../types';
import { formatDate } from '../../utils/formatters';
import { NeedsBadge } from '../../components/NeedsBadge';
import { Pencil, Trash2, Eye, Printer } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { printIndividualsToCSV, downloadCSV } from '../../utils/print';
import { useLanguage } from '../../contexts/LanguageContext';
import type { TranslationKey } from '../../translations';

interface IndividualsListProps {
  individuals: Individual[];
  onEdit: (individual: Individual) => void;
  onDelete: (id: string) => void;
  onView: (individual: Individual) => void;
  userRole?: 'admin' | 'user';
  selectedForDistribution: string[];
  setSelectedForDistribution: React.Dispatch<React.SetStateAction<string[]>>;
}

export function IndividualsList({ 
  individuals, 
  onEdit, 
  onDelete, 
  onView, 
  userRole, 
  selectedForDistribution, 
  setSelectedForDistribution 
}: IndividualsListProps) {
  const { t, dir } = useLanguage();

  const handleCheckboxChange = (id: string) => {
    setSelectedForDistribution((prevSelected: string[]) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId: string) => selectedId !== id);
      }
      return [...prevSelected, id];
    });
  };

  const handleSelectAll = () => {
    if (selectedForDistribution.length === individuals.length) {
      setSelectedForDistribution([]);
    } else {
      setSelectedForDistribution(individuals.map(individual => individual.id));
    }
  };

  const handlePrint = useCallback((format: 'csv') => {
    if (selectedForDistribution.length === 0) {
      alert(t('selectAtLeastOne' as TranslationKey));
      return;
    }

    const selected = individuals.filter(individual => selectedForDistribution.includes(individual.id));

    if (format === 'csv') {
      const csv = printIndividualsToCSV(selected);
      downloadCSV(csv, 'individuals.csv');
    }
  }, [individuals, selectedForDistribution, t]);

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden" dir={dir}>
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
          >
            {selectedForDistribution.length === individuals.length ? 
              t('deselectAll' as TranslationKey) : 
              t('selectAll' as TranslationKey)
            }
          </Button>
          <span className="mx-2 text-sm text-gray-500">
            ({selectedForDistribution.length})
          </span>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => handlePrint('csv')}
          >
            {t('exportCSV' as TranslationKey)}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('name' as TranslationKey)}
              </th>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('created' as TranslationKey)}
              </th>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('addedBy' as TranslationKey)}
              </th>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('idNumber' as TranslationKey)}
              </th>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('contactInfo' as TranslationKey)}
              </th>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('needs' as TranslationKey)}
              </th>
              <th className={`px-6 py-3 text-${dir === 'rtl' ? 'left' : 'right'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('actions' as TranslationKey)}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {individuals.map((individual) => (
              <tr key={individual.id} className="hover:bg-gray-50">
                <td className={`px-6 py-4 text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedForDistribution.includes(individual.id)}
                      onChange={() => handleCheckboxChange(individual.id)}
                      className={`h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {individual.first_name} {individual.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t('district' as TranslationKey)} {individual.district}
                      </div>
                    </div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  {formatDate(individual.created_at)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  <div className="text-sm text-gray-900">
                    {individual.created_by_user ? (
                      `${individual.created_by_user.first_name} ${individual.created_by_user.last_name}`
                    ) : '-'}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  <div className="text-sm text-gray-900">{individual.id_number}</div>
                </td>
                <td className={`px-6 py-4 text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  <div className="text-sm text-gray-900">{individual.phone}</div>
                  <div className="text-sm text-gray-500 truncate max-w-[200px]">
                    {individual.description || '-'}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-${dir === 'rtl' ? 'right' : 'left'}`}>
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {individual.needs.map((need) => (
                      <NeedsBadge key={need.id} need={need} />
                    ))}
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-${dir === 'rtl' ? 'left' : 'right'} text-sm font-medium`}>
                  <div className={`flex justify-${dir === 'rtl' ? 'start' : 'end'} space-x-2`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      onClick={() => onView(individual)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {t('view' as TranslationKey)}
                    </Button>
                    {userRole === 'admin' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Pencil}
                          onClick={() => onEdit(individual)}
                        >
                          {t('edit' as TranslationKey)}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => onDelete(individual.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          {t('delete' as TranslationKey)}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
