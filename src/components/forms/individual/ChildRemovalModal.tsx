import React from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Button } from '../../ui/Button';
import { safeTrans } from '../../../utils/translations';

interface ChildRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onRemoveFromFamily?: () => void;
  showRemoveFromFamilyOption?: boolean;
  childName?: string;
}

export const ChildRemovalModal: React.FC<ChildRemovalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onRemoveFromFamily,
  showRemoveFromFamilyOption = false,
  childName
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            {safeTrans(t, 'confirmChildRemoval')}
          </h3>
          
          <p className="mb-6 text-gray-600">
            {childName 
              ? safeTrans(t, 'removeChildNameConfirmationText', { name: childName })
              : safeTrans(t, 'removeChildConfirmationText')}
          </p>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {safeTrans(t, 'cancel')}
            </Button>
            
            {showRemoveFromFamilyOption && onRemoveFromFamily && (
              <Button
                type="button"
                variant="destructive"
                onClick={onRemoveFromFamily}
              >
                {safeTrans(t, 'removeFromFamily')}
              </Button>
            )}
            
            <Button
              type="button"
              variant="destructive"
              onClick={onConfirm}
            >
              {safeTrans(t, 'remove')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 