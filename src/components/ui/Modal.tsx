import React from 'react';
    import { X } from 'lucide-react';
    import { Button } from './Button';
    
    interface ModalProps {
      isOpen: boolean;
      onClose: () => void;
      title: string;
      children: React.ReactNode;
      showCloseButton?: boolean;
    }
    
    export function Modal({ isOpen, onClose, title, children, showCloseButton = true }: ModalProps) {
      if (!isOpen) return null;
    
      return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
    
            <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              {showCloseButton && (
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
              )}
    
              <div className="sm:flex sm:items-start">
                <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {title}
                  </h3>
                  <div className="mt-4">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
