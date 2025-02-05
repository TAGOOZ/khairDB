import React from 'react';
    import { UseFormRegister, FieldErrors } from 'react-hook-form';
    import { IndividualFormData } from '../../../schemas/individualSchema';
    import { Input } from '../../ui/Input';
    import { Select } from '../../ui/Select';
    
    interface PersonalInfoFieldsProps {
      register: UseFormRegister<IndividualFormData>;
      errors: FieldErrors<IndividualFormData>;
    }
    
    export function PersonalInfoFields({ register, errors }: PersonalInfoFieldsProps) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="First Name"
              {...register('first_name')}
              error={errors.first_name?.message}
              placeholder="Enter first name..."
            />
    
            <Input
              label="Last Name"
              {...register('last_name')}
              error={errors.last_name?.message}
              placeholder="Enter last name..."
            />
    
            <Input
              label="ID Number"
              {...register('id_number')}
              error={errors.id_number?.message}
              placeholder="Enter 14-digit ID number..."
              maxLength={14}
            />
    
            <Input
              type="date"
              label="Date of Birth"
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
              max={new Date().toISOString().split('T')[0]}
            />
    
            <Select
              label="Gender"
              {...register('gender')}
              error={errors.gender?.message}
              options={[
                { value: '', label: 'Select gender' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' }
              ]}
            />
    
            <Select
              label="Marital Status"
              {...register('marital_status')}
              error={errors.marital_status?.message}
              options={[
                { value: '', label: 'Select marital status' },
                { value: 'single', label: 'Single' },
                { value: 'married', label: 'Married' },
                { value: 'widowed', label: 'Widowed' }
              ]}
            />
            <Select
              label="List Status"
              {...register('list_status')}
              error={errors.list_status?.message}
              options={[
                { value: 'whitelist', label: 'Whitelist' },
                { value: 'blacklist', label: 'Blacklist' },
                { value: 'waitinglist', label: 'Waitinglist' }
              ]}
            />
          </div>
        </div>
      );
    }
