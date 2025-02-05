import React from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { needSchema, NeedFormData } from '../../schemas/needSchema';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';

interface AddNeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NeedFormData) => Promise<void>;
  isLoading: boolean;
}

export function AddNeedModal({ isOpen, onClose, onSubmit, isLoading }: AddNeedModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<NeedFormData>({
    resolver: zodResolver(needSchema)
  });

  const handleFormSubmit = async (data: NeedFormData) => {
    await onSubmit(data);
    reset();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              onClick={onClose}
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Close</span>
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Add Need
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a new need for this individual
              </p>

              <div className="mt-6 space-y-6">
                <Select
                  label="Category"
                  {...register('category')}
                  error={errors.category?.message}
                  options={[
                    { value: 'medical', label: 'Medical' },
                    { value: 'financial', label: 'Financial' },
                    { value: 'food', label: 'Food' },
                    { value: 'shelter', label: 'Shelter' },
                    { value: 'clothing', label: 'Clothing' },
                    { value: 'education', label: 'Education' },
                    { value: 'employment', label: 'Employment' },
                    { value: 'transportation', label: 'Transportation' },
                    { value: 'other', label: 'Other' }
                  ]}
                />

                <Select
                  label="Priority"
                  {...register('priority')}
                  error={errors.priority?.message}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'urgent', label: 'Urgent' }
                  ]}
                />

                <TextArea
                  label="Description"
                  {...register('description')}
                  error={errors.description?.message}
                  placeholder="Describe the need..."
                />

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => reset()}
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    isLoading={isLoading}
                    onClick={handleSubmit(handleFormSubmit)}
                  >
                    Add Need
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
