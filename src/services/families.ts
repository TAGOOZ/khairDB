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

    // Start a transaction
    const { data: family, error: familyError } = await supabase
      .from('families')
      .insert([{
        name: data.name,
        status: data.status,
        district: data.district,
        phone: data.phone,
        address: data.address
      }])
      .select()
      .single();

    if (familyError) {
      throw new FamilyError('creation-failed', 'Failed to create family', familyError);
    }

    // Add members to family_members table
    const memberInserts = data.members.map(member => ({
      family_id: family.id,
      individual_id: member.id,
      role: member.role
    }));

    const { error: membersError } = await supabase
      .from('family_members')
      .insert(memberInserts);

    if (membersError) {
      // Rollback family creation if member insertion fails
      await supabase.from('families').delete().eq('id', family.id);
      throw new FamilyError('member-creation-failed', 'Failed to add family members', membersError);
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

    // Update family
    const { error: updateError } = await supabase
      .from('families')
      .update({
        name: data.name,
        status: data.status,
        district: data.district,
        phone: data.phone,
        address: data.address
      })
      .eq('id', id);

    if (updateError) {
      throw new FamilyError('update-failed', 'Failed to update family', updateError);
    }

    // Delete existing members
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', id);

    if (deleteError) {
      throw new FamilyError('member-deletion-failed', 'Failed to update family members', deleteError);
    }

    // Add new members
    const memberInserts = data.members.map(member => ({
      family_id: id,
      individual_id: member.id,
      role: member.role
    }));

    const { error: membersError } = await supabase
      .from('family_members')
      .insert(memberInserts);

    if (membersError) {
      throw new FamilyError('member-update-failed', 'Failed to update family members', membersError);
    }

    // Fetch updated family
    const { data: updatedFamily, error: fetchError } = await supabase
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
      ...updatedFamily,
      members: updatedFamily.members.map((m: any) => ({
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
