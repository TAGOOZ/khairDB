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
  Search,
  Heart,
  CheckSquare,
  Square,
  UserCheck,
  Baby,
  UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { TextArea } from '../../components/ui/TextArea';
import { useIndividuals } from '../../hooks/useIndividuals';
import { useFamilies } from '../../hooks/useFamilies';
import { createDistribution, getFamilyMembersForDistribution } from '../../services/distributions';
import { distributionSchema, DistributionFormData } from '../../schemas/distributionSchema';
import { toast } from '../Individuals/Toast';
import { SearchInput } from '../../components/search/SearchInput';
import { Individual, Family, AssistanceType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';

export function CreateDistribution() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, dir } = useLanguage();
  const { individuals, filters, setFilters } = useIndividuals();
  const { families } = useFamilies();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchIndividuals, setSearchIndividuals] = useState('');
  const [searchFamilies, setSearchFamilies] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [showIndividualsDropdown, setShowIndividualsDropdown] = useState(false);
  const [showFamiliesDropdown, setShowFamiliesDropdown] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedAssistanceType, setSelectedAssistanceType] = useState<AssistanceType | ''>('');
  
  // State for managing selected recipients
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  
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

  // Helper function to get member details for display
  const getMemberDetails = (memberId: string) => {
    // Check if it's an additional member
    if (memberId.startsWith('additional_')) {
      const [, parentId, memberIndex] = memberId.split('_');
      const parentIndividual = individuals.find(i => i.id === parentId);
      
      if (parentIndividual && parentIndividual.additional_members && Array.isArray(parentIndividual.additional_members)) {
        const additionalMember = parentIndividual.additional_members[parseInt(memberIndex)];
        if (additionalMember) {
          return {
            name: additionalMember.name || 'Unknown',
            id_number: 'Additional Member',
            district: parentIndividual.district,
            type: 'additional_member',
            relation: additionalMember.relation || 'other',
            parentName: `${parentIndividual.first_name} ${parentIndividual.last_name}`
          };
        }
      }
      return {
        name: 'Unknown Additional Member',
        id_number: 'N/A',
        district: 'N/A',
        type: 'additional_member',
        relation: 'unknown',
        parentName: 'Unknown'
      };
    }
    
    // First check if it's a regular individual
    const individual = individuals.find(i => i.id === memberId);
    if (individual) {
      return {
        name: `${individual.first_name} ${individual.last_name}`,
        id_number: individual.id_number,
        district: individual.district,
        type: 'individual',
        relation: null,
        parentName: null
      };
    }
    
    // If not found in individuals, check if it's a child in families
    for (const family of families) {
      // Check if it's a child member in the family
      const childMember = family.members.find((m: any) => m.id === memberId && m.family_role === 'child');
      if (childMember) {
        // Calculate age from date of birth
        const calculateAge = (dateOfBirth: string) => {
          const today = new Date();
          const birthDate = new Date(dateOfBirth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          return age;
        };

        const age = childMember.date_of_birth ? calculateAge(childMember.date_of_birth) : null;
        
        return {
          name: `${childMember.first_name} ${childMember.last_name}`,
          id_number: childMember.id_number || 'Child',
          district: family.district || childMember.district || 'N/A',
          age: age,
          type: 'child',
          relation: 'child',
          parentName: family.name
        };
      }
    }
    
    return {
      name: 'Unknown Individual',
      id_number: 'N/A',
      district: 'N/A',
      type: 'unknown',
      relation: null,
      parentName: null
    };
  };

  const handleIndividualSelect = (individual: Individual) => {
    if (!selectedIndividuals.includes(individual.id)) {
      const newRecipients = [...recipients, { individual_id: individual.id, quantity_received: 1 }];
      replace(newRecipients);
      setSelectedIndividuals([...selectedIndividuals, individual.id]);
    }
    setSearchIndividuals('');
    setShowIndividualsDropdown(false);
  };

  const handleFamilySelect = async (family: Family) => {
    try {
      // Get all family members including additional members
      const familyMembers = await getFamilyMembersForDistribution(family.id);
      
      // Create list of all member IDs that aren't already selected
      const existingMemberIds = family.members
        .map(member => member.id)
        .filter(id => !selectedIndividuals.includes(id));
      
      const additionalMemberIds = familyMembers.additional_members
        .map(member => member.id)
        .filter(id => !selectedIndividuals.includes(id));
      
      const allNewMemberIds = [...existingMemberIds, ...additionalMemberIds];

      if (allNewMemberIds.length > 0) {
        const newRecipients = [
          ...recipients,
          ...allNewMemberIds.map(id => ({ individual_id: id, quantity_received: 1 }))
        ];

        replace(newRecipients);
        setSelectedIndividuals([...selectedIndividuals, ...allNewMemberIds]);
        
        const message = t('addedFamilyMembers')
          .replace('{count}', allNewMemberIds.length.toString())
          .replace('{individuals}', existingMemberIds.length.toString())
          .replace('{additional}', additionalMemberIds.length.toString());
        toast.success(message);
      } else {
        toast.success(t('allFamilyMembersSelected'));
      }
    } catch (error) {
      console.error('Error getting family members:', error);
      toast.error(t('failedToLoadFamilyMembers'));
    }
    
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
        const message = t('addedIndividualsFromDistrict')
          .replace('{count}', newRecipients.length.toString())
          .replace('{district}', district);
        toast.success(message);
      } else {
        const message = t('noNewIndividualsFound')
          .replace('{district}', district);
        toast.error(message);
      }
    }
  };

  const handleAssistanceTypeChange = (assistanceType: AssistanceType | '') => {
    setSelectedAssistanceType(assistanceType);
    if (assistanceType) {
      // Filter individuals who have this type of assistance
      const assistanceIndividuals = individuals.filter(individual => 
        individual.assistance_details?.some(detail => detail.assistance_type === assistanceType)
      );
      
      const newRecipients = assistanceIndividuals
        .filter(i => !selectedIndividuals.includes(i.id))
        .map(i => ({ individual_id: i.id, quantity_received: 1 }));
      
      if (newRecipients.length > 0) {
        replace([...recipients, ...newRecipients]);
        setSelectedIndividuals([...selectedIndividuals, ...newRecipients.map(r => r.individual_id)]);
        // Get the translated assistance type name
        const assistanceTypeKey = assistanceType.replace('_', '').replace('help', 'Help').replace('assistance', 'Assistance');
        const translatedType = t(assistanceTypeKey as any) || assistanceType.replace('_', ' ');
        toast.success(`${t('added')} ${newRecipients.length} ${t('individualsWithAssistance')} ${translatedType}`);
      } else {
        const assistanceTypeKey = assistanceType.replace('_', '').replace('help', 'Help').replace('assistance', 'Assistance');
        const translatedType = t(assistanceTypeKey as any) || assistanceType.replace('_', ' ');
        toast.error(`${t('noNewIndividualsFoundWithAssistance')} ${translatedType}`);
      }
    }
  };

  // Recipient management functions
  const handleRecipientSelect = (fieldId: string) => {
    // Only allow selection of existing field IDs
    const fieldExists = fields.some(field => field.id === fieldId);
    if (!fieldExists) return;
    
    setSelectedRecipients(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  // Get valid selected recipients (only those that still exist in fields)
  const getValidSelectedRecipients = () => {
    const validFieldIds = new Set(fields.map(field => field.id));
    return selectedRecipients.filter(id => validFieldIds.has(id));
  };

  const validSelectedRecipients = getValidSelectedRecipients();

  const handleSelectAll = () => {
    const allFieldIds = fields.map(field => field.id);
    setSelectedRecipients(allFieldIds);
  };

  const handleDeselectAll = () => {
    setSelectedRecipients([]);
  };

  const handleSelectChildren = () => {
    const childrenIds = fields.filter(field => {
      const memberDetails = getMemberDetails(field.individual_id);
      return memberDetails.type === 'child';
    }).map(field => field.id);
    setSelectedRecipients(childrenIds);
  };

  const handleSelectAdditionalMembers = () => {
    const additionalMemberIds = fields.filter(field => {
      const memberDetails = getMemberDetails(field.individual_id);
      return memberDetails.type === 'additional_member';
    }).map(field => field.id);
    setSelectedRecipients(additionalMemberIds);
  };

  const handleDeleteSelected = () => {
    if (validSelectedRecipients.length < 2) return;
    
    // Find indices of selected recipients that actually exist
    const indicesToRemove = validSelectedRecipients
      .map(fieldId => fields.findIndex(field => field.id === fieldId))
      .filter(index => index !== -1)
      .sort((a, b) => b - a); // Sort in reverse order to remove from end first
    
    // Get the individual IDs of recipients being deleted to remove from selectedIndividuals
    const deletedIndividualIds = indicesToRemove.map(index => fields[index].individual_id);
    
    // Remove recipients from form fields
    indicesToRemove.forEach(index => remove(index));
    
    // Remove deleted individuals from selectedIndividuals state
    setSelectedIndividuals(prev => prev.filter(id => !deletedIndividualIds.includes(id)));
    
    // Clear selection completely - this ensures no stale IDs remain
    setSelectedRecipients([]);
    
    toast.success(t('recipientsDeletedSuccessfully') || `Deleted ${indicesToRemove.length} recipients`);
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
      toast.success(t('distributionCreatedSuccessfully'));
      navigate('/distributions');
    } catch (error) {
      console.error('Error creating distribution:', error);
      toast.error(t('failedToCreateDistribution'));
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

  const assistanceTypes = [
    { value: '', label: t('selectAssistanceType') },
    { value: 'medical_help', label: t('medicalHelp') },
    { value: 'food_assistance', label: t('foodAssistance') },
    { value: 'marriage_assistance', label: t('marriageAssistance') },
    { value: 'debt_assistance', label: t('debtAssistance') },
    { value: 'education_assistance', label: t('educationAssistance') },
    { value: 'shelter_assistance', label: t('shelterAssistance') }
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
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className={`flex items-center justify-between ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-4 ${dir === 'rtl' ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <Button
              variant="ghost"
              icon={ArrowLeft}
              onClick={() => navigate('/distributions')}
            >
              {t('back')}
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{t('createDistribution')}</h1>
          </div>
          
          {/* Create Distribution Button */}
          <Button
            type="submit"
            form="distribution-form"
            isLoading={isSubmitting}
            disabled={!isValid}
            icon={Package}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            {t('createDistribution')}
          </Button>
        </div>
      </div>

      <form id="distribution-form" onSubmit={handleSubmit(onSubmit)} className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Distribution Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">{t('distributionDetails')}</h2>
              
              <div className="space-y-4">
                <Input
                  type="date"
                  label={t('distributionDate')}
                  {...register('date')}
                  error={errors.date?.message}
                />

                <Select
                  label={t('aidType')}
                  {...register('aid_type')}
                  error={errors.aid_type?.message}
                  options={[
                    { value: '', label: t('selectAidType') },
                    { value: 'food', label: t('food') },
                    { value: 'clothing', label: t('clothing') },
                    { value: 'financial', label: t('financial') },
                    { value: 'medical', label: t('medical') },
                    { value: 'education', label: t('education') },
                    { value: 'shelter', label: t('shelter') },
                    { value: 'other', label: t('other') }
                  ]}
                />

                <Input
                  type="number"
                  label={t('totalValue')}
                  {...register('value', { valueAsNumber: true })}
                  error={errors.value?.message}
                />

                <TextArea
                  label={t('description')}
                  {...register('description')}
                  error={errors.description?.message}
                  placeholder={t('describeDistribution')}
                />
              </div>
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{t('distributionSummary')}</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('totalRecipients')}</span>
                  <span className="font-medium">{recipients.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('totalQuantity')}</span>
                  <span className="font-medium">{totalQuantity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('totalValue')}</span>
                  <span className="font-medium">${formValues.value || 0}</span>
                </div>
                {totalQuantity > 0 && formValues.value && (
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{t('valuePerUnit')}</span>
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
                    <h2 className="text-lg font-medium text-gray-900">{t('filters')}</h2>
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
                          placeholder={t('searchIndividuals')}
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
                            <div className="px-4 py-2 text-gray-500">{t('noMatchingIndividuals')}</div>
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
                          placeholder={t('searchFamilies')}
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
                            filteredFamilies.map(family => {
                              // Calculate additional members count
                              const additionalMembersCount = family.members
                                .filter(member => member.family_role === 'parent')
                                .reduce((count, member) => {
                                  const individual = individuals.find(i => i.id === member.id);
                                  return count + (individual?.additional_members?.length || 0);
                                }, 0);
                              
                              const parentMembersCount = family.members.filter(m => m.family_role === 'parent').length;
                              const childMembersCount = family.members.filter(m => m.family_role === 'child').length;
                              const totalMembers = parentMembersCount + childMembersCount + additionalMembersCount;
                              
                              return (
                                <div
                                  key={family.id}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={() => handleFamilySelect(family)}
                                >
                                  <div className="font-medium">{family.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {totalMembers} {t('totalMembers')} ({parentMembersCount} {t('adults')}, {childMembersCount} {t('children')}
                                    {additionalMembersCount > 0 && `, +${additionalMembersCount} ${t('additional')}`})
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="px-4 py-2 text-gray-500">{t('noMatchingFamilies')}</div>
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
                          <option value="">{t('selectDistrict')}</option>
                          {districts.map(district => (
                            <option key={district.value} value={district.value}>
                              {district.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Assistance Type Filter */}
                    <div className="relative">
                      <div className="relative">
                        <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                        <select
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                          value={selectedAssistanceType}
                          onChange={(e) => handleAssistanceTypeChange(e.target.value as AssistanceType | '')}
                        >
                          {assistanceTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{t('recipients')} ({recipients.length})</h3>
                  
                  {/* Management Buttons */}
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={UserCheck}
                      onClick={handleSelectAll}
                      className="text-xs"
                    >
                      {t('selectAll')}
                    </Button>
                    
                    {validSelectedRecipients.length > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={X}
                        onClick={handleDeselectAll}
                        className="text-xs"
                      >
                        {t('deselectAll')}
                      </Button>
                    )}
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={Baby}
                      onClick={handleSelectChildren}
                      className="text-xs"
                    >
                      {t('children')}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={UserPlus}
                      onClick={handleSelectAdditionalMembers}
                      className="text-xs"
                    >
                      {t('additional')}
                    </Button>
                    
                    {validSelectedRecipients.length >= 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        onClick={handleDeleteSelected}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {t('delete')} ({validSelectedRecipients.length})
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {fields.map((field, index) => {
                    const memberDetails = getMemberDetails(field.individual_id);
                    const isSelected = validSelectedRecipients.includes(field.id);
                    
                    return (
                      <div key={field.id} className={`flex items-center justify-between p-4 rounded-lg ${isSelected ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'}`}>
                        <div className="flex items-center space-x-3">
                          {/* Selection Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleRecipientSelect(field.id)}
                            className="flex-shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                          </button>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <div className="text-sm font-medium text-gray-900">
                                {memberDetails.name}
                              </div>
                              {memberDetails.type === 'additional_member' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('additional')}
                                </span>
                              )}
                              {memberDetails.type === 'child' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {t('children')}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {memberDetails.type === 'additional_member' ? (
                                <>
                                  {t('relation')}: {memberDetails.relation} | {t('parent')}: {memberDetails.parentName} | {t('district')}: {memberDetails.district}
                                </>
                              ) : memberDetails.type === 'child' ? (
                                <>
                                  {memberDetails.id_number} | {t('family')}: {memberDetails.parentName} | {t('age')}: {memberDetails.age !== null ? `${memberDetails.age} ${t('yearsOld')}` : t('unknownAge')}
                                </>
                              ) : (
                                <>
                                  ID: {memberDetails.id_number} | {t('district')}: {memberDetails.district}
                                </>
                              )}
                            </div>
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
                            {t('remove')}
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

        {/* Action Buttons - Moved to end of form */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              {t('cancel')}
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {t('createDistribution')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
