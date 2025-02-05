import { useState, useEffect, useCallback } from 'react';
import { Distribution } from '../types';
import { supabase } from '../lib/supabase';

export function useDistributions() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDistributions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('distributions')
        .select(`
          *,
          recipients:distribution_recipients(
            *,
            individual:individuals(*)
          )
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      setDistributions(data || []);
    } catch (error) {
      console.error('Error fetching distributions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistributions();
  }, [fetchDistributions]);

  return { 
    distributions, 
    isLoading,
    refreshDistributions: fetchDistributions
  };
}
