import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  ArrowLeft, 
  Calendar, 
  Package, 
  DollarSign, 
  FileText, 
  ChevronDown, 
  ChevronUp,
  Users,
  Home,
  MapPin,
  Filter,
  X,
  Trash2,
  Search 
} from 'lucide-react';
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
import { Individual, Family } from '../../types';

export function CreateDistribution() {
  const navigate = useNavigate();
  const location = useLocation();
  const { individuals, filters, setFilters } = useIndividuals();
  const { families } = useFamilies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchIndividuals, setSearchIndividuals] = useState('');
  const [searchFamilies, setSearchFamilies] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [showIndividualsDropdown, setShowIndividualsDropdown] = useState(false);
  const [showFamiliesDropdown, setShowFamiliesDropdown] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  
  const individualsSearchRef = useRef<HTMLDivElement>(null);
  const familiesSearchRef = useRef<HTMLDivElement>(null);

  // Initialize selectedIndividuals state from location state
  const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>(
    (location.state?.selectedIndividuals || []).map((individual: Individual) => individual.id)
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (individualsSearchRef.current && !individualsSearchRef.current.contains(event.target as Node)) {
        setShowIndividualsDropdown(false);
      }
      if (familiesSearchRef.current && !familiesSearchRef.current.contains(event.target as Node)) {
        setShowFamiliesDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm<DistributionFormData>({
    resolver: zodResolver(distributionSchema),
    defaultValues: {
      recipients: (location.state?.selectedIndividuals || []).map((individual: Individual) => ({
        individual_id: individual.id,
        quantity_received: 1
      })) || [{ individual_id: '', quantity_received: 1 }]
    },
    mode: 'onChange'
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'recipients'
  });

  // Watch recipients to calculate total quantity
  const recipients = watch('recipients');
  const totalQuantity = recipients.reduce((sum, recipient) => sum + (recipient.quantity_received || 0), 0);
  const formValues = watch();

  const handleIndividualSelect = (individual: Individual) => {
    if (!selectedIndividuals.includes(individual.id)) {
      const newRecipients = [...recipients, { individual_id: individual.id, quantity_received: 1 }];
      replace(newRecipients);
      setSelectedIndividuals([...selectedIndividuals, individual.id]);
    }
    setSearchIndividuals('');
    setShowIndividualsDropdown(false);
  };

  const handleFamilySelect = (family: Family) => {
    const newMemberIds = family.members
      .map(member => member.id)
      .filter(id => !selectedIndividuals.includes(id));

    const newRecipients = [
      ...recipients,
      ...newMemberIds.map(id => ({ individual_id: id, quantity_received: 1 }))
    ];

    replace(newRecipients);
    setSelectedIndividuals([...selectedIndividuals, ...newMemberIds]);
    setSearchFamilies('');
    setShowFamiliesDropdown(false);
  };

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    if (district) {
      const districtIndividuals = individuals.filter(i => i.district === district);
      const newRecipients = districtIndividuals
        .filter(i => !selectedIndividuals.includes(i.id))
        .map(i => ({ individual_id: i.id, quantity_received: 1 }));
      
      if (newRecipients.length > 0) {
        replace([...recipients, ...newRecipients]);
        setSelectedIndividuals([...selectedIndividuals, ...newRecipients.map(r => r.individual_id)]);
        toast.success(`Added ${newRecipients.length} individuals from District ${district}`);
      } else {
        toast.error(`No new individuals found in District ${district}`);
      }
    }
  };

  const filteredIndividuals = individuals.filter(individual => {
    const searchString = `${individual.first_name} ${individual.last_name} ${individual.id_number}`.toLowerCase();
    return searchString.includes(searchIndividuals.toLowerCase()) && !selectedIndividuals.includes(individual.id);
  });

  const filteredFamilies = families.filter(family => {
    return family.name.toLowerCase().includes(searchFamilies.toLowerCase());
  });

  const onSubmit = async (data: DistributionFormData) => {
    try {
      setIsSubmitting(true);
      
      // Calculate total quantity from recipients
      const calculatedQuantity = data.recipients.reduce((sum, r) => sum + r.quantity_received, 0);
      
      // Add the calculated quantity to the data
      const distributionData = {
        ...data,
        quantity: calculatedQuantity
      };
      
      await createDistribution(distributionData);
      toast.success('Distribution created successfully');
      navigate('/distributions');
    } catch (error) {
      console.error('Error creating distribution:', error);
      toast.error('Failed to create distribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchIndividuals = (term: string) => {
    setSearchIndividuals(term);
  };

  const handleSearchFamilies = (term: string) => {
    setSearchFamilies(term);
  };

  // Update districts to match the individual form
  const districts = [
    { value: 'الكنيسة', label: 'الكنيسة' },
    { value: 'عمارة المعلمين', label: 'عمارة المعلمين' },
    { value: 'المرور', label: 'المرور' },
    { value: 'المنشية', label: 'المنشية' },
    { value: 'الرشيدية', label: 'الرشيدية' },
    { value: 'شارع الثورة', label: 'شارع الثورة' },
    { value: 'الزهور', label: 'الزهور' },
    { value: 'أبو خليل', label: 'أبو خليل' },
    { value: 'الكوادي', label: 'الكوادي' },
    { value: 'القطعة', label: 'القطعة' },
    { value: 'كفر امليط', label: 'كفر امليط' },
    { value: 'الشيخ زايد', label: 'الشيخ زايد' },
    { value: 'السببل', label: 'السببل' },
    { value: 'قري', label: 'قري' }
  ];

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
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Distribution Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Distribution Details</h2>
              
              <div className="space-y-4">
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
                  label="Total Value"
                  {...register('value', { valueAsNumber: true })}
                  error={errors.value?.message}
                />

                <TextArea
                  label="Description"
                  {...register('description')}
                  error={errors.description?.message}
                  placeholder="Describe the aid distribution..."
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Distribution Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Recipients</span>
                  <span className="font-medium">{recipients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Quantity</span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Value</span>
                  <span className="font-medium">${formValues.value || 0}</span>
                </div>
                {totalQuantity > 0 && formValues.value && (
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Value per Unit</span>
                    <span>${(formValues.value / totalQuantity).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recipients */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              {/* Filters Header */}
              <div 
                className="p-6 border-b border-gray-200 cursor-pointer"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                  </div>
                  {isFiltersExpanded ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Filters Content */}
              {isFiltersExpanded && (
                <div className="p-6 border-b border-gray-200 space-y-4">
                  <div className="space-y-4">
                    {/* Individual Search */}
                    <div className="relative" ref={individualsSearchRef}>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search individuals..."
                          value={searchIndividuals}
                          onChange={(e) => {
                            setSearchIndividuals(e.target.value);
                            setShowIndividualsDropdown(true);
                          }}
                          onFocus={() => setShowIndividualsDropdown(true)}
                        />
                      </div>
                      
                      {showIndividualsDropdown && searchIndividuals && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredIndividuals.length > 0 ? (
                            filteredIndividuals.map(individual => (
                              <div
                                key={individual.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleIndividualSelect(individual)}
                              >
                                <div className="font-medium">{individual.first_name} {individual.last_name}</div>
                                <div className="text-sm text-gray-500">ID: {individual.id_number}</div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">No matching individuals found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Family Search */}
                    <div className="relative" ref={familiesSearchRef}>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Search families..."
                          value={searchFamilies}
                          onChange={(e) => {
                            setSearchFamilies(e.target.value);
                            setShowFamiliesDropdown(true);
                          }}
                          onFocus={() => setShowFamiliesDropdown(true)}
                        />
                      </div>
                      
                      {showFamiliesDropdown && searchFamilies && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredFamilies.length > 0 ? (
                            filteredFamilies.map(family => (
                              <div
                                key={family.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => handleFamilySelect(family)}
                              >
                                <div className="font-medium">{family.name}</div>
                                <div className="text-sm text-gray-500">{family.members.length} members</div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-500">No matching families found</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* District Filter */}
                    <div className="relative">
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          value={selectedDistrict}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                        >
                          <option value="">Select District</option>
                          {districts.map(district => (
                            <option key={district.value} value={district.value}>
                              {district.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipients List */}
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recipients ({recipients.length})</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const individual = individuals.find(i => i.id === field.individual_id);
                    return (
                      <div key={field.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {individual?.first_name} {individual?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {individual?.id_number} | District: {individual?.district}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Input
                            type="number"
                            className="w-24"
                            {...register(`recipients.${index}.quantity_received`, { valueAsNumber: true })}
                            error={errors.recipients?.[index]?.quantity_received?.message}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => {
                              remove(index);
                              setSelectedIndividuals(selectedIndividuals.filter(id => id !== field.individual_id));
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Action Buttons */}
        <div className="fixed bottom-0 right-0 p-6 bg-white border-t border-gray-200 w-full md:w-auto md:rounded-tl-lg md:shadow-lg">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Create Distribution
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
