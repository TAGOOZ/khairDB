import React from 'react';
import { X } from 'lucide-react';
import { IndividualForm } from '../forms/IndividualForm';
import { IndividualFormData } from '../../schemas/individualSchema';
import { Family, Individual } from '../../types';
import { Button } from '../ui/Button';
import { toast } from '../../pages/Individuals/Toast';
import { useLanguage } from '../../contexts/LanguageContext';

interface AddIndividualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IndividualFormData, individualId?: string) => Promise<void>;
  isLoading: boolean;
  families: Family[];
  individual?: Individual;
  mode?: 'create' | 'edit';
  userRole?: 'admin' | 'user';
}

export function AddIndividualModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading,
  families,
  individual,
  mode = 'create',
  userRole = 'user'
}: AddIndividualModalProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  const title = mode === 'create' 
    ? userRole === 'admin' ? t('addNewIndividual') : t('submitIndividualRequest')
    : t('edit');
    
  const description = mode === 'create' 
    ? userRole === 'admin'
      ? t('addNewIndividualDescription')
      : t('submitIndividualRequestDescription')
    : t('updateIndividualDescription');

  const handleSubmit = async (data: IndividualFormData) => {
    try {
      await onSubmit(data, individual?.id);
      toast.success(mode === 'create' ? t('individualCreatedSuccess') : t('individualUpdatedSuccess'));
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : t('errorSaving'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
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
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {description}
              </p>

              <div className="mt-6">
                <IndividualForm 
                  onSubmit={handleSubmit} 
                  isLoading={isLoading}
                  families={families}
                  initialData={individual}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
