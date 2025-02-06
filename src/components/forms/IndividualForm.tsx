import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { individualSchema, IndividualFormData } from '../../schemas/individualSchema';
import { Individual, Family } from '../../types';
import { PersonalInfoFields } from './individual/PersonalInfoFields';
import { ContactFields } from './individual/ContactFields';
import { EmploymentFields } from './individual/EmploymentFields';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Plus, Trash2 } from 'lucide-react';
import { AddMemberButton } from './individual/AddMemberButton';

interface IndividualFormProps {
  onSubmit: (data: IndividualFormData) => Promise<void>;
  isLoading: boolean;
  families: Family[];
  initialData?: Individual;
}

export function IndividualForm({ onSubmit, isLoading, families, initialData }: IndividualFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
    watch
  } = useForm<IndividualFormData>({
    resolver: zodResolver(individualSchema),
    defaultValues: initialData || {
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      phone: '',
      district: '',
      family_id: null,
      address: '',
      description: '',
      job: '',
      employment_status: 'no_salary',
      salary: null,
      needs: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'needs'
  });

  const handleFormSubmit = async (data: IndividualFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleAddMember = (memberData: any) => {
    // Handle the new member data
    console.log('New member data:', memberData);
    // You can add logic here to update the form with the new member data
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <PersonalInfoFields register={register} errors={errors} />
      <ContactFields register={register} errors={errors} families={families} />
      <EmploymentFields register={register} errors={errors} control={control} />

      {/* Add Member Button */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Family Members</h3>
          <AddMemberButton onAddMember={handleAddMember} />
        </div>
      </div>

      {/* Needs Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Needs</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={() => append({
              category: 'medical',
              priority: 'medium',
              description: '',
              status: 'pending'
            })}
          >
            Add Need
          </Button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-medium text-gray-900">Need {index + 1}</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={() => remove(index)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Category"
                {...register(`needs.${index}.category`)}
                error={errors.needs?.[index]?.category?.message}
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
                {...register(`needs.${index}.priority`)}
                error={errors.needs?.[index]?.priority?.message}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' }
                ]}
              />

              <div className="md:col-span-2">
                <TextArea
                  label="Description"
                  {...register(`needs.${index}.description`)}
                  error={errors.needs?.[index]?.description?.message}
                  placeholder="Describe the need..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

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
          type="submit"
          isLoading={isLoading}
        >
          Save Individual
        </Button>
      </div>
    </form>
  );
}