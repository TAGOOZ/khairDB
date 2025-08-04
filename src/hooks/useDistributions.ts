import { useState, useEffect, useCallback } from 'react';
import { Distribution } from '../types';
import { supabase } from '../lib/supabase';

export function useDistributions() {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDistributions = useCallback(async () => {
    setIsLoading(true);
    try {
      // First get all distributions
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('distributions')
        .select('*')
        .order('date', { ascending: false });

      if (distributionsError) throw distributionsError;

      // Then for each distribution, fetch its recipients separately
      if (distributionsData) {
        const distributionsWithRecipients = await Promise.all(
          distributionsData.map(async (distribution) => {
            // Get all recipients for this distribution
            const { data: recipientsData, error: recipientsError } = await supabase
              .from('distribution_recipients')
              .select('*')
              .eq('distribution_id', distribution.id);

            if (recipientsError) throw recipientsError;
            
            // For each recipient, fetch the individual or child data separately
            const recipientsWithDetails = await Promise.all(
              (recipientsData || []).map(async (recipient) => {
                let individual = null;
                let child = null;
                
                // If recipient has individual_id, fetch individual data
                if (recipient.individual_id) {
                  const { data: individualData } = await supabase
                    .from('individuals')
                    .select('*')
                    .eq('id', recipient.individual_id)
                    .single();
                  individual = individualData;
                }
                
                // If recipient has child_id, fetch child data
                if (recipient.child_id) {
                  const { data: childData } = await supabase
                    .from('children')
                    .select('*')
                    .eq('id', recipient.child_id)
                    .single();
                  child = childData;
                }
                
                return {
                  ...recipient,
                  individual,
                  child
                };
              })
            );
            
            return {
              ...distribution,
              recipients: recipientsWithDetails
            };
          })
        );
        
        setDistributions(distributionsWithRecipients || []);
      } else {
        setDistributions([]);
      }
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
