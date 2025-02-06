import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { AddChildModal } from './AddChildModal';
import { AddElseModal } from './AddElseModal';
import { useLanguage } from '../../../contexts/LanguageContext';
import { addChild } from '../../../services/children';
import { addAdditionalMember } from '../../../services/additionalMembers';
import { toast } from '../../../pages/Individuals/Toast';

interface AddMemberButtonProps {
  individualId: string;
  onSuccess: () => void;
}

export function AddMemberButton({ individualId, onSuccess }: AddMemberButtonProps) {
  const { t } = useLanguage();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [isElseModalOpen, setIsElseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddChild = async (data: any) => {
    try {
      setIsSubmitting(true);
      await addChild(individualId, data);
      toast.success(t('memberAdded'));
      setIsChildModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding child:', error);
      toast.error(t('memberAddedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddElse = async (data: any) => {
    try {
      setIsSubmitting(true);
      await addAdditionalMember(individualId, {
        ...data,
        id: crypto.randomUUID()
      });
      toast.success(t('memberAdded'));
      setIsElseModalOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(t('memberAddedError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          icon={Plus}
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
        >
          {t('addMember')}
        </Button>

        {isOptionsOpen && (
          <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu">
              <button
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsChildModalOpen(true);
                }}
              >
                {t('addChild')}
              </button>
              <button
                className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsElseModalOpen(true);
                }}
              >
                {t('addElse')}
              </button>
            </div>
          </div>
        )}
      </div>

      <AddChildModal
        isOpen={isChildModalOpen}
        onClose={() => setIsChildModalOpen(false)}
        onSubmit={handleAddChild}
        isLoading={isSubmitting}
      />

      <AddElseModal
        isOpen={isElseModalOpen}
        onClose={() => setIsElseModalOpen(false)}
        onSubmit={handleAddElse}
        isLoading={isSubmitting}
      />
    </>
  );
}