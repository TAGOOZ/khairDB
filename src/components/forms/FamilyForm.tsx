import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { familySchema, FamilyFormData } from '../../schemas/familySchema';
import { Individual } from '../../types';
import { Users } from 'lucide-react';

interface FamilyFormProps {
  onSubmit: (data: FamilyFormData) => Promise<void>;
  isLoading: boolean;
  individuals: Individual[];
  selectedMembers?: string[];
}

export function FamilyForm({ onSubmit, isLoading, individuals, selectedMembers = [] }: FamilyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familySchema),
    defaultValues: {
      members: selectedMembers
    }
  });

  const selectedMemberIds = watch('members') || [];

  const onSubmitForm = async (data: FamilyFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Family Name
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., Smith Family"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Family Members
        </label>
        <div className="border rounded-lg divide-y">
          {individuals.map((individual) => (
            <div key={individual.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`member-${individual.id}`}
                  value={individual.id}
                  checked={selectedMemberIds.includes(individual.id)}
                  onChange={(e) => {
                    const newMembers = e.target.checked
                      ? [...selectedMemberIds, individual.id]
                      : selectedMemberIds.filter(id => id !== individual.id);
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
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Save Family'
          )}
        </button>
      </div>
    </form>
  );
}
