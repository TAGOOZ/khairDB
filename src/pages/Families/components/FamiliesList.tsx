import React from 'react';
import { Family } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { Users, Pencil, Trash2, Eye, Phone, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';

interface FamiliesListProps {
  families: Family[];
  onEdit: (family: Family) => void;
  onDelete: (id: string) => void;
  onView: (family: Family) => void;
}

export function FamiliesList({ families, onEdit, onDelete, onView }: FamiliesListProps) {
  const { t, dir } = useLanguage();
  
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden" dir={dir}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('familyName')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('contactInfo')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('members')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('status')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('created')}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {families.map((family) => (
            <tr key={family.id} className="hover:bg-gray-50">
              <td className={`px-6 py-4 whitespace-nowrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <button
                  onClick={() => onView(family)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {family.name}
                </button>
              </td>
              <td className={`px-6 py-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="space-y-1">
                  {family.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className={`w-4 h-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      <span>{family.phone}</span>
                    </div>
                  )}
                  {family.district && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className={`w-4 h-4 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                      <span>{t('district')} {family.district}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className={`px-6 py-4 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className={`w-4 h-4 text-gray-400 ${dir === 'rtl' ? 'ml-1' : 'mr-1'}`} />
                  <span>{family.members?.length || 0} {t('members')}</span>
                </div>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${family.status === 'green' ? 'bg-green-100 text-green-800' :
                    family.status === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {family.status}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                {formatDate(family.created_at)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${dir === 'rtl' ? 'text-left' : 'text-right'}`}>
                <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'} space-x-2`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => onView(family)}
                  >
                    {t('view')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Pencil}
                    onClick={() => onEdit(family)}
                  >
                    {t('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => onDelete(family.id)}
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
  );
}
