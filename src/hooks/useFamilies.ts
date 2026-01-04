import { useState, useEffect, useCallback } from 'react';
import { Family } from '../types';
import { supabase } from '../lib/supabase';

interface FiltersState {
  search: string;
  page: number;
  perPage: number;
}

export function useFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    page: 1,
    perPage: 50
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
        `, { count: 'exact' });

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Pagination
      const from = (filters.page - 1) * filters.perPage;
      const to = from + filters.perPage - 1;
      query = query.range(from, to).order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching families:', error);
        throw error;
      }

      setTotalCount(count || 0);

      // Transform the data to match our expected format
      const transformedFamilies = (data || []).map(family => ({
        ...family,
        members: [
          ...family.members.map((m: any) => ({
            ...m.individual,
            family_relation: m.role === 'parent' ? 'husband' : 'other', // Map role to default relation
            family_role: m.role // Keep for backward compatibility
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
    totalCount,
    filters,
    setFilters,
    refreshFamilies: fetchFamilies
  };
}
