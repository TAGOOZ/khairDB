import React from 'react';
    import { UseFormRegister, FieldErrors } from 'react-hook-form';
    import { IndividualFormData } from '../../../schemas/individualSchema';
    import { Input } from '../../ui/Input';
    import { Select } from '../../ui/Select';
    import { TextArea } from '../../ui/TextArea';
    import { Family } from '../../../types';
    
    interface ContactFieldsProps {
      register: UseFormRegister<IndividualFormData>;
      errors: FieldErrors<IndividualFormData>;
      families: Family[];
    }
    
    export function ContactFields({ register, errors, families }: ContactFieldsProps) {
      const districts = Array.from({ length: 10 }, (_, i) => ({
        value: `${i + 1}`,
        label: `District ${i + 1}`
      }));
    
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              type="tel"
              label="Phone"
              {...register('phone')}
              error={errors.phone?.message}
              placeholder="Enter phone number..."
            />
    
            <Select
              label="District"
              {...register('district')}
              error={errors.district?.message}
              options={[
                { value: '', label: 'Select District' },
                ...districts
              ]}
            />
    
            <Select
              label="Family"
              {...register('family_id')}
              error={errors.family_id?.message}
              options={[
                { value: '', label: 'No Family' },
                ...families.map(family => ({
                  value: family.id,
                  label: family.name
                }))
              ]}
            />
    
            <Input
              label="Address"
              {...register('address')}
              error={errors.address?.message}
              placeholder="Enter address..."
            />
          </div>
    
          <TextArea
            label="Description"
            {...register('description')}
            error={errors.description?.message}
            placeholder="Enter any additional information..."
          />
        </div>
      );
    }
