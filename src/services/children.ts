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
    // First verify the child exists and get parent info
    const { data: child, error: fetchError } = await supabase
      .from('children')
      .select('id, parent_id, family_id')
      .eq('id', childId)
      .single();

    if (fetchError) {
      throw new ChildError('not-found', 'Child not found', fetchError);
    }

    if (!child) {
      throw new ChildError('not-found', 'Child not found');
    }

    // Delete the child
    const { error: deleteError } = await supabase
      .from('children')
      .delete()
      .eq('id', childId);

    if (deleteError) {
      throw new ChildError('deletion-failed', 'Failed to delete child', deleteError);
    }
  } catch (error) {
    if (error instanceof ChildError) throw error;
    throw new ChildError('unexpected', 'An unexpected error occurred while deleting the child', error);
  }
}
