import React from 'react';
    import { UseFormRegister, FieldErrors, Control, useWatch } from 'react-hook-form';
    import { IndividualFormData } from '../../../schemas/individualSchema';
    import { Input } from '../../ui/Input';
    import { Select } from '../../ui/Select';
    
    interface EmploymentFieldsProps {
      register: UseFormRegister<IndividualFormData>;
      errors: FieldErrors<IndividualFormData>;
      control: Control<IndividualFormData>;
    }
    
    export function EmploymentFields({ register, errors, control }: EmploymentFieldsProps) {
      const employmentStatus = useWatch({
        control,
        name: 'employment_status'
      });
    
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Employment Information</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Job Title"
              {...register('job')}
              error={errors.job?.message}
              placeholder="Enter job title..."
            />
    
            <Select
              label="Employment Status"
              {...register('employment_status')}
              error={errors.employment_status?.message}
              options={[
                { value: 'no_salary', label: 'No salary' },
                { value: 'has_salary', label: 'Has salary' },
                { value: 'social_support', label: 'تكافل وكرامة' }
              ]}
            />
    
            {employmentStatus === 'has_salary' && (
              <Input
                type="number"
                label="Monthly Salary"
                {...register('salary', { 
                  valueAsNumber: true,
                  setValueAs: v => v === '' ? null : parseFloat(v)
                })}
                error={errors.salary?.message}
                placeholder="Enter monthly salary amount..."
              />
            )}
          </div>
        </div>
      );
    }
