import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TextArea } from '../../components/ui/TextArea';
import { useIndividuals } from '../../hooks/useIndividuals';
import { useFamilies } from '../../hooks/useFamilies';
import { useDistributions } from '../../hooks/useDistributions';
import { updateDistribution } from '../../services/distributions';
import { distributionSchema, DistributionFormData } from '../../schemas/distributionSchema';
import { toast } from '../Individuals/Toast';

export function EditDistribution() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { individuals } = useIndividuals();
  const { families } = useFamilies();
  const { distributions } = useDistributions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string>('');

  const distribution = distributions.find(d => d.id === id);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      date: distribution?.date || '',
      aid_type: distribution?.aid_type || 'food',
      description: distribution?.description || '',
      quantity: distribution?.quantity || 0,
      value: distribution?.value || 0,
      recipients: distribution?.recipients.map(r => ({
        individual_id: r.individual_id,
        quantity_received: r.quantity_received,
      })) || []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'recipients'
  });

  useEffect(() => {
    if (distribution) {
      reset({
        date: distribution.date,
        aid_type: distribution.aid_type,
        description: distribution.description,
        quantity: distribution.quantity,
        value: distribution.value,
        recipients: distribution.recipients.map(r => ({
          individual_id: r.individual_id,
          quantity_received: r.quantity_received,
        }))
      });
    }
  }, [distribution, reset]);

  const handleFamilyChange = (familyId: string) => {
    setSelectedFamily(familyId);
    if (familyId) {
      const family = families.find(f => f.id === familyId);
      if (family) {
        setValue('recipients', family.members.map(member => ({
          individual_id: member.id,
          quantity_received: 0
        })));
      }
    }
  };

  const onSubmit = async (data: DistributionFormData) => {
    if (!id) return;
    
    try {
      setIsSubmitting(true);
      await updateDistribution(id, data);
      toast.success('Distribution updated successfully');
      navigate('/distributions');
    } catch (error) {
      console.error('Error updating distribution:', error);
      toast.error('Failed to update distribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!distribution) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Distribution not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          icon={ArrowLeft}
          onClick={() => navigate('/distributions')}
        >
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Distribution</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              type="date"
              label="Distribution Date"
              {...register('date')}
              error={errors.date?.message}
            />

            <Select
              label="Aid Type"
              {...register('aid_type')}
              error={errors.aid_type?.message}
              options={[
                { value: 'food', label: 'Food' },
                { value: 'clothing', label: 'Clothing' },
                { value: 'financial', label: 'Financial' },
                { value: 'medical', label: 'Medical' },
                { value: 'education', label: 'Education' },
                { value: 'shelter', label: 'Shelter' },
                { value: 'other', label: 'Other' }
              ]}
            />

            <Input
              type="number"
              label="Total Quantity"
              {...register('quantity', { valueAsNumber: true })}
              error={errors.quantity?.message}
            />

            <Input
              type="number"
              label="Total Value"
              {...register('value', { valueAsNumber: true })}
              error={errors.value?.message}
            />

            <div className="md:col-span-2">
              <TextArea
                label="Description"
                {...register('description')}
                error={errors.description?.message}
                placeholder="Describe the aid distribution..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recipients</h2>
            <div className="flex space-x-4">
              <Select
                value={selectedFamily}
                onChange={(e) => handleFamilyChange(e.target.value)}
                options={[
                  { value: '', label: 'Select a family' },
                  ...families.map(family => ({
                    value: family.id,
                    label: family.name
                  }))
                ]}
                className="w-64"
              />
              <Button
                type="button"
                variant="outline"
                icon={Plus}
                onClick={() => append({ individual_id: '', quantity_received: 0 })}
              >
                Add Recipient
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-medium text-gray-900">Recipient {index + 1}</h3>
                  {index > 0 && (
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
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Individual"
                    {...register(`recipients.${index}.individual_id`)}
                    error={errors.recipients?.[index]?.individual_id?.message}
                    options={[
                      { value: '', label: 'Select individual' },
                      ...individuals.map(individual => ({
                        value: individual.id,
                        label: `${individual.first_name} ${individual.last_name}`
                      }))
                    ]}
                  />

                  <Input
                    type="number"
                    label="Quantity Received"
                    {...register(`recipients.${index}.quantity_received`, { valueAsNumber: true })}
                    error={errors.recipients?.[index]?.quantity_received?.message}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/distributions')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
          >
            Update Distribution
          </Button>
        </div>
      </form>
    </div>
  );
}
