import React from 'react';
import { X, Calendar, MapPin, Phone, Briefcase, DollarSign, User, CreditCard, Package, Heart, Pizza, Gift, Landmark, BookOpen, Home, FileText, ExternalLink } from 'lucide-react';
import { Individual, AssistanceType, AssistanceTranslationKey, NeedStatus, TranslationKey, NeedPriority } from '../../types';
import { Button } from '../ui/Button';
import { formatDate, formatCurrency, calculateAge } from '../../utils/formatters';
import { NeedsBadge } from '../NeedsBadge';
import { useLanguage } from '../../contexts/LanguageContext';

interface ViewIndividualModalProps {
  isOpen: boolean;
  onClose: () => void;
  individual: Individual | null;
  isLoading: boolean;
}

// Helper function to get icon for assistance type
const getAssistanceIcon = (type: AssistanceType) => {
  switch (type) {
    case 'medical_help':
      return <Heart className="w-5 h-5 mr-2 text-red-500" />;
    case 'food_assistance':
      return <Pizza className="w-5 h-5 mr-2 text-green-500" />;
    case 'marriage_assistance':
      return <Gift className="w-5 h-5 mr-2 text-pink-500" />;
    case 'debt_assistance':
      return <Landmark className="w-5 h-5 mr-2 text-blue-500" />;
    case 'education_assistance':
      return <BookOpen className="w-5 h-5 mr-2 text-yellow-500" />;
    case 'shelter_assistance':
      return <Home className="w-5 h-5 mr-2 text-purple-500" />;
    default:
      return null;
  }
};

// Helper to get human-readable title for assistance type
const getAssistanceTitle = (type: AssistanceType) => {
  switch (type) {
    case 'medical_help':
      return 'Medical Assistance';
    case 'food_assistance':
      return 'Food Assistance';
    case 'marriage_assistance':
      return 'Marriage Assistance';
    case 'debt_assistance':
      return 'Debt Assistance';
    case 'education_assistance':
      return 'Education Assistance';
    case 'shelter_assistance':
      return 'Shelter Assistance';
    default:
      return 'Other Assistance';
  }
};

const getAssistanceTranslationKey = (type: AssistanceType): AssistanceTranslationKey => {
  switch (type) {
    case 'medical_help':
      return 'medicalHelp';
    case 'food_assistance':
      return 'foodAssistance';
    case 'marriage_assistance':
      return 'marriageAssistance';
    case 'debt_assistance':
      return 'debtAssistance';
    case 'education_assistance':
      return 'educationAssistance';
    case 'shelter_assistance':
      return 'shelterAssistance';
    default:
      return 'medicalHelp'; // Fallback to a default key
  }
};

const getNeedStatusTranslationKey = (status: NeedStatus): TranslationKey => {
  switch (status) {
    case 'in_progress':
      return 'inProgress';
    default:
      return status as TranslationKey;
  }
};

const getNeedPriorityTranslationKey = (priority: NeedPriority): TranslationKey => {
  return priority as TranslationKey;
};

export function ViewIndividualModal({ isOpen, onClose, individual, isLoading }: ViewIndividualModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  if (isLoading || !individual) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onClose}
              >
                {t('close')}
              </Button>
            </div>
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract file name from path
  const getFileNameFromPath = (path: string) => {
    if (!path) return 'File';
    return path.split('/').pop() || 'File';
  };

  // Helper function to format aid type
  const formatAidType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  };

  // Helper function to get aid type icon
  const getAidTypeIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Pizza className="w-4 h-4 text-orange-500" />;
      case 'clothing':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'financial':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'medical':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'education':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      case 'shelter':
        return <Home className="w-4 h-4 text-indigo-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
            >
              {t('close')}
            </Button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {individual.first_name} {individual.last_name}
              </h3>

              <div className="mt-4 space-y-4">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span className="flex items-center">
                      <span className="text-gray-600 mr-1">{t('idNumber')}:</span>
                      <span>{individual.id_number}</span>
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>
                      {formatDate(individual.date_of_birth)} ({calculateAge(individual.date_of_birth)} {t('yearsOld')})
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-2" />
                    <span className="flex items-center">
                      <span className="text-gray-600 mr-1">{t('maritalStatus')}:</span>
                      <span>{t(individual.marital_status)}</span>
                    </span>
                  </div>

                  {individual.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2" />
                      <span className="flex items-center">
                        <span className="text-gray-600 mr-1">{t('phone')}:</span>
                        <span>{individual.phone}</span>
                      </span>
                    </div>
                  )}

                  {individual.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="flex items-center">
                        <span className="text-gray-600 mr-1">{t('address')}:</span>
                        <span>{individual.address}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="flex items-center">
                      <span className="text-gray-600 mr-1">{t('district')}:</span>
                      <span>{individual.district}</span>
                    </span>
                  </div>

                  {individual.created_by_user && (
                    <div className="flex items-center text-gray-600">
                      <User className="w-5 h-5 mr-2" />
                      <span className="flex items-center">
                        <span className="text-gray-600 mr-1">{t('addedBy')}:</span>
                        <span>{individual.created_by_user.first_name} {individual.created_by_user.last_name}</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Files Section */}
                {individual.google_drive_folder_url && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Files & Documents</h4>

                    <div className="space-y-2">
                      {/* Google Drive Folder */}
                      <div className="flex items-start space-x-2">
                        <Package className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Documents Folder</p>
                          <a
                            href={individual.google_drive_folder_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1"
                          >
                            View in Google Drive
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Employment Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-900">{t('employmentStatus')}</h4>

                  {individual.job && (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-5 h-5 mr-2" />
                      <span>{individual.job}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span>
                      {individual.employment_status === 'no_salary' && t('noSalary')}
                      {individual.employment_status === 'has_salary' && `${t('salary')}: ${formatCurrency(individual.salary || 0)}`}
                      {individual.employment_status === 'social_support' && t('socialSupport')}
                    </span>
                  </div>
                </div>

                {/* Assistance Information */}
                {individual.assistance_details && individual.assistance_details.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{t('assistanceInformation')}</h4>
                    <div className="space-y-4">
                      {individual.assistance_details.map((assistance) => (
                        <div key={assistance.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            {getAssistanceIcon(assistance.assistance_type)}
                            <span className="font-medium">{t(getAssistanceTranslationKey(assistance.assistance_type))}</span>
                          </div>

                          {/* Medical Help */}
                          {assistance.assistance_type === 'medical_help' && assistance.details && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.type_of_medical_assistance_needed?.length > 0 && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('typeOfMedicalAssistance')}:</span>
                                  <span>{assistance.details.type_of_medical_assistance_needed.join(', ')}</span>
                                </div>
                              )}
                              {assistance.details.medication_distribution_frequency && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('medicationDistributionFrequency')}:</span>
                                  <span>{t(assistance.details.medication_distribution_frequency)}</span>
                                </div>
                              )}
                              {assistance.details.estimated_cost_of_treatment && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('estimatedCostOfTreatment')}:</span>
                                  <span>{t(assistance.details.estimated_cost_of_treatment)}</span>
                                </div>
                              )}
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-1">{t('healthInsuranceCoverage')}:</span>
                                <span>{assistance.details.health_insurance_coverage ? t('yes') : t('no')}</span>
                              </div>
                              {assistance.details.additional_details && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('additionalDetails')}:</span>
                                  <span>{assistance.details.additional_details}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Food Assistance */}
                          {assistance.assistance_type === 'food_assistance' && assistance.details && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.type_of_food_assistance_needed?.length > 0 && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('typeOfFoodAssistance')}:</span>
                                  <span>{assistance.details.type_of_food_assistance_needed.join(', ')}</span>
                                </div>
                              )}
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-1">{t('foodSupplyCard')}:</span>
                                <span>{assistance.details.food_supply_card ? t('yes') : t('no')}</span>
                              </div>
                            </div>
                          )}

                          {/* Marriage Assistance */}
                          {assistance.assistance_type === 'marriage_assistance' && assistance.details && (
                            <div className="ml-7 space-y-1 text-sm">
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-1">{t('marriageSupportNeeded')}:</span>
                                <span>{assistance.details.marriage_support_needed ? t('yes') : t('no')}</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-1">{t('weddingContractSigned')}:</span>
                                <span>{assistance.details.wedding_contract_signed ? t('yes') : t('no')}</span>
                              </div>
                              {assistance.details.wedding_date && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('weddingDate')}:</span>
                                  <span>{assistance.details.wedding_date}</span>
                                </div>
                              )}
                              {assistance.details.specific_needs && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('specificNeeds')}:</span>
                                  <span>{assistance.details.specific_needs}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Debt Assistance */}
                          {assistance.assistance_type === 'debt_assistance' && assistance.details && (
                            <div className="ml-7 space-y-1 text-sm">
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-1">{t('debtStatus')}:</span>
                                <span>{assistance.details.debt_status ? t('yes') : t('no')}</span>
                              </div>
                              {assistance.details.debt_amount > 0 && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('debtAmount')}:</span>
                                  <span>{formatCurrency(assistance.details.debt_amount)}</span>
                                </div>
                              )}
                              {assistance.details.reason_for_debt && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('reasonForDebt')}:</span>
                                  <span>{assistance.details.reason_for_debt}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Education Assistance */}
                          {assistance.assistance_type === 'education_assistance' && assistance.details && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.family_education_level && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('familyEducationLevel')}:</span>
                                  <span>{assistance.details.family_education_level}</span>
                                </div>
                              )}
                              {assistance.details.desire_for_education && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('desireForEducation')}:</span>
                                  <span>{assistance.details.desire_for_education}</span>
                                </div>
                              )}
                              {assistance.details.children_educational_needs?.length > 0 && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('childrenEducationalNeeds')}:</span>
                                  <span>{assistance.details.children_educational_needs.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Shelter Assistance */}
                          {assistance.assistance_type === 'shelter_assistance' && assistance.details && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.type_of_housing && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('typeOfHousing')}:</span>
                                  <span>{assistance.details.type_of_housing}</span>
                                </div>
                              )}
                              {assistance.details.housing_condition && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('housingCondition')}:</span>
                                  <span>{assistance.details.housing_condition}</span>
                                </div>
                              )}
                              <div className="flex items-start">
                                <span className="text-gray-600 mr-1">{t('numberOfRooms')}:</span>
                                <span>{assistance.details.number_of_rooms}</span>
                              </div>
                              {assistance.details.household_appliances?.length > 0 && (
                                <div className="flex items-start">
                                  <span className="text-gray-600 mr-1">{t('householdAppliances')}:</span>
                                  <span>{assistance.details.household_appliances.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Children Section */}
                {individual.children && individual.children.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{t('children')} ({individual.children.length})</h4>
                    <div className="space-y-3">
                      {individual.children.map((child) => (
                        <div key={child.id} className="bg-white p-3 rounded-lg border">
                          <User className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{child.first_name} {child.last_name}</p>
                            <p className="text-sm">
                              {formatDate(child.date_of_birth)} ({calculateAge(child.date_of_birth)} {t('yearsOld')}), {t(child.gender)}
                            </p>
                            {child.school_stage && <p className="text-sm">{t('schoolStage')}: {t(child.school_stage)}</p>}
                            {child.description && <p className="text-sm">{t('description')}: {child.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Needs */}
                {individual.needs && individual.needs.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('needs')}</h4>
                    <div className="space-y-2">
                      {individual.needs.map((need) => (
                        <div key={need.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <NeedsBadge need={need} />
                            <span className="text-sm text-gray-700">{need.description}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {t(getNeedPriorityTranslationKey(need.priority))} - {t(getNeedStatusTranslationKey(need.status))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                {individual.hashtags && individual.hashtags.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Hashtags</h4>
                    <div className="flex flex-wrap gap-2">
                      {individual.hashtags.map((hashtag, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          #{hashtag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {individual.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{t('description')}</h4>
                    <p className="text-gray-600">{individual.description}</p>
                  </div>
                )}

                {/* Distribution History */}
                {individual.distributions && individual.distributions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">{t('distributionHistory')}</h4>
                    <div className="space-y-3">
                      {individual.distributions.map((distribution) => (
                        <div key={distribution.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getAidTypeIcon(distribution.aid_type)}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {formatAidType(distribution.aid_type)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {formatDate(distribution.date)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {t('quantityReceived')}: {distribution.quantity}
                              </div>
                              <div className="text-sm text-gray-500">
                                {t('value')}: ${distribution.value.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {distribution.description && (
                            <div className="mt-2 text-sm text-gray-600 border-t pt-2">
                              {distribution.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{t('totalDistributions')}:</span>
                        <span className="font-medium">{individual.distributions.length}</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600">{t('totalValueReceived')}:</span>
                        <span className="font-medium">
                          ${individual.distributions.reduce((sum, d) => sum + d.value, 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
