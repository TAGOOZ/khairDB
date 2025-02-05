import { supabase } from '../lib/supabase';
import { Need } from '../types';
import { NeedFormData } from '../schemas/needSchema';

export class NeedError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'NeedError';
  }
}

export async function createNeed(individualId: string, data: NeedFormData): Promise<Need> {
  try {
    const { data: need, error } = await supabase
      .from('needs')
      .insert([{
        ...data,
        individual_id: individualId,
      }])
      .select()
      .single();

    if (error) {
      throw new NeedError(
        'creation-failed',
        'Failed to create need',
        error
      );
    }

    if (!need) {
      throw new NeedError(
        'no-data',
        'No data returned after creating need'
      );
    }

    return need;
  } catch (error) {
    if (error instanceof NeedError) {
      throw error;
    }
    
    console.error('Error creating need:', error);
    throw new NeedError(
      'unexpected',
      'An unexpected error occurred while creating the need',
      error
    );
  }
}
