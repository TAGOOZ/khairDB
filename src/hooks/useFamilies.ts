import { useState, useEffect, useCallback } from 'react';
import { Family } from '../types';
import { supabase } from '../lib/supabase';

interface FiltersState {
  search: string;
}

export function useFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
  });

  const fetchFamilies = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('families')
        .select(`
          *,
          members:family_members!inner(
            role,
            individual:individuals!inner(*)
          ),
          children(*)
        `);

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching families:', error);
        throw error;
      }
      
      // Transform the data to match our expected format
      const transformedFamilies = (data || []).map(family => ({
        ...family,
        members: [
          ...family.members.map((m: any) => ({
            ...m.individual,
            family_role: m.role
          })),
          ...(family.children || []).map((child: any) => ({
            ...child,
            family_role: 'child'
          }))
        ]
      }));

      setFamilies(transformedFamilies);
    } catch (error) {
      console.error('Error fetching families:', error);
      setFamilies([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFamilies();
  }, [fetchFamilies]);

  return { 
    families, 
    isLoading,
    filters,
    setFilters,
    refreshFamilies: fetchFamilies
  };
}
