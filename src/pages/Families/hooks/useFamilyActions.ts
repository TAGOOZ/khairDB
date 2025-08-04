import { useState } from 'react';
import { FamilyFormData } from '../../../schemas/familySchema';
import { createFamily, updateFamily, deleteFamily, FamilyError } from '../../../services/families';
import { toast } from '../../Individuals/Toast';
import { useLanguage } from '../../../contexts/LanguageContext';

interface UseFamilyActionsProps {
  onSuccess: () => void;
}

export function useFamilyActions({ onSuccess }: UseFamilyActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (data: FamilyFormData, familyId?: string) => {
    try {
      setIsSubmitting(true);
      
      // Validate that there's at least one parent
      const hasParent = data.members.some(member => member.role === 'parent');
      if (!hasParent) {
        toast.error(t('atLeastOneParentRequired'));
        return;
      }

      if (familyId) {
        await updateFamily(familyId, data);
        toast.success(t('familyUpdatedSuccessfully'));
      } else {
        await createFamily(data);
        toast.success(t('familyCreatedSuccessfully'));
      }
      onSuccess();
    } catch (error) {
      console.error('Error handling family:', error);
      
      if (error instanceof FamilyError) {
        switch (error.code) {
          case 'duplicate-name':
            toast.error(t('familyNameExists'));
            break;
          case 'invalid-members':
            toast.error(t('invalidFamilyMembers'));
            break;
          case 'parent-fetch-failed':
            toast.error(t('failedToFetchParent'));
            break;
          default:
            toast.error(error.message || t('failedToSaveFamily'));
        }
      } else {
        toast.error(t('unexpectedErrorOccurred'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDeleteFamily'))) {
      try {
        await deleteFamily(id);
        toast.success(t('familyDeletedSuccessfully'));
        onSuccess();
      } catch (error) {
        console.error('Error deleting family:', error);
        if (error instanceof FamilyError) {
          toast.error(error.message);
        } else {
          toast.error(t('failedToDeleteFamily'));
        }
      }
    }
  };

  return {
    handleSubmit,
    handleDelete,
    isSubmitting
  };
}
