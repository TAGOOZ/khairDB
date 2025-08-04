import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { FamiliesList } from './components/FamiliesList';
import { SearchFilters } from './components/SearchFilters';
import { useFamilies } from '../../hooks/useFamilies';
import { useIndividuals } from '../../hooks/useIndividuals';
import { AddFamilyModal } from './components/AddFamilyModal';
import { ViewFamilyModal } from './components/ViewFamilyModal';
import { Button } from '../../components/ui/Button';
import { Family } from '../../types';
import { FamilyFormData } from '../../schemas/familySchema';
import { useFamilyActions } from './hooks/useFamilyActions';
import { useLanguage } from '../../contexts/LanguageContext';

export function Families() {
  const { t } = useLanguage();
  const { 
    families, 
    isLoading, 
    filters, 
    setFilters,
    refreshFamilies
  } = useFamilies();

  const { individuals } = useIndividuals();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { handleSubmit, handleDelete, isSubmitting } = useFamilyActions({
    onSuccess: () => {
      setIsAddModalOpen(false);
      setSelectedFamily(null);
      refreshFamilies();
    }
  });

  const handleAdd = () => {
    setSelectedFamily(null);
    setModalMode('create');
    setIsAddModalOpen(true);
  };

  const handleEdit = (family: Family) => {
    setSelectedFamily(family);
    setModalMode('edit');
    setIsAddModalOpen(true);
  };

  const handleView = (family: Family) => {
    setSelectedFamily(family);
    setIsViewModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setSelectedFamily(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedFamily(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('families')}</h1>
        <Button
          onClick={handleAdd}
          icon={Plus}
        >
          {t('addFamily')}
        </Button>
      </div>

      <SearchFilters filters={filters} onFilterChange={setFilters} />
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <FamiliesList 
          families={families}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />
      )}

      <AddFamilyModal
        isOpen={isAddModalOpen}
        onClose={closeAddModal}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        individuals={individuals}
        family={selectedFamily || undefined}
        mode={modalMode}
      />

      {selectedFamily && (
        <ViewFamilyModal
          isOpen={isViewModalOpen}
          onClose={closeViewModal}
          family={selectedFamily}
        />
      )}
    </div>
  );
}
