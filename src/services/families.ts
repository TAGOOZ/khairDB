import { supabase } from '../lib/supabase';
import { Family } from '../types';
import { FamilyFormData } from '../schemas/familySchema';

export class FamilyError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'FamilyError';
  }
}

export async function createFamily(data: FamilyFormData): Promise<Family> {
  try {
    // Validate that there's at least one parent
    const hasParent = data.members.some(member => member.role === 'parent');
    if (!hasParent) {
      throw new FamilyError('invalid-members', 'At least one parent is required');
    }

    // Start a Supabase transaction
    const { data: family, error: familyError } = await supabase.rpc(
      'create_family_with_members',
      {
        p_family_data: {
          name: data.name,
          status: data.status,
          district: data.district,
          phone: data.phone,
          address: data.address
        },
        p_member_data: data.members
      }
    );

    if (familyError) {
      throw new FamilyError('creation-failed', 'Failed to create family', familyError);
    }

    // Fetch the complete family with members
    const { data: completeFamily, error: fetchError } = await supabase
      .from('families')
      .select(`
        *,
        members:family_members(
          role,
          individual:individuals(*)
        )
      `)
      .eq('id', family.id)
      .single();

    if (fetchError) {
      throw new FamilyError('fetch-failed', 'Failed to fetch complete family data', fetchError);
    }

    return {
      ...completeFamily,
      members: completeFamily.members.map((m: any) => ({
        ...m.individual,
        family_role: m.role
      }))
    };
  } catch (error) {
    if (error instanceof FamilyError) throw error;
    throw new FamilyError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function updateFamily(id: string, data: FamilyFormData): Promise<Family> {
  try {
    // Validate that there's at least one parent
    const hasParent = data.members.some(member => member.role === 'parent');
    if (!hasParent) {
      throw new FamilyError('invalid-members', 'At least one parent is required');
    }

    // Update using stored procedure
    const { data: family, error: updateError } = await supabase.rpc(
      'update_family_with_members',
      {
        p_family_id: id,
        p_family_data: {
          name: data.name,
          status: data.status,
          district: data.district,
          phone: data.phone,
          address: data.address
        },
        p_member_data: data.members
      }
    );

    if (updateError) {
      throw new FamilyError('update-failed', 'Failed to update family', updateError);
    }

    // Fetch the complete updated family
    const { data: completeFamily, error: fetchError } = await supabase
      .from('families')
      .select(`
        *,
        members:family_members(
          role,
          individual:individuals(*)
        )
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new FamilyError('fetch-failed', 'Failed to fetch updated family', fetchError);
    }

    return {
      ...completeFamily,
      members: completeFamily.members.map((m: any) => ({
        ...m.individual,
        family_role: m.role
      }))
    };
  } catch (error) {
    if (error instanceof FamilyError) throw error;
    throw new FamilyError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function deleteFamily(id: string): Promise<void> {
  try {
    const { error: deleteError } = await supabase
      .from('families')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw new FamilyError('delete-failed', 'Failed to delete family', deleteError);
    }
  } catch (error) {
    if (error instanceof FamilyError) throw error;
    throw new FamilyError('unexpected', 'An unexpected error occurred', error);
  }
}
