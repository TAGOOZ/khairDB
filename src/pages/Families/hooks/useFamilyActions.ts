import { useState } from 'react';
import { FamilyFormData } from '../../../schemas/familySchema';
import { createFamily, updateFamily, deleteFamily, FamilyError } from '../../../services/families';
import { toast } from '../../Individuals/Toast';

interface UseFamilyActionsProps {
  onSuccess: () => void;
}

export function useFamilyActions({ onSuccess }: UseFamilyActionsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FamilyFormData, familyId?: string) => {
    try {
      setIsSubmitting(true);
      
      // Validate that there's at least one parent
      const hasParent = data.members.some(member => member.role === 'parent');
      if (!hasParent) {
        toast.error('At least one parent is required');
        return;
      }

      if (familyId) {
        await updateFamily(familyId, data);
        toast.success('Family successfully updated');
      } else {
        await createFamily(data);
        toast.success('Family successfully created');
      }
      onSuccess();
    } catch (error) {
      console.error('Error handling family:', error);
      
      if (error instanceof FamilyError) {
        switch (error.code) {
          case 'duplicate-name':
            toast.error('A family with this name already exists');
            break;
          case 'invalid-members':
            toast.error('Invalid family members configuration');
            break;
          case 'parent-fetch-failed':
            toast.error('Failed to fetch parent information');
            break;
          default:
            toast.error(error.message || 'Failed to save family. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this family? All members will be unlinked from this family.')) {
      try {
        await deleteFamily(id);
        toast.success('Family successfully deleted');
        onSuccess();
      } catch (error) {
        console.error('Error deleting family:', error);
        if (error instanceof FamilyError) {
          toast.error(error.message);
        } else {
          toast.error('Failed to delete family. Please try again.');
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
