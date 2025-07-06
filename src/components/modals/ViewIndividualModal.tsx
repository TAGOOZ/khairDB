import React from 'react';
import { X, Calendar, MapPin, Phone, Briefcase, DollarSign, User, CreditCard, Package, Heart, Pizza, Gift, Landmark, BookOpen, Home, FileText, ExternalLink } from 'lucide-react';
import { Individual, AssistanceType } from '../../types';
import { Button } from '../ui/Button';
import { formatDate, formatCurrency, calculateAge } from '../../utils/formatters';
import { NeedsBadge } from '../NeedsBadge';

interface ViewIndividualModalProps {
  isOpen: boolean;
  onClose: () => void;
  individual: Individual | null; // Allow null for loading state
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

export function ViewIndividualModal({ isOpen, onClose, individual, isLoading }: ViewIndividualModalProps) {
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
                Close
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
              Close
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
                    <span>ID Number: {individual.id_number}</span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span>
                      {formatDate(individual.date_of_birth)} ({calculateAge(individual.date_of_birth)} years old)
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-2" />
                    <span>Marital Status: {individual.marital_status}</span>
                  </div>

                  {individual.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-5 h-5 mr-2" />
                      <span>{individual.phone}</span>
                    </div>
                  )}

                  {individual.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span>{individual.address}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>District {individual.district}</span>
                  </div>

                  {individual.created_by_user && (
                    <div className="flex items-center text-gray-600">
                      <User className="w-5 h-5 mr-2" />
                      <span>Added by: {individual.created_by_user.first_name} {individual.created_by_user.last_name}</span>
                    </div>
                  )}
                </div>
                
                {/* Files Section */}
                {individual.id_card_image_url && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Files & Documents</h4>
                    
                    <div className="space-y-2">
                      {/* ID Card Image */}
                      <div className="flex items-start space-x-2">
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">ID Card</p>
                          <a 
                            href={individual.id_card_image_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm mt-1"
                          >
                            {getFileNameFromPath(individual.id_card_image_path || '')}
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </a>
                        </div>
                      </div>
                      
                      {/* Add more file types here as they become available */}
                    </div>
                  </div>
                )}

                {/* Employment Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-gray-900">Employment Details</h4>
                  
                  {individual.job && (
                    <div className="flex items-center text-gray-600">
                      <Briefcase className="w-5 h-5 mr-2" />
                      <span>{individual.job}</span>
                    </div>
                  )}

                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span>
                      {individual.employment_status === 'no_salary' && 'No salary'}
                      {individual.employment_status === 'has_salary' && `Salary: ${formatCurrency(individual.salary || 0)}`}
                      {individual.employment_status === 'social_support' && 'تكافل وكرامة'}
                    </span>
                  </div>
                </div>

                {/* Assistance Details Section */}
                {individual.assistance_details && individual.assistance_details.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Assistance Information</h4>
                    <div className="space-y-4">
                      {individual.assistance_details.map((assistance) => (
                        <div key={assistance.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-center mb-2">
                            {getAssistanceIcon(assistance.assistance_type)}
                            <span className="font-medium">{getAssistanceTitle(assistance.assistance_type)}</span>
                          </div>
                          
                          {assistance.assistance_type === 'medical_help' && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.type_of_medical_assistance_needed?.length > 0 && (
                                <p>Needs: {assistance.details.type_of_medical_assistance_needed.join(', ')}</p>
                              )}
                              {assistance.details.medication_distribution_frequency && (
                                <p>Frequency: {assistance.details.medication_distribution_frequency}</p>
                              )}
                              {assistance.details.estimated_cost_of_treatment && (
                                <p>Est. Cost: {assistance.details.estimated_cost_of_treatment}</p>
                              )}
                              <p>Insurance: {assistance.details.health_insurance_coverage ? 'Yes' : 'No'}</p>
                              {assistance.details.additional_details && (
                                <p>Notes: {assistance.details.additional_details}</p>
                              )}
                            </div>
                          )}

                          {assistance.assistance_type === 'food_assistance' && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.type_of_food_assistance_needed?.length > 0 && (
                                <p>Needs: {assistance.details.type_of_food_assistance_needed.join(', ')}</p>
                              )}
                              <p>Supply Card: {assistance.details.food_supply_card ? 'Yes' : 'No'}</p>
                            </div>
                          )}

                          {assistance.assistance_type === 'marriage_assistance' && (
                            <div className="ml-7 space-y-1 text-sm">
                              <p>Support Needed: {assistance.details.marriage_support_needed ? 'Yes' : 'No'}</p>
                              <p>Contract Signed: {assistance.details.wedding_contract_signed ? 'Yes' : 'No'}</p>
                              {assistance.details.wedding_date && (
                                <p>Wedding Date: {assistance.details.wedding_date}</p>
                              )}
                              {assistance.details.specific_needs && (
                                <p>Specific Needs: {assistance.details.specific_needs}</p>
                              )}
                            </div>
                          )}

                          {assistance.assistance_type === 'debt_assistance' && (
                            <div className="ml-7 space-y-1 text-sm">
                              <p>Debt: {assistance.details.debt_status ? 'Yes' : 'No'}</p>
                              {assistance.details.debt_amount > 0 && (
                                <p>Amount: {formatCurrency(assistance.details.debt_amount)}</p>
                              )}
                              {assistance.details.reason_for_debt && (
                                <p>Reason: {assistance.details.reason_for_debt}</p>
                              )}
                            </div>
                          )}

                          {assistance.assistance_type === 'education_assistance' && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.family_education_level && (
                                <p>Family Education Level: {assistance.details.family_education_level}</p>
                              )}
                              {assistance.details.desire_for_education && (
                                <p>Desire for Education: {assistance.details.desire_for_education}</p>
                              )}
                              {assistance.details.children_educational_needs?.length > 0 && (
                                <p>Children Needs: {assistance.details.children_educational_needs.join(', ')}</p>
                              )}
                            </div>
                          )}

                          {assistance.assistance_type === 'shelter_assistance' && (
                            <div className="ml-7 space-y-1 text-sm">
                              {assistance.details.type_of_housing && (
                                <p>Housing Type: {assistance.details.type_of_housing}</p>
                              )}
                              {assistance.details.housing_condition && (
                                <p>Condition: {assistance.details.housing_condition}</p>
                              )}
                              <p>Rooms: {assistance.details.number_of_rooms}</p>
                              {assistance.details.household_appliances?.length > 0 && (
                                <p>Appliances: {assistance.details.household_appliances.join(', ')}</p>
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
                    <h4 className="font-medium text-gray-900 mb-3">Children</h4>
                    <div className="space-y-3">
                      {individual.children.map((child) => (
                        <div key={child.id} className="flex items-center space-x-3 text-gray-700">
                          <User className="w-5 h-5" />
                          <div>
                            <p className="font-medium">{child.first_name} {child.last_name}</p>
                            <p className="text-sm">
                              {formatDate(child.date_of_birth)} ({calculateAge(child.date_of_birth)} years old), {child.gender}
                            </p>
                            {child.school_stage && <p className="text-sm">School Stage: {child.school_stage}</p>}
                            {child.description && <p className="text-sm">Notes: {child.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Needs */}
                {individual.needs && individual.needs.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Current Needs</h4>
                    <div className="space-y-2">
                      {individual.needs.map((need) => (
                        <div key={need.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <NeedsBadge need={need} />
                            <span className="text-sm text-gray-700">{need.description}</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {need.priority} - {need.status}
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

                {/* Description */}
                {individual.description && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                    <p className="text-gray-600">{individual.description}</p>
                  </div>
                )}

                {/* Distribution History */}
                {individual.distributions && individual.distributions.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Distribution History</h4>
                    <ul className="space-y-2">
                      {individual.distributions.map((distribution) => (
                        <li key={distribution.id} className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">
                            {formatDate(distribution.date)} - {distribution.aid_type}
                          </span>
                        </li>
                      ))}
                    </ul>
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
