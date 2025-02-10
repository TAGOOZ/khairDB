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

export function Individuals() {
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

  const handleView = (individual: Individual) => {
    setSelectedIndividual(individual);
    setIsViewModalOpen(true);
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
    navigate('/distributions/create', { state: { selectedIndividuals: selectedForDistribution } });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Individuals</h1>
        <div className="flex space-x-4">
          <Button
            onClick={handleCreateDistribution}
            icon={Package}
          >
            Create Distribution
          </Button>
          <Button
            onClick={handleAdd}
            icon={Plus}
          >
            {user?.role === 'admin' ? 'Add Individual' : 'Submit Individual Request'}
          </Button>
        </div>
      </div>

      <IndividualsFilter filters={filters} onFilterChange={setFilters} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <IndividualsList 
          individuals={individuals} 
          onEdit={handleEdit}
          onDelete={handleDelete}
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
        />
      )}
    </div>
  );
}