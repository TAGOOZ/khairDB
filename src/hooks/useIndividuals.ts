import { useState, useEffect, useCallback } from 'react';
    import { Individual, NeedCategory, NeedPriority } from '../types';
    import { supabase } from '../lib/supabase';
    
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
              )
            `);
    
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
    
          const { data, error } = await query;
    
          if (error) throw error;
    
          // Apply client-side filters for needs
          let filteredData = data || [];
    
          if (filters.needs.length > 0) {
            filteredData = filteredData.filter(individual => {
              // Individual must match ALL need filters (AND logic)
              return filters.needs.every(needFilter => {
                return individual.needs.some(need => {
                  const matchesCategory = !needFilter.category || need.category === needFilter.category;
                  const matchesPriority = !needFilter.priority || need.priority === needFilter.priority;
                  return matchesCategory && matchesPriority;
                });
              });
            });
          }
    
          // Fetch distributions for all individuals
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
    
          // Fetch needs for all individuals
          const individualsWithNeeds = await Promise.all(
            finalData.map(async (individual) => {
              let needsQuery = supabase
                .from('needs')
                .select('*')
                .eq('individual_id', individual.id);
    
              const { data: needsData, error: needsError } = await needsQuery;
    
              if (needsError) {
                console.error('Error fetching needs for individual:', individual.id, needsError);
                return { ...individual, needs: [] };
              }
    
              return { ...individual, needs: needsData || [] };
            })
          );
    
          setIndividuals(individualsWithNeeds);
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
