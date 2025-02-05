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
    
        // Maintain proper stack trace (only for V8 environments like Node.js)
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
          .insert([
            {
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
            }
          ])
          .select()
          .single();
    
        if (error) {
          throw new IndividualError('creation-failed', error.message, error);
        }
    
        const needsInserts = (data.needs || []).map((need) => ({
          individual_id: individual.id,
          category: need.category,
          priority: need.priority,
          description: need.description,
          status: 'pending'
        }));
    
        // Insert needs if any
        if (needsInserts.length > 0) {
          const { error: needsError } = await supabase
            .from('needs')
            .insert(needsInserts);
    
          if (needsError) {
            throw new IndividualError(
              'creation-failed',
              needsError.message || 'Failed to insert needs after creation',
              needsError
            );
          }
        }
    
        return individual;
      } catch (error) {
        if (error instanceof IndividualError) {
          throw error;
        }
        console.error('Unexpected error during individual creation:', error);
        throw new IndividualError('unexpected', 'An unexpected error occurred', error);
      }
    }
    
    export async function updateIndividual(id: string, data: IndividualFormData) {
      try {
        // Check if ID number exists for other individuals
        const { data: existingIndividual } = await supabase
          .from('individuals')
          .select('id')
          .eq('id_number', data.id_number)
          .neq('id', id)
          .single();
    
        if (existingIndividual) {
          throw new IndividualError('duplicate-id', 'An individual with this ID number already exists');
        }
    
        // Remove needs from the data object to prevent it from being included in the update
        const { needs, ...updateData } = data;
    
        const { data: individual, error } = await supabase
          .from('individuals')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();
    
        if (error) {
          throw new IndividualError('update-failed', error.message, error);
        }
    
        // Delete existing needs
        await supabase
          .from('needs')
          .delete()
          .eq('individual_id', id);
    
        // Insert new needs
        const needsInserts = (data.needs || []).map((need) => ({
          individual_id: id,
          category: need.category,
          priority: need.priority,
          description: need.description,
          status: 'pending'
        }));
    
        if (needsInserts.length > 0) {
          const { error: needsError } = await supabase
            .from('needs')
            .insert(needsInserts);
    
          if (needsError) {
            throw new IndividualError(
              'update-failed',
              needsError.message || 'Failed to insert needs after update',
              needsError
            );
          }
        }
    
        return individual;
      } catch (error) {
        if (error instanceof IndividualError) {
          throw error;
        }
        console.error('Unexpected error during individual update:', error);
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
          .eq('id_number', idNumber)
          .single();
    
        if (error && error.code !== 'PGRST116') {
          console.error('Database error checking ID:', error);
          throw new IndividualError('id-check-failed', 'Failed to check ID number');
        }
    
        return !!data;
      } catch (error) {
        console.error('Error checking ID number:', error);
        throw new IndividualError('id-check-failed', 'Failed to check ID number', error);
      }
    }
