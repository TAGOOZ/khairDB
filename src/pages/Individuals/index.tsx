import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useIndividuals } from '../../hooks/useIndividuals';
import { IndividualsList } from './IndividualsList';
import { IndividualsFilter } from '../../components/filters/IndividualsFilter';
import { AddIndividualModal } from '../../components/modals/AddIndividualModal';
import { ViewIndividualModal } from "../../components/modals/ViewIndividualModal";
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { Individual } from '../../types';

import { useIndividualActions } from './hooks/useIndividualActions';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthStore } from '../../store/authStore';

export function Individuals() {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  const {
    individuals,
    isLoading,
    totalCount,
    filters,
    setFilters,
    refreshIndividuals
  } = useIndividuals();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedForDistribution, setSelectedForDistribution] = useState<string[]>([]);

  const { handleSubmit, handleDelete, isSubmitting } = useIndividualActions({
    onSuccess: () => {
      setIsAddModalOpen(false);
      setSelectedIndividual(null);
      refreshIndividuals();
    }
  });

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdd = () => {
    setSelectedIndividual(null);
    setModalMode('create');
    setIsAddModalOpen(true);
  };

  const handleEdit = (individual: Individual) => {
    setSelectedIndividual(individual);
    setModalMode('edit');
    setIsAddModalOpen(true);
  };

  const handleView = (individual: Individual) => {
    setSelectedIndividual(individual);
    setIsViewModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedIndividual(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedIndividual(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('individuals')}</h1>
        <Button
          onClick={handleAdd}
          icon={Plus}
        >
          {t('addIndividual')}
        </Button>
      </div>

      <IndividualsFilter filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <>
          <IndividualsList
            individuals={individuals}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            userRole={user?.role}
            selectedForDistribution={selectedForDistribution}
            setSelectedForDistribution={setSelectedForDistribution}
          />
          {totalCount > 0 && (
            <Pagination
              currentPage={filters.page}
              totalPages={Math.ceil(totalCount / filters.perPage)}
              totalItems={totalCount}
              itemsPerPage={filters.perPage}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      <AddIndividualModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        individual={selectedIndividual || undefined}
        mode={modalMode}
        userRole={user?.role}
      />

      {selectedIndividual && (
        <ViewIndividualModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          individual={selectedIndividual}
          isLoading={false}
        />
      )}
    </div>
  );
}
