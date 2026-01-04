import { useState, useEffect } from 'react';
import { X, Users, Calendar, MapPin, Phone, User } from 'lucide-react';
import { Family } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { Button } from '../../../components/ui/Button';
import { useLanguage } from '../../../contexts/LanguageContext';
import { getFamilyMembersForDistribution } from '../../../services/distributions';

interface ViewFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
}

export function ViewFamilyModal({ isOpen, onClose, family }: ViewFamilyModalProps) {
  const { t, dir } = useLanguage();
  const [additionalMembers, setAdditionalMembers] = useState<any[]>([]);

  // Fetch additional members when modal opens
  useEffect(() => {
    if (isOpen && family?.id) {
      const fetchAdditionalMembers = async () => {
        try {
          const familyMembers = await getFamilyMembersForDistribution(family.id);
          setAdditionalMembers(familyMembers.additional_members || []);
        } catch (error) {
          console.error('Error fetching additional members:', error);
          setAdditionalMembers([]);
        }
      };

      fetchAdditionalMembers();
    }
  }, [isOpen, family?.id]);

  if (!isOpen) return null;

  const statusColors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className={`inline-block px-4 pt-5 pb-4 overflow-hidden ${dir === 'rtl' ? 'text-right' : 'text-left'} align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6`} dir={dir}>
          <div className={`flex items-start ${dir === 'rtl' ? 'flex-row-reverse' : 'justify-between'} mb-4`}>
            <div>
              <div className={`flex items-center ${dir === 'rtl' ? 'flex-row-reverse' : 'gap-2'}`}>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {family.name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[family.status]} ${dir === 'rtl' ? 'ml-2' : 'ml-0'}`}>
                  {t(family.status as 'green' | 'yellow' | 'red')}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {t('created')} {formatDate(family.created_at)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              {t('close')}
            </Button>
          </div>

          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">{t('contactInformation')}</h4>
            <div className="space-y-2">
              {family.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>{family.phone}</span>
                </div>
              )}
              {family.district && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{t('district')} {family.district}</span>
                </div>
              )}
              {family.address && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{family.address}</span>
                </div>
              )}
              {!family.phone && !family.district && !family.address && (
                <p className="text-sm text-gray-500">{t('noContactInformation')}</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {family.members.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('members')}</h4>
                <div className="bg-gray-50 rounded-lg divide-y">
                  {family.members.map(member => (
                    <div key={member.id} className="p-3">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-gray-400 mr-2" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </p>
                            {member.family_relation && (
                              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {t(member.family_relation as any)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(member.date_of_birth)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {additionalMembers.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">{t('additionalFamilyMembers')}</h4>
                <div className="bg-gray-50 rounded-lg divide-y">
                  {additionalMembers.map((member, index) => (
                    <div key={index} className="p-3">
                      <div className="flex items-start">
                        <User className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <p className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </p>
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {t('additionalMember')}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                            {member.relation && (
                              <div>
                                <span className="font-medium">{t('relation')}:</span> {t(member.relation)}
                              </div>
                            )}

                            {member.date_of_birth && (
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(member.date_of_birth)}
                              </div>
                            )}

                            {member.job_title && (
                              <div>
                                <span className="font-medium">{t('jobTitle')}:</span> {member.job_title}
                              </div>
                            )}

                            {member.phone_number && (
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {member.phone_number}
                              </div>
                            )}

                            <div>
                              <span className="font-medium">{t('addedBy')}:</span> {member.parent_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {family.members.length === 0 && additionalMembers.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                {t('noFamilyMembers')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
