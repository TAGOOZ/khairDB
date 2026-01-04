import { useState, useEffect, useCallback } from 'react';
import { Individual, AssistanceType, AssistanceDetails } from '../types';
import { supabase } from '../lib/supabase';

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
  page: number;
  perPage: number;
}

export function useIndividuals() {
  const [individuals, setIndividuals] = useState<Individual[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    district: '',
    needs: [],
    status: '',
    distributionStatus: 'all',
    listStatus: '',
    page: 1,
    perPage: 50
  });

  const fetchIndividuals = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeNeedsCategories = filters.needs
        .filter(need => need.category !== '')
        .map(need => need.category);

      const hasNeedFilter = activeNeedsCategories.length > 0;
      // Use !inner if we need to filter by assistance details effectively
      const assistanceDetailsJoin = hasNeedFilter
        ? 'assistance_details!inner'
        : 'assistance_details';

      // For distribution status 'with', we can verify existence with !inner join
      // 'without' is more complex in simple PostgREST, we'll handle standard pagination mostly
      const distributionRecipientsJoin = filters.distributionStatus === 'with'
        ? 'distribution_recipients!inner'
        : 'distribution_recipients';

      let query = supabase
        .from('individuals')
        .select(`
          *,
          created_by_user:users!individuals_created_by_fkey (
            first_name,
            last_name
          ),
          family:families!individuals_family_id_fkey (
            id,
            name,
            status,
            phone,
            address,
            district
          ),
          ${assistanceDetailsJoin} (
            id,
            assistance_type,
            details,
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
          ),
          ${distributionRecipientsJoin} (
            distributions (
              id,
              date,
              aid_type,
              description,
              quantity,
              value,
              status,
              created_at
            )
          )
        `, { count: 'exact' })
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

      if (hasNeedFilter) {
        // This relies on the !inner join above to filter individuals who have any of these types
        query = query.in('assistance_details.assistance_type', activeNeedsCategories);
      }

      // Pagination
      const from = (filters.page - 1) * filters.perPage;
      const to = from + filters.perPage - 1;
      query = query.range(from, to);

      const { data: individualsData, error: individualsError, count } = await query;

      if (individualsError) {
        console.error('Error fetching individuals:', individualsError);
        throw individualsError;
      }

      setTotalCount(count || 0);

      let filteredData = individualsData || [];

      // Transform the data to map distribution_recipients to distributions
      let finalData = filteredData.map(individual => {
        // Extract distributions from distribution_recipients
        // The type assertion is needed because Supabase types might imply a single object or array depending on the query
        const rawRecipients = individual.distribution_recipients as unknown as { distributions: any }[] | null;

        const distributions = rawRecipients
          ? rawRecipients
            .map(r => r.distributions)
            .filter(d => d !== null)
          : [];

        return {
          ...individual,
          assistance_details: individual.assistance_details || [],
          children: individual.children || [],
          distributions: distributions
        };
      });

      // Apply distribution status filter for 'without' (CLIENT-SIDE for now)
      if (filters.distributionStatus === 'without') {
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
    totalCount,
    filters,
    setFilters,
    refreshIndividuals: fetchIndividuals,
    deleteIndividual
  };
}
