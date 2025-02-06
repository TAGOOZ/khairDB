import { supabase } from '../lib/supabase';
import { IndividualFormData } from '../schemas/individualSchema';
import { IndividualError } from '../types/errors';

export class IndividualError extends Error {
  code: string;
  originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'IndividualError';
    this.code = code;
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export async function createIndividual(data: IndividualFormData) {
  try {
    // Check if ID number exists
    const { data: existingIndividual } = await supabase
      .from('individuals')
      .select('id')
      .eq('id_number', data.id_number)
      .single();

    if (existingIndividual) {
      throw new IndividualError('duplicate-id', 'An individual with this ID number already exists');
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data: individual, error } = await supabase
      .from('individuals')
      .insert([{
        first_name: data.first_name,
        last_name: data.last_name,
        id_number: data.id_number,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        marital_status: data.marital_status,
        phone: data.phone,
        address: data.address,
        family_id: data.family_id === '' ? null : data.family_id,
        district: data.district,
        description: data.description,
        job: data.job,
        employment_status: data.employment_status,
        salary: data.salary,
        created_by: user?.id,
        list_status: data.list_status
      }])
      .select()
      .single();

    if (error) {
      throw new IndividualError('creation-failed', error.message, error);
    }

    if (data.needs && data.needs.length > 0) {
      const needsInserts = data.needs.map(need => ({
        individual_id: individual.id,
        category: need.category,
        priority: need.priority,
        description: need.description,
        status: 'pending'
      }));

      const { error: needsError } = await supabase
        .from('needs')
        .insert(needsInserts);

      if (needsError) {
        throw new IndividualError('creation-failed', 'Failed to insert needs', needsError);
      }
    }

    return individual;
  } catch (error) {
    if (error instanceof IndividualError) throw error;
    throw new IndividualError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function updateIndividual(id: string, data: IndividualFormData) {
  try {
    // Check for duplicate ID number
    const { data: existingIndividuals, error: checkError } = await supabase
      .from('individuals')
      .select('id')
      .eq('id_number', data.id_number)
      .neq('id', id);

    if (!checkError && existingIndividuals && existingIndividuals.length > 0) {
      throw new IndividualError('duplicate-id', 'An individual with this ID number already exists');
    }

    // First update the individual's basic information
    const { needs, ...updateData } = data;
    const { data: individual, error: updateError } = await supabase
      .from('individuals')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      throw new IndividualError('update-failed', 'Failed to update individual', updateError);
    }

    // Then handle needs separately
    try {
      // First delete existing needs
      const { error: deleteError } = await supabase
        .from('needs')
        .delete()
        .eq('individual_id', id);

      if (deleteError) {
        throw new IndividualError('update-failed', 'Failed to delete existing needs', deleteError);
      }

      // Then insert new needs if any
      if (needs && needs.length > 0) {
        const needsInserts = needs.map(need => ({
          individual_id: id,
          category: need.category,
          priority: need.priority,
          description: need.description,
          status: need.status || 'pending'
        }));

        const { error: insertError } = await supabase
          .from('needs')
          .insert(needsInserts);

        if (insertError) {
          throw new IndividualError('update-failed', 'Failed to insert new needs', insertError);
        }
      }
    } catch (needsError) {
      throw new IndividualError('update-failed', 'Failed to update needs', needsError);
    }

    return individual;
  } catch (error) {
    if (error instanceof IndividualError) throw error;
    throw new IndividualError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function checkIdNumberExists(idNumber: string): Promise<boolean> {
  try {
    if (!idNumber || idNumber.length !== 14) {
      return false;
    }

    const { data, error } = await supabase
      .from('individuals')
      .select('id')
      .eq('id_number', idNumber);

    if (error) {
      throw new IndividualError('id-check-failed', 'Failed to check ID number', error);
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking ID number:', error);
    throw new IndividualError('id-check-failed', 'Failed to check ID number', error);
  }
}