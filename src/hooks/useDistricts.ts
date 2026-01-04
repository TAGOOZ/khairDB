import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface District {
    id: string;
    name: string;
}

export function useDistricts() {
    const [districts, setDistricts] = useState<District[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const { data, error } = await supabase
                    .from('districts')
                    .select('*')
                    .order('name');

                if (error) throw error;
                setDistricts(data || []);
            } catch (err) {
                console.error('Error fetching districts:', err);
                setError(err instanceof Error ? err : new Error('Failed to fetch districts'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchDistricts();
    }, []);

    return { districts, isLoading, error };
}
