import { supabase } from '../lib/supabase';
import { AdditionalMember } from '../types';
import { ServiceError } from '../utils/errors';

export async function addAdditionalMember(individualId: string, data: AdditionalMember) {
  try {
    const { data: result, error } = await supabase.rpc('add_additional_member', {
      p_individual_id: individualId,
      p_member_data: data
    });

    if (error) {
      throw new ServiceError('creation-failed', error.message, error);
    }

    return result;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred', error);
  }
}
