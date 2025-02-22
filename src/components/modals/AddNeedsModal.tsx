import React from 'react';
import { Modal } from '../ui/Modal';
import { NeedsForm } from '../forms/NeedsForm';
import { useLanguage } from '../../contexts/LanguageContext';
import { NeedsFormData } from '../../types/needs';

interface AddNeedsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NeedsFormData) => Promise<void>;
  individualId?: string;
}

export function AddNeedsModal({ isOpen, onClose, onSubmit, individualId }: AddNeedsModalProps) {
  const { t } = useLanguage();

  const handleSubmit = async (data: NeedsFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting needs:', error);
      // Handle error (you can add toast notifications here)
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('addNeeds')}
    >
      <NeedsForm 
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
} 