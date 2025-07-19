import { useState, useEffect, useCallback } from 'react';
import { Individual, AssistanceType } from '../types';
import { supabase } from '../lib/supabase';

interface AssistanceDetails {
  id: string;
  assistance_type: AssistanceType;
  details: Record<string, any>;
}

interface NeedFilter {
  category: AssistanceType | '';
}

interface FiltersState {
  search: string;
  district: string;
  needs: NeedFilter[];
  status?: 'green' | 'yellow' | 'red' | '';
  distributionStatus: 'all' | 'with' | 'without';
  listStatus: 'whitelist' | 'blacklist' | 'waitinglist' | '';
}

export function useIndividuals() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    district: '',
    needs: [],
    status: '',
    distributionStatus: 'all',
    listStatus: ''
  });

  const fetchIndividuals = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('individuals')
        .select(`
          *,
          created_by_user:users!individuals_created_by_fkey (
            first_name,
            last_name
          ),
          assistance_details (
            id,
            assistance_type,
            details,
            created_at,
            updated_at
          ),
          needs (
            id,
            category,
            priority,
            status,
            description,
            created_at,
            updated_at
          ),
          children (
            id,
            first_name,
            last_name,
            date_of_birth,
            gender,
            school_stage,
            description,
            parent_id,
            family_id
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,` +
          `last_name.ilike.%${filters.search}%,` +
          `id_number.ilike.%${filters.search}%,` +
          `phone.ilike.%${filters.search}%,` +
          `description.ilike.%${filters.search}%`
        );
      }

      if (filters.district) {
        query = query.eq('district', filters.district);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.listStatus) {
        query = query.eq('list_status', filters.listStatus);
      }

      const { data: individualsData, error: individualsError } = await query;

      if (individualsError) {
        console.error('Error fetching individuals:', individualsError);
        throw individualsError;
      }

      let filteredData = individualsData || [];

      // Only apply assistance details filtering if there are filters selected
      if (filters.needs && filters.needs.length > 0 && filters.needs.some(need => need.category !== '')) {
        // Get the active filter categories (non-empty ones)
        const activeCategories = filters.needs
          .filter(need => need.category !== '')
          .map(need => need.category);

        // Filter individuals who have ANY of the selected assistance types (OR logic)
        filteredData = filteredData.filter(individual => {
          return individual.assistance_details?.some((detail: AssistanceDetails) => 
            activeCategories.includes(detail.assistance_type)
          );
        });
      }

      // Ensure needs array is initialized
      filteredData = filteredData.map(individual => ({
        ...individual,
        needs: individual.needs || [],
        assistance_details: individual.assistance_details || [],
        children: individual.children || []
      }));

      // Fetch distributions for filtered individuals
      const individualsWithDistributions = await Promise.all(
        filteredData.map(async (individual) => {
          const { data: distributions, error: distributionError } = await supabase
            .from('distribution_recipients')
            .select(`
              distribution:distributions(*)
            `)
            .eq('individual_id', individual.id);

          if (distributionError) {
            console.error('Error fetching distributions for individual:', individual.id, distributionError);
            return { ...individual, distributions: [] };
          }

          return {
            ...individual,
            distributions: distributions ? distributions.map(d => d.distribution) : []
          };
        })
      );

      // Apply distribution status filter
      let finalData = individualsWithDistributions;
      if (filters.distributionStatus === 'with') {
        finalData = finalData.filter(individual => individual.distributions.length > 0);
      } else if (filters.distributionStatus === 'without') {
        finalData = finalData.filter(individual => individual.distributions.length === 0);
      }

      setIndividuals(finalData);
    } catch (error) {
      console.error('Error fetching individuals:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIndividuals();
  }, [fetchIndividuals]);

  const deleteIndividual = async (id: string) => {
    try {
      const { error } = await supabase
        .from('individuals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchIndividuals();
    } catch (error) {
      console.error('Error deleting individual:', error);
      throw error;
    }
  };

  return {
    individuals,
    isLoading,
    filters,
    setFilters,
    refreshIndividuals: fetchIndividuals,
    deleteIndividual
  };
}
