import React from 'react';
    import { X, Calendar, MapPin, Phone, Briefcase, DollarSign, User, CreditCard, Package } from 'lucide-react';
    import { Individual } from '../../types';
    import { Button } from '../ui/Button';
    import { formatDate, formatCurrency, calculateAge } from '../../utils/formatters';
    import { NeedsBadge } from '../NeedsBadge';
    
    interface ViewIndividualModalProps {
      isOpen: boolean;
      onClose: () => void;
      individual: Individual;
    }
    
    export function ViewIndividualModal({ isOpen, onClose, individual }: ViewIndividualModalProps) {
      if (!isOpen) return null;
    
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
    
                    {/* Needs */}
                    {individual.needs.length > 0 && (
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
    
                    {/* Description */}
                    {individual.description && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Additional Information</h4>
                        <p className="text-gray-600">{individual.description}</p>
                      </div>
                    )}
    
                    {/* Distribution History */}
                    {individual.distributions.length > 0 && (
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
