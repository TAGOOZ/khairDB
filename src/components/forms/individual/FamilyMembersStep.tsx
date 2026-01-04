import React, { useState, useCallback } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Tooltip } from '../../ui/Tooltip';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { IndividualFormData } from '../../../schemas/individualSchema';
import { ChildRemovalModal } from './ChildRemovalModal';
import { deleteChild } from '../../../services/children';
import { ServiceError } from '../../../utils/errors';
import { toast } from '../../../pages/Individuals/Toast';
import type { TranslationKey } from '../../../translations';

// Modal component for adding family members
interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMember: (data: any) => void;
  type: 'child' | 'adult';
}

function AddMemberModal({ isOpen, onClose, onAddMember, type }: AddMemberModalProps) {
  const { t } = useLanguage();
  const [memberData, setMemberData] = useState<any>({
    gender: type === 'child' ? 'boy' : 'male',
  });

  // Reset form data when modal opens or type changes
  React.useEffect(() => {
    if (isOpen) {
      setMemberData({
        gender: type === 'child' ? 'boy' : 'male',
      });
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMemberData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    // Prevent default form submission to avoid submitting the parent form
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields based on type
    if (type === 'child') {
      if (!memberData.first_name || !memberData.last_name || !memberData.date_of_birth) {
        alert('Please fill in all required fields');
        return;
      }
    } else {
      // Adult validation
      if (!memberData.name || !memberData.date_of_birth || !memberData.relation) {
        alert('Please fill in all required fields');
        return;
      }
    }
    
    console.log('Submitting member data:', memberData); // Debug log
    onAddMember(memberData);
    setMemberData({
      gender: type === 'child' ? 'boy' : 'male',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {type === 'child' ? t('addChild') : t('addFamilyMember')}
          </h3>
          
          <div 
            className="space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {type === 'child' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('firstName')}</label>
                    <input
                      type="text"
                      name="first_name"
                      value={memberData.first_name || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('lastName')}</label>
                    <input
                      type="text"
                      name="last_name"
                      value={memberData.last_name || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('dateOfBirth')}</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={memberData.date_of_birth || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('gender')}</label>
                  <select
                    name="gender"
                    value={memberData.gender || 'boy'}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="boy">{t('boy')}</option>
                    <option value="girl">{t('girl')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('schoolStage')}</label>
                  <select
                    name="school_stage"
                    value={memberData.school_stage || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">{t('none')}</option>
                    <option value="kindergarten">{t('kindergarten')}</option>
                    <option value="primary">{t('primary')}</option>
                    <option value="preparatory">{t('preparatory')}</option>
                    <option value="secondary">{t('secondary')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('description')}</label>
                  <textarea
                    name="description"
                    value={memberData.description || ''}
                    onChange={handleChange as any}
                    className="w-full p-2 border rounded-md"
                    rows={3}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">{t('name')}</label>
                  <input
                    type="text"
                    name="name"
                    value={memberData.name || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">{t('dateOfBirth')}</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={memberData.date_of_birth || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('gender')}</label>
                    <select
                      name="gender"
                      value={memberData.gender || 'male'}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="male">{t('male')}</option>
                      <option value="female">{t('female')}</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('relation')}</label>
                    <select
                      name="relation"
                      value={memberData.relation || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      <option value="" disabled>{t('selectRelation')}</option>
                      <option value="wife">{t('wife')}</option>
                      <option value="husband">{t('husband')}</option>
                      <option value="sister">{t('sister')}</option>
                      <option value="brother">{t('brother')}</option>
                      <option value="mother">{t('mother')}</option>
                      <option value="father">{t('father')}</option>
                      <option value="mother_in_law">{t('motherInLaw')}</option>
                      <option value="father_in_law">{t('fatherInLaw')}</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('jobTitle')}</label>
                    <input
                      type="text"
                      name="job_title"
                      value={memberData.job_title || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('phoneNumber')}</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={memberData.phone_number || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-md"
                      placeholder="+20 xxx xxx xxxx"
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
              >
                {t('cancel')}
              </Button>
              <Button 
                type="button" 
                variant="primary" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmit(e);
                }}
              >
                {t('add')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FamilyMembersStepProps {
  handleAddMember?: (data: any) => void;
  removeMember?: (index: number) => void;
  removeChild?: (index: number) => void;
}

export function FamilyMembersStep({ 
  handleAddMember, 
  removeMember, 
  removeChild 
}: FamilyMembersStepProps) {
  const { t } = useLanguage();
  const { control, getValues, setValue } = useFormContext<IndividualFormData>();
  
  // Use field arrays for direct access
  const { fields: childFields, remove: removeChildField } = useFieldArray({
    control,
    name: 'children'
  });

  const { fields: memberFields, remove: removeMemberField } = useFieldArray({
    control,
    name: 'additional_members'
  });
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'child' as 'child' | 'adult'
  });

  // Child removal modal state
  const [childRemovalModal, setChildRemovalModal] = useState({
    isOpen: false,
    childIndex: -1,
    childName: ''
  });
  
  // Open modal with specified type
  const openModal = (type: 'child' | 'adult') => {
    setModalState({ isOpen: true, type });
  };
  
  // Close modal
  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };
  
  // Add member via modal
  const addMember = (data: any) => {
    if (handleAddMember) {
      handleAddMember(data);
    }
  };
  
  // Open child removal confirmation modal
  const openChildRemovalModal = (index: number) => {
    const child = getValues(`children.${index}`);
    if (child) {
      setChildRemovalModal({
        isOpen: true,
        childIndex: index,
        childName: `${child.first_name} ${child.last_name}`
      });
    }
  };

  // Close child removal modal
  const closeChildRemovalModal = () => {
    setChildRemovalModal({
      ...childRemovalModal,
      isOpen: false
    });
  };

  // Handle permanently deleting a child
  const handleDeleteChild = async () => {
    if (childRemovalModal.childIndex >= 0) {
      const child = getValues(`children.${childRemovalModal.childIndex}`);
      
      try {
        // If the child has an ID, delete it from the database
        if (child.id) {
          await deleteChild(child.id);
          // Only remove from form after successful deletion
          removeChildField(childRemovalModal.childIndex);
          toast.success(t('successDelete' as TranslationKey));
        } else {
          // If no ID, it's a new child not yet saved to DB
          removeChildField(childRemovalModal.childIndex);
        }
        
        // Close the modal
        closeChildRemovalModal();
      } catch (error) {
        console.error('Failed to delete child:', error);
        const errorMessage = error instanceof ServiceError 
          ? error.message 
          : t('error' as TranslationKey);
        
        toast.error(errorMessage);
        // Don't remove from form if deletion failed
        closeChildRemovalModal();
      }
    }
  };
  
  // Handle adult member removal with direct field array access
  const handleRemoveMember = useCallback((index: number) => {
    // First try the passed removeMember function
    if (removeMember) {
      removeMember(index);
    }
    
    // As a direct fallback, use the field array's remove method
    removeMemberField(index);
  }, [removeMember, removeMemberField]);

  const children = getValues('children') || [];
  const additionalMembers = getValues('additional_members') || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{t('familyMembers')}</h3>
        <Tooltip content={t('familyMembersTooltip')} position="left" />
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          icon={UserPlus}
          onClick={() => openModal('child')}
        >
          {t('addChild')}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="md"
          icon={UserPlus}
          onClick={() => openModal('adult')}
        >
          {t('addAdult')}
        </Button>
      </div>
      
      {/* Summary of current family members */}
      <div className="mt-4 space-y-4">
        {children.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">{t('children')}</h4>
            <div className="space-y-2">
              {children.map((child, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {child.first_name} {child.last_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {child.gender === 'boy' ? t('boy') : t('girl')} • 
                      {child.school_stage && ` ${t(child.school_stage as any)} • `}
                      {child.date_of_birth && new Date(child.date_of_birth).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => openChildRemovalModal(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('remove')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {additionalMembers.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-800 mb-2">{t('adults')}</h4>
            <div className="space-y-2">
              {additionalMembers.map((member, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {member.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t(member.relation as any)} • 
                      {member.gender === 'male' ? t('male') : t('female')} • 
                      {member.date_of_birth && new Date(member.date_of_birth).toLocaleDateString()}
                    </div>
                    {member.job_title && (
                      <div className="text-sm text-gray-600">
                        {t('job')}: {member.job_title}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleRemoveMember(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('remove')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {children.length === 0 && additionalMembers.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            {t('noFamilyMembersYet')}
          </div>
        )}
      </div>
      
      {/* Add member modal */}
      <AddMemberModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onAddMember={addMember}
        type={modalState.type}
      />

      {/* Child removal confirmation modal */}
      <ChildRemovalModal
        isOpen={childRemovalModal.isOpen}
        onClose={closeChildRemovalModal}
        onConfirm={handleDeleteChild}
        childName={childRemovalModal.childName}
      />
    </div>
  );
} 