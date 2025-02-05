import { useState, useEffect } from 'react';
import { Need, NeedCategory } from '../types';
import { supabase } from '../lib/supabase';

interface FiltersState {
  search: string;
  category: NeedCategory | '';
  status: 'pending' | 'in_progress' | 'completed' | '';
  priority: 'low' | 'medium' | 'high' | 'urgent' | '';
}

export function useNeeds() {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    category: '',
    status: '',
    priority: '',
  });

  useEffect(() => {
    async function fetchNeeds() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('needs')
          .select(`
            *,
            individuals (
              first_name,
              last_name
            )
          `);

        if (filters.search) {
          query = query.ilike('description', `%${filters.search}%`);
        }

        if (filters.category) {
          query = query.eq('category', filters.category);
        }

        if (filters.status) {
          query = query.eq('status', filters.status);
        }

        if (filters.priority) {
          query = query.eq('priority', filters.priority);
        }

        const { data, error } = await query;

        if (error) throw error;
        setNeeds(data);
      } catch (error) {
        console.error('Error fetching needs:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNeeds();
  }, [filters]);

  return { needs, isLoading, filters, setFilters };
}
