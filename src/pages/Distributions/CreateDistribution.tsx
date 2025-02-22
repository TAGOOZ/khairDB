import React, { useState, useEffect } from 'react';
    import { useNavigate, useLocation } from 'react-router-dom';
    import { useForm, useFieldArray } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
    import { Button } from '../../components/ui/Button';
    import { Input } from '../../components/ui/Input';
    import { Select } from '../../components/ui/Select';
    import { TextArea } from '../../components/ui/TextArea';
    import { useIndividuals } from '../../hooks/useIndividuals';
    import { useFamilies } from '../../hooks/useFamilies';
    import { createDistribution } from '../../services/distributions';
    import { distributionSchema, DistributionFormData } from '../../schemas/distributionSchema';
    import { toast } from '../Individuals/Toast';
    import { SearchInput } from '../../components/search/SearchInput';
    import { NeedCategory, NeedPriority, Individual } from '../../types';
    
    interface NeedFilter {
      category: NeedCategory | '';
      priority: NeedPriority | '';
    }
    
    interface FiltersState {
      search: string;
      district: string;
      needs: NeedFilter[];
      status?: 'green' | 'yellow' | 'red' | '';
      distributionStatus: 'all' | 'with' | 'without';
    }
    
    export function CreateDistribution() {
      const navigate = useNavigate();
      const location = useLocation();
      const { individuals, filters, setFilters } = useIndividuals();
      const { families } = useFamilies();
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [selectedFamily, setSelectedFamily] = useState<string>('');
      const [searchIndividuals, setSearchIndividuals] = useState('');
      const [searchFamilies, setSearchFamilies] = useState('');
    
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
          recipients: (location.state?.selectedIndividuals || []).map((individual: Individual) => ({
            individual_id: individual.id,
            quantity_received: 1
          })) || [{ individual_id: '', quantity_received: 1 }]
        }
      });
    
      const { fields, append, remove } = useFieldArray({
        control,
        name: 'recipients'
      });
    
      const handleFamilyChange = (familyId: string) => {
        setSelectedFamily(familyId);
        if (familyId) {
          const family = families.find(f => f.id === familyId);
          if (family) {
            // Replace all recipients with family members
            setValue('recipients', family.members.map(member => ({
              individual_id: member.id,
              quantity_received: 1
            })));
          }
        }
      };
    
      const onSubmit = async (data: DistributionFormData) => {
        try {
          setIsSubmitting(true);
          await createDistribution(data);
          toast.success('Distribution created successfully');
          navigate('/distributions');
        } catch (error) {
          console.error('Error creating distribution:', error);
          toast.error('Failed to create distribution');
        } finally {
          setIsSubmitting(false);
        }
      };
    
      const filteredIndividuals = individuals.filter(individual => {
        if (!searchIndividuals) return true;
        const searchString = `${individual.first_name} ${individual.last_name} ${individual.id_number}`.toLowerCase();
        return searchString.includes(searchIndividuals.toLowerCase());
      });
    
      const filteredFamilies = families.filter(family => {
        if (!searchFamilies) return true;
        return family.name.toLowerCase().includes(searchFamilies.toLowerCase());
      });
    
      const handleSearchIndividuals = (term: string) => {
        setSearchIndividuals(term);
      };
    
      const handleSearchFamilies = (term: string) => {
        setSearchFamilies(term);
      };
    
      const districts = Array.from({ length: 10 }, (_, i) => ({
        value: `${i + 1}`,
        label: `District ${i + 1}`
      }));
    
      const needCategories = [
        { value: '', label: 'All Categories' },
        { value: 'medical', label: 'Medical' },
        { value: 'financial', label: 'Financial' },
        { value: 'food', label: 'Food' },
        { value: 'shelter', label: 'Shelter' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'education', label: 'Education' },
        { value: 'employment', label: 'Employment' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'other', label: 'Other' }
      ];
    
      const priorityOptions = [
        { value: '', label: 'Any Priority' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ];
    
      const addNeedFilter = () => {
        setFilters({
          ...filters,
          needs: [...filters.needs, { category: '', priority: '' }]
        });
      };
    
      const removeNeedFilter = (index: number) => {
        const newNeeds = [...filters.needs];
        newNeeds.splice(index, 1);
        setFilters({ ...filters, needs: newNeeds });
      };
    
      const updateNeedFilter = (index: number, field: keyof NeedFilter, value: string) => {
        const newNeeds = [...filters.needs];
        newNeeds[index] = {
          ...newNeeds[index],
          [field]: value
        };
        setFilters({ ...filters, needs: newNeeds });
      };
    
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
            <h1 className="text-2xl font-bold text-gray-900">Create Distribution</h1>
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
                    { value: '', label: 'Select aid type' },
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
                  <div className="w-64">
                    <SearchInput
                      placeholder="Search families..."
                      value={searchFamilies}
                      onChange={(e) => handleSearchFamilies(e.target.value)}
                    />
                    <Select
                      value={selectedFamily}
                      onChange={(e) => handleFamilyChange(e.target.value)}
                      options={[
                        { value: '', label: 'Select a family' },
                        ...filteredFamilies.map(family => ({
                          value: family.id,
                          label: family.name
                        }))
                      ]}
                      className="w-64"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    icon={Plus}
                    onClick={() => append({ individual_id: '', quantity_received: 1 })}
                  >
                    Add Recipient
                  </Button>
                </div>
              </div>
    
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">Individual Filters</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <SearchInput
                      placeholder="Search individuals..."
                      value={searchIndividuals}
                      onChange={(e) => handleSearchIndividuals(e.target.value)}
                    />
                  </div>
                  <Select
                    label="District"
                    value={filters.district}
                    onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                    options={[
                      { value: '', label: 'All Districts' },
                      ...districts
                    ]}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Need Filters</h3>
                    <button
                      type="button"
                      onClick={addNeedFilter}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add Filter
                    </button>
                  </div>
    
                  {filters.needs.map((need, index) => (
                    <div key={index} className="flex gap-4 items-end bg-gray-50 p-3 rounded-lg">
                      <div className="flex-1">
                        <Select
                          label="Category"
                          value={need.category}
                          onChange={(e) => updateNeedFilter(index, 'category', e.target.value)}
                          options={needCategories}
                        />
                      </div>
                      <div className="flex-1">
                        <Select
                          label="Priority"
                          value={need.priority}
                          onChange={(e) => updateNeedFilter(index, 'priority', e.target.value)}
                          options={priorityOptions}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNeedFilter(index)}
                        className="px-2 py-2 text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
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
                          ...filteredIndividuals.map(individual => ({
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
                Create Distribution
              </Button>
            </div>
          </form>
        </div>
      );
    }
