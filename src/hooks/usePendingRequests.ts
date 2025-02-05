import { useState, useCallback, useEffect } from 'react';
import { PendingRequest } from '../types';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function usePendingRequests() {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const { user } = useAuthStore();

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('pending_requests')
        .select(`
          *,
          submitted_by_user:users!pending_requests_submitted_by_fkey(
            first_name,
            last_name
          ),
          reviewed_by_user:users!pending_requests_reviewed_by_fkey(
            first_name,
            last_name
          )
        `)
        .order('submitted_at', { ascending: false });

      // If not admin, only show user's requests
      if (user?.role !== 'admin') {
        query = query.eq('submitted_by', user?.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching pending requests:', error);
        throw error;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error in fetchRequests:', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return {
    requests,
    isLoading,
    refreshRequests: fetchRequests
  };
}
