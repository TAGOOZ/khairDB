import { supabase } from '../lib/supabase';

export type Hashtag = {
  id: string;
  name: string;
  count?: number;
};

/**
 * Fetch all available hashtags with their counts
 */
export async function getHashtagCounts(): Promise<Hashtag[]> {
  try {
    const { data, error } = await supabase.rpc('get_hashtag_counts');
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching hashtag counts:', error);
    return [];
  }
}

/**
 * Fetch hashtags for a specific individual
 */
export async function getIndividualHashtags(individualId: string): Promise<Hashtag[]> {
  try {
    const { data, error } = await supabase.rpc('get_individual_hashtags', {
      p_individual_id: individualId
    });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching hashtags for individual ${individualId}:`, error);
    return [];
  }
}

/**
 * Add a hashtag to multiple individuals
 */
export async function addHashtagToAll(hashtagName: string, individualIds: string[]): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('add_hashtag_to_all', {
      p_hashtag_name: hashtagName,
      p_individual_ids: individualIds
    });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error adding hashtag to individuals:', error);
    return [];
  }
}

/**
 * Remove a hashtag from multiple individuals
 */
export async function removeHashtagFromAll(hashtagName: string, individualIds: string[]): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('remove_hashtag_from_all', {
      p_hashtag_name: hashtagName,
      p_individual_ids: individualIds
    });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error removing hashtag from individuals:', error);
    return [];
  }
}

/**
 * Add a new hashtag to the system
 */
export async function createHashtag(name: string): Promise<Hashtag | null> {
  try {
    const { data, error } = await supabase
      .from('hashtags')
      .insert([{ name }])
      .select()
      .single();
      
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating hashtag:', error);
    return null;
  }
} 