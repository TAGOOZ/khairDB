import { useState, useEffect } from 'react';
import { X, Users, Search, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { familySchema, FamilyFormData, RelationType } from '../../../schemas/familySchema';
import { Individual, Family } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { supabase } from '../../../lib/supabase';
import { useLanguage } from '../../../contexts/LanguageContext';

interface AddFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FamilyFormData, familyId?: string) => Promise<void>;
  isLoading: boolean;
  family?: Family;
  mode?: 'create' | 'edit';
}

export function AddFamilyModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  family,
  mode = 'create'
}: AddFamilyModalProps) {
  const { t } = useLanguage();
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
      primary_contact_id: null,
      district: null,
      phone: null,
      address: null
    }
  });

  const selectedMembers = watch('members') || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Individual[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  // Store full individual objects for display purposes
  const [selectedIndividualDetails, setSelectedIndividualDetails] = useState<Individual[]>([]);

  useEffect(() => {
    if (mode === 'edit' && family) {
      // Filter out actual children (from children table) - they have parent_id property
      // Keep all individuals from family_members table (including non-parent adults like siblings)
      const individualsOnly = family.members.filter((member: any) => !('parent_id' in member));

      reset({
        name: family.name,
        status: family.status,
        primary_contact_id: family.primary_contact_id,
        district: family.district,
        phone: family.phone,
        address: family.address,
        members: individualsOnly.map(member => ({
          id: member.id,
          relation: member.family_relation || 'other'
        }))
      });
      // Store individual details (excluding actual children)
      setSelectedIndividualDetails(individualsOnly);
    } else if (!isOpen) {
      reset();
      setSearchTerm('');
      setSearchResults([]);
      setSelectedIndividualDetails([]);
    }
  }, [mode, family, isOpen, reset]);

  useEffect(() => {
    const searchIndividuals = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('individuals')
          .select('*')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,id_number.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;
        // Filter out already selected members
        const filtered = (data || []).filter(
          ind => !selectedMembers.some(m => m.id === ind.id)
        );
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error searching individuals:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchIndividuals, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, selectedMembers]);

  const handleFormSubmit = async (data: FamilyFormData) => {
    try {
      await onSubmit(data, family?.id);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addMember = (individual: Individual) => {
    const newMembers = [...selectedMembers, { id: individual.id, relation: 'other' as RelationType }];
    setValue('members', newMembers);
    setSelectedIndividualDetails([...selectedIndividualDetails, individual]);
    setSearchTerm(''); // Clear search after adding
    setSearchResults([]);
  };

  const removeMember = (memberId: string) => {
    const newMembers = selectedMembers.filter(m => m.id !== memberId);
    setValue('members', newMembers);
    setSelectedIndividualDetails(selectedIndividualDetails.filter(ind => ind.id !== memberId));
  };

  if (!isOpen) return null;

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
              {t('close')}
            </Button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {mode === 'create' ? t('addFamily') : t('edit')}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {mode === 'create' ? t('addFamily') : t('edit')}
              </p>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t('familyName')}
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder={t('familyName')}
                  />

                  <Select
                    label={t('status')}
                    {...register('status')}
                    error={errors.status?.message}
                    options={[
                      { value: 'green', label: t('green') },
                      { value: 'yellow', label: t('yellow') },
                      { value: 'red', label: t('red') }
                    ]}
                  />
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('members')}
                  </label>

                  {/* Search Box */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={t('searchPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                      </div>
                    )}
                  </div>

                  {/* Search Results */}
                  {searchTerm && searchResults.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {searchResults.map((individual) => (
                        <div
                          key={individual.id}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 flex justify-between items-center"
                          onClick={() => addMember(individual)}
                        >
                          <span className="block truncate font-medium">
                            {individual.first_name} {individual.last_name}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {individual.id_number}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Members List */}
                  <div className="border rounded-lg divide-y bg-gray-50 max-h-60 overflow-y-auto">
                    {selectedMembers.map((member, index) => {
                      const details = selectedIndividualDetails.find(d => d.id === member.id);
                      return (
                        <div key={member.id} className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {details ? `${details.first_name} ${details.last_name}` : 'Loading...'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={member.relation}
                              onChange={(e) => {
                                const newMembers = [...selectedMembers];
                                newMembers[index].relation = e.target.value as RelationType;
                                setValue('members', newMembers);
                              }}
                              options={[
                                { value: 'wife', label: t('wife') },
                                { value: 'husband', label: t('husband') },
                                { value: 'son', label: t('son') },
                                { value: 'daughter', label: t('daughter') },
                                { value: 'mother', label: t('mother') },
                                { value: 'father', label: t('father') },
                                { value: 'sister', label: t('sister') },
                                { value: 'brother', label: t('brother') },
                                { value: 'mother_in_law', label: t('motherInLaw') },
                                { value: 'father_in_law', label: t('fatherInLaw') },
                                { value: 'other', label: t('other') }
                              ]}
                              className="w-36 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => removeMember(member.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            />
                          </div>
                        </div>
                      );
                    })}
                    {selectedMembers.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        {t('noFamilyMembers')}
                      </div>
                    )}
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
                    {t('cancel')}
                  </Button>
                  <Button
                    type="submit"
                    isLoading={isLoading}
                  >
                    {mode === 'create' ? t('add') : t('save')}
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
