import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { IndividualsList } from './IndividualsList';
import { IndividualsFilter } from '../../components/filters/IndividualsFilter';
import { useIndividuals } from '../../hooks/useIndividuals';
import { AddIndividualModal } from '../../components/modals/AddIndividualModal';
import { ViewIndividualModal } from '../../components/modals/ViewIndividualModal';
import { Individual } from '../../types';
import { IndividualFormData } from '../../schemas/individualSchema';
import { toast } from './Toast';
import { useFamilies } from '../../hooks/useFamilies';
import { useAuthStore } from '../../store/authStore';
import { submitIndividualRequest, PendingRequestError } from '../../services/pendingRequests';
import { Button } from '../../components/ui/Button';
import { createIndividual, updateIndividual, IndividualError } from '../../services/individuals';
import { useNavigate } from 'react-router-dom';
import { getIndividual } from '../../services/individuals';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export function Individuals() {
  const { t } = useLanguage();
  const { 
    individuals, 
    isLoading, 
    filters, 
    setFilters,
    refreshIndividuals,
    deleteIndividual
  } = useIndividuals();

  const { user } = useAuthStore();
  const { families } = useFamilies();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewModalLoading, setIsViewModalLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedForDistribution, setSelectedForDistribution] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (data: IndividualFormData, individualId?: string) => {
    try {
      setIsSubmitting(true);
      
      if (user?.role === 'user' && modalMode === 'create') {
        // Submit for approval if user role
        await submitIndividualRequest(data);
        toast.success('Individual request submitted for approval');
      } else {
        // Direct creation/update for admin role
        if (modalMode === 'create') {
          await createIndividual(data);
          toast.success('Individual successfully created');
        } else if (individualId) {
          await updateIndividual(individualId, data);
          toast.success('Individual successfully updated');
        }
      }
      
      setIsModalOpen(false);
      setSelectedIndividual(null);
      refreshIndividuals();
    } catch (error) {
      console.error('Error handling individual:', error);
      
      if (error instanceof IndividualError) {
        if (error.code === 'duplicate-id') {
          toast.error('An individual with this ID number already exists');
        } else {
          toast.error(error.message);
        }
      } else if (error instanceof PendingRequestError) {
        if (error.code === 'duplicate-id') {
          toast.error('An individual with this ID number already exists');
        } else if (error.code === 'unauthorized') {
          toast.error('Please log in to submit requests');
        } else {
          toast.error('Failed to submit request. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async (individual: Individual) => {
    setIsViewModalOpen(true);
    setIsViewModalLoading(true);
    setSelectedIndividual(null);
    try {
      const completeIndividual = await getIndividual(individual.id);
      
      if (completeIndividual) {
        // Fetch hashtags as they are not part of the getIndividual query by default
        const { data: hashtagsData, error: hashtagsError } = await supabase
          .from('individual_hashtags')
          .select('hashtag:hashtags(name)')
          .eq('individual_id', individual.id);
        
        if (hashtagsError) {
          console.error('Error fetching hashtags for individual:', hashtagsError);
        }

        // Append hashtags to the completeIndividual object
        const individualWithHashtags = {
          ...completeIndividual,
          hashtags: hashtagsData?.map((h: any) => h.hashtag?.name).filter(Boolean) || [],
        };
        setSelectedIndividual(individualWithHashtags);
      } else {
        console.warn('Individual not found when trying to view:', individual.id);
        toast.error('Individual details not found.');
        setIsViewModalOpen(false);
      }
    } catch (error) {
      console.error('Error fetching individual for view modal:', error);
      toast.error('Failed to load individual details.');
      setIsViewModalOpen(false);
    } finally {
      setIsViewModalLoading(false);
    }
  };

  const handleEdit = (individual: Individual) => {
    setSelectedIndividual(individual);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedIndividual(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this individual?')) {
      try {
        await deleteIndividual(id);
        toast.success('Individual successfully deleted');
        refreshIndividuals();
      } catch (error) {
        toast.error('Failed to delete individual. Please try again.');
      }
    }
  };

  const handleCreateDistribution = () => {
    if (selectedForDistribution.length === 0) {
      toast.error('Please select at least one individual to create a distribution.');
      return;
    }
    
    // Get the full individual objects for the selected IDs
    const selectedIndividuals = individuals.filter(individual => 
      selectedForDistribution.includes(individual.id)
    );
    
    navigate('/distributions/create', { 
      state: { selectedIndividuals }
    });
  };

  // Function to get individual data ready for edit modal
  const prepareIndividualForEdit = async (individual: Individual) => {
    try {
      // Get the complete individual data with all details
      const completeIndividual = await getIndividual(individual.id);
      
      if (completeIndividual) {
        // Get the individual's hashtags
        const { data: hashtagsData } = await supabase
          .from('individual_hashtags')
          .select('hashtag:hashtags(name)')
          .eq('individual_id', individual.id);
          
        // Extract hashtag names with proper typing
        interface HashtagResponse {
          hashtag: { name: string } | null;
        }
        
        const hashtags = hashtagsData 
          ? (hashtagsData as unknown as HashtagResponse[]).map(h => h.hashtag?.name).filter(Boolean) 
          : [];
        
        // Prepare assistance details in the correct format for the form
        const assistanceDetails = completeIndividual.assistance_details || [];
        
        // Define the assistance type interface
        interface AssistanceDetail {
          assistance_type: string;
          details: any;
        }
        
        const formattedIndividual = {
          ...completeIndividual,
          hashtags,
          // Map assistance details to their respective form fields with proper typing
          medical_help: assistanceDetails.find((a: AssistanceDetail) => a.assistance_type === 'medical_help')?.details || null,
          food_assistance: assistanceDetails.find((a: AssistanceDetail) => a.assistance_type === 'food_assistance')?.details || null,
          marriage_assistance: assistanceDetails.find((a: AssistanceDetail) => a.assistance_type === 'marriage_assistance')?.details || null,
          debt_assistance: assistanceDetails.find((a: AssistanceDetail) => a.assistance_type === 'debt_assistance')?.details || null,
          education_assistance: assistanceDetails.find((a: AssistanceDetail) => a.assistance_type === 'education_assistance')?.details || null,
          shelter_assistance: assistanceDetails.find((a: AssistanceDetail) => a.assistance_type === 'shelter_assistance')?.details || null,
        };
        
        setSelectedIndividual(formattedIndividual);
        setModalMode('edit');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error preparing individual for edit:', error);
      toast.error('Could not load individual data for editing.');
    }
  };

  const handleEditIndividual = (individual: Individual) => {
    prepareIndividualForEdit(individual);
  };

  const handleDeleteIndividual = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this individual?')) {
      try {
        await deleteIndividual(id);
        refreshIndividuals();
        toast.success('Individual deleted successfully');
      } catch (error) {
        console.error('Error deleting individual:', error);
        toast.error('Failed to delete individual');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('individuals')}</h1>
        <div className="flex space-x-4">
          <Button
            onClick={handleCreateDistribution}
            icon={Package}
          >
            {t('createDistribution')}
          </Button>
          <Button
            onClick={handleAdd}
            icon={Plus}
          >
            {user?.role === 'admin' ? t('addIndividual') : t('submitIndividualRequest')}
          </Button>
        </div>
      </div>

      <IndividualsFilter 
        filters={filters} 
        onFilterChange={setFilters} 
      />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <IndividualsList 
          individuals={individuals} 
          onEdit={handleEditIndividual}
          onDelete={handleDeleteIndividual}
          onView={handleView}
          userRole={user?.role}
          selectedForDistribution={selectedForDistribution}
          setSelectedForDistribution={setSelectedForDistribution}
        />
      )}

      <AddIndividualModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIndividual(null);
        }}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        families={families}
        individual={selectedIndividual || undefined}
        mode={modalMode}
        userRole={user?.role}
      />

      {selectedIndividual && (
        <ViewIndividualModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedIndividual(null);
          }}
          individual={selectedIndividual}
          isLoading={isViewModalLoading}
        />
      )}
    </div>
  );
}
