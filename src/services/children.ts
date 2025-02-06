import { supabase } from '../lib/supabase';
import { Child } from '../types';

export class ChildError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ChildError';
  }
}

export async function addChild(parentId: string, data: Omit<Child, 'id' | 'created_by' | 'created_at' | 'updated_at'>) {
  try {
    const { data: result, error } = await supabase.rpc('add_child_with_family', {
      p_child_data: {
        first_name: data.first_name,
        last_name: data.last_name,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        school_stage: data.school_stage,
        description: data.description
      },
      p_parent_id: parentId
    });

    if (error) {
      throw new ChildError('creation-failed', error.message, error);
    }

    return result;
  } catch (error) {
    if (error instanceof ChildError) throw error;
    throw new ChildError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function updateChild(childId: string, data: Partial<Child>) {
  try {
    const { error } = await supabase
      .from('children')
      .update(data)
      .eq('id', childId);

    if (error) {
      throw new ChildError('update-failed', error.message, error);
    }
  } catch (error) {
    if (error instanceof ChildError) throw error;
    throw new ChildError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function deleteChild(childId: string) {
  try {
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (error) {
      throw new ChildError('deletion-failed', error.message, error);
    }
  } catch (error) {
    if (error instanceof ChildError) throw error;
    throw new ChildError('unexpected', 'An unexpected error occurred', error);
  }
}