import { supabase } from '../lib/supabase';
import { AdditionalMember } from '../types';

export class AdditionalMemberError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AdditionalMemberError';
  }
}

export async function addAdditionalMember(individualId: string, data: AdditionalMember) {
  try {
    const { data: result, error } = await supabase.rpc('add_additional_member', {
      p_individual_id: individualId,
      p_member_data: data
    });

    if (error) {
      throw new AdditionalMemberError('creation-failed', error.message, error);
    }

    return result;
  } catch (error) {
    if (error instanceof AdditionalMemberError) throw error;
    throw new AdditionalMemberError('unexpected', 'An unexpected error occurred', error);
  }
}
