import React, { useState } from 'react';
import { X, Users, Calendar, MapPin, Phone } from 'lucide-react';
import { Family } from '../../types';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { ViewIndividualModal } from './ViewIndividualModal';

interface ViewFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family;
}

export function ViewFamilyModal({ isOpen, onClose, family }: ViewFamilyModalProps) {
  const [selectedMember, setSelectedMember] = useState(null);

  if (!isOpen) return null;

  const parentMembers = family.members.filter(member => member.family_role === 'parent');
  const childMembers = family.members.filter(member => member.family_role === 'child');

  const statusColors = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800'
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

          <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {family.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[family.status]}`}>
                    {family.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Created {formatDate(family.created_at)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                Close
              </Button>
            </div>

            {family.phone || family.district || family.address ? (
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Information</h4>
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
                      <span>District {family.district}</span>
                    </div>
                  )}
                  {family.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{family.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : null}

            <div className="space-y-6">
              {parentMembers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Parents</h4>
                  <div className="bg-gray-50 rounded-lg divide-y">
                    {parentMembers.map(member => (
                      <div key={member.id} className="p-3">
                        <button
                          onClick={() => handleMemberClick(member)}
                          className="w-full flex items-center text-left hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Users className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-600 hover:text-blue-800">
                              {member.first_name} {member.last_name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(member.date_of_birth)}
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {childMembers.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Children</h4>
                  <div className="bg-gray-50 rounded-lg divide-y">
                    {childMembers.map(member => (
                      <div key={member.id} className="p-3">
                        <button
                          onClick={() => handleMemberClick(member)}
                          className="w-full flex items-center text-left hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Users className="w-5 h-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-600 hover:text-blue-800">
                              {member.first_name} {member.last_name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(member.date_of_birth)}
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {family.members.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No family members added yet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedMember && (
        <ViewIndividualModal
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          individual={selectedMember}
        />
      )}
    </>
  );
}
