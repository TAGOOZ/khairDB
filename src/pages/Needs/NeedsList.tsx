import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatDate } from '../../utils/formatters';
import { AssistanceDetails, AssistanceType } from '../../types';
import {
  Stethoscope,
  UtensilsCrossed,
  Heart,
  Wallet,
  GraduationCap,
  Home,
  Search,
  Filter
} from 'lucide-react';

interface AssistanceWithIndividual extends AssistanceDetails {
  individual?: {
    first_name: string;
    last_name: string;
    id_number: string;
  };
}

const assistanceIcons: Record<AssistanceType, React.ComponentType<{ className?: string }>> = {
  medical_help: Stethoscope,
  food_assistance: UtensilsCrossed,
  marriage_assistance: Heart,
  debt_assistance: Wallet,
  education_assistance: GraduationCap,
  shelter_assistance: Home,
};

const assistanceColors: Record<AssistanceType, string> = {
  medical_help: 'bg-red-100 text-red-800',
  food_assistance: 'bg-green-100 text-green-800',
  marriage_assistance: 'bg-pink-100 text-pink-800',
  debt_assistance: 'bg-yellow-100 text-yellow-800',
  education_assistance: 'bg-blue-100 text-blue-800',
  shelter_assistance: 'bg-purple-100 text-purple-800',
};

export function AssistanceList() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';

  const [assistanceRecords, setAssistanceRecords] = useState<AssistanceWithIndividual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<AssistanceType | ''>('');

  useEffect(() => {
    async function fetchAssistanceDetails() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('assistance_details')
          .select(`
            *,
            individual:individuals (
              first_name,
              last_name,
              id_number
            )
          `)
          .order('created_at', { ascending: false });

        if (selectedType) {
          query = query.eq('assistance_type', selectedType);
        }

        const { data, error } = await query;

        if (error) throw error;

        let filtered = data || [];

        if (searchTerm) {
          filtered = filtered.filter((record: AssistanceWithIndividual) => {
            const fullName = `${record.individual?.first_name || ''} ${record.individual?.last_name || ''}`.toLowerCase();
            return fullName.includes(searchTerm.toLowerCase()) ||
              record.individual?.id_number?.includes(searchTerm);
          });
        }

        setAssistanceRecords(filtered);
      } catch (error) {
        console.error('Error fetching assistance details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAssistanceDetails();
  }, [selectedType, searchTerm]);

  const assistanceTypes: AssistanceType[] = [
    'medical_help',
    'food_assistance',
    'marriage_assistance',
    'debt_assistance',
    'education_assistance',
    'shelter_assistance'
  ];

  const getAssistanceLabel = (type: AssistanceType): string => {
    const labels: Record<AssistanceType, string> = {
      medical_help: t('medicalHelp'),
      food_assistance: t('foodAssistance'),
      marriage_assistance: t('marriageAssistance'),
      debt_assistance: t('debtAssistance'),
      education_assistance: t('educationAssistance'),
      shelter_assistance: t('shelterAssistance'),
    };
    return labels[type] || type;
  };

  const renderDetails = (record: AssistanceWithIndividual) => {
    const details = record.details as Record<string, unknown>;
    const type = record.assistance_type;

    switch (type) {
      case 'medical_help':
        return (
          <div className="text-sm text-gray-600">
            {Array.isArray(details.type_of_medical_assistance_needed) &&
              details.type_of_medical_assistance_needed.length > 0 && (
                <span>{details.type_of_medical_assistance_needed.join(', ')}</span>
              )}
            {details.health_insurance_coverage && <span className="ml-2">✓ {t('healthInsuranceCoverage')}</span>}
          </div>
        );
      case 'food_assistance':
        return (
          <div className="text-sm text-gray-600">
            {Array.isArray(details.type_of_food_assistance_needed) &&
              details.type_of_food_assistance_needed.length > 0 && (
                <span>{details.type_of_food_assistance_needed.join(', ')}</span>
              )}
            {details.food_supply_card && <span className="ml-2">✓ {t('foodSupplyCard')}</span>}
          </div>
        );
      case 'debt_assistance':
        return (
          <div className="text-sm text-gray-600">
            {details.debt_amount && <span>{t('debtAmount')}: {String(details.debt_amount)}</span>}
          </div>
        );
      case 'marriage_assistance':
        return (
          <div className="text-sm text-gray-600">
            {details.wedding_date && <span>{t('weddingDate')}: {String(details.wedding_date)}</span>}
          </div>
        );
      case 'education_assistance':
        return (
          <div className="text-sm text-gray-600">
            {details.family_education_level && <span>{t('familyEducationLevel')}: {String(details.family_education_level)}</span>}
          </div>
        );
      case 'shelter_assistance':
        return (
          <div className="text-sm text-gray-600">
            {details.type_of_housing && <span>{t('typeOfHousing')}: {String(details.type_of_housing)}</span>}
            {details.number_of_rooms && <span className="ml-2">{t('numberOfRooms')}: {String(details.number_of_rooms)}</span>}
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter by type */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as AssistanceType | '')}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="">{t('allCategories')}</option>
            {assistanceTypes.map(type => (
              <option key={type} value={type}>
                {getAssistanceLabel(type)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {assistanceTypes.map(type => {
          const count = assistanceRecords.filter(r => r.assistance_type === type).length;
          const Icon = assistanceIcons[type];
          return (
            <div
              key={type}
              className={`p-4 rounded-lg ${assistanceColors[type]} cursor-pointer transition-transform hover:scale-105`}
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
            >
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <span className="font-medium">{count}</span>
              </div>
              <div className="text-xs mt-1">{getAssistanceLabel(type)}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('individuals')}
              </th>
              <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('category')}
              </th>
              <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('description')}
              </th>
              <th className={`px-6 py-3 text-${isRTL ? 'right' : 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                {t('created')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assistanceRecords.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  {t('noDataAvailable')}
                </td>
              </tr>
            ) : (
              assistanceRecords.map((record) => {
                const Icon = assistanceIcons[record.assistance_type];
                return (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className={`px-6 py-4 whitespace-nowrap text-${isRTL ? 'right' : 'left'}`}>
                      <div className="text-sm font-medium text-gray-900">
                        {record.individual?.first_name} {record.individual?.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.individual?.id_number}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-${isRTL ? 'right' : 'left'}`}>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${assistanceColors[record.assistance_type]}`}>
                        <Icon className="h-3 w-3" />
                        {getAssistanceLabel(record.assistance_type)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-${isRTL ? 'right' : 'left'}`}>
                      {renderDetails(record)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-${isRTL ? 'right' : 'left'}`}>
                      {formatDate(record.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Export as default for backwards compatibility
export default AssistanceList;
