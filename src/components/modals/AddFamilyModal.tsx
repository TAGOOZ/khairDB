import React, { useEffect } from 'react';
import { X, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { familySchema, FamilyFormData } from '../../schemas/familySchema';
import { Individual, Family } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface AddFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FamilyFormData, familyId?: string) => Promise<void>;
  isLoading: boolean;
  individuals: Individual[];
  family?: Family;
  mode?: 'create' | 'edit';
}

export function AddFamilyModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading,
  individuals,
  family,
  mode = 'create'
}: AddFamilyModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      name: '',
      members: [],
      status: 'green',
      district: null,
      phone: null,
      address: null
    }
  });

  const selectedMembers = watch('members') || [];

  useEffect(() => {
    if (mode === 'edit' && family) {
      reset({
        name: family.name,
        status: family.status,
        district: family.district,
        phone: family.phone,
        address: family.address,
        members: family.members.map(member => ({
          id: member.id,
          role: member.family_role || 'child'
        }))
      });
    } else if (!isOpen) {
      reset();
    }
  }, [mode, family, isOpen, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: FamilyFormData) => {
    try {
      await onSubmit(data, family?.id);
    } catch (error) {
      console.error('Error submitting form:', error);
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
              Close
            </Button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {mode === 'create' ? 'Create New Family' : 'Edit Family'}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {mode === 'create' ? 'Add a new family and select its members.' : 'Update family information and manage members.'}
              </p>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Family Name"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="e.g., Smith Family"
                  />

                  <Select
                    label="Status"
                    {...register('status')}
                    error={errors.status?.message}
                    options={[
                      { value: 'green', label: 'Green' },
                      { value: 'yellow', label: 'Yellow' },
                      { value: 'red', label: 'Red' }
                    ]}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Family Members
                  </label>
                  <div className="border rounded-lg divide-y">
                    {individuals.map((individual) => {
                      const member = selectedMembers.find(m => m.id === individual.id);
                      const isSelected = !!member;

                      return (
                        <div key={individual.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              id={`member-${individual.id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                const newMembers = e.target.checked
                                  ? [...selectedMembers, { id: individual.id, role: 'child' }]
                                  : selectedMembers.filter(m => m.id !== individual.id);
                                setValue('members', newMembers);
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`member-${individual.id}`} className="ml-3 flex items-center">
                              <Users className="h-5 w-5 text-gray-400 mr-2" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {individual.first_name} {individual.last_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(individual.date_of_birth).toLocaleDateString()}
                                </p>
                              </div>
                            </label>
                          </div>

                          {isSelected && (
                            <Select
                              value={member.role}
                              onChange={(e) => {
                                const newMembers = selectedMembers.map(m =>
                                  m.id === individual.id ? { ...m, role: e.target.value as 'parent' | 'child' } : m
                                );
                                setValue('members', newMembers);
                              }}
                              options={[
                                { value: 'parent', label: 'Parent' },
                                { value: 'child', label: 'Child' }
                              ]}
                              className="w-32"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {errors.members && (
                    <p className="mt-1 text-sm text-red-600">{errors.members.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    {mode === 'create' ? 'Create Family' : 'Update Family'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
