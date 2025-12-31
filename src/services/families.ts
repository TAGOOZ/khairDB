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
    const hasParent = data.members.some((member: { role: string }) => member.role === 'parent');
    if (!hasParent) {
      throw new FamilyError('invalid-members', 'At least one parent is required');
    }

    // Validate that all member IDs exist in individuals table
    const memberIds = data.members.map((m: { id: string }) => m.id);
    const { data: validMembers, error: validationError } = await supabase
      .from('individuals')
      .select('id')
      .in('id', memberIds);

    if (validationError) {
      throw new FamilyError('validation-failed', 'Failed to validate members', validationError);
    }

    const validIds = (validMembers || []).map((m: { id: string }) => m.id);
    const invalidIds = memberIds.filter((id: string) => !validIds.includes(id));
    if (invalidIds.length > 0) {
      throw new FamilyError('invalid-members', `Some members do not exist: ${invalidIds.join(', ')}`);
    }

    // Create family
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
    const memberInserts = data.members.map((member: { id: string; role: string }) => ({
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


    // Fetch the complete family with members and children
    const { data: completeFamily, error: fetchError } = await supabase
      .from('families')
      .select(`
        *,
        members:family_members(
          role,
          individual:individuals(*)
        ),
        children(*)
      `)
      .eq('id', family.id)
      .single();

    if (fetchError) {
      throw new FamilyError('fetch-failed', 'Failed to fetch complete family data', fetchError);
    }

    return {
      ...completeFamily,
      members: [
        ...completeFamily.members.map((m: any) => ({
          ...m.individual,
          family_role: m.role
        })),
        ...(completeFamily.children || []).map((child: any) => ({
          ...child,
          family_role: 'child'
        }))
      ]
    };
  } catch (error) {
    if (error instanceof FamilyError) throw error;
    throw new FamilyError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function updateFamily(id: string, data: FamilyFormData): Promise<Family> {
  try {
    // Validate that there's at least one parent
    const hasParent = data.members.some((member: { role: string }) => member.role === 'parent');
    if (!hasParent) {
      throw new FamilyError('invalid-members', 'At least one parent is required');
    }

    // Validate that all member IDs exist in individuals table
    const memberIds = data.members.map((m: { id: string }) => m.id);
    const { data: validMembers, error: validationError } = await supabase
      .from('individuals')
      .select('id')
      .in('id', memberIds);

    if (validationError) {
      throw new FamilyError('validation-failed', 'Failed to validate members', validationError);
    }

    const validIds = (validMembers || []).map((m: { id: string }) => m.id);
    const invalidIds = memberIds.filter((memberId: string) => !validIds.includes(memberId));
    if (invalidIds.length > 0) {
      throw new FamilyError('invalid-members', `Some members do not exist: ${invalidIds.join(', ')}`);
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
    const memberInserts = data.members.map((member: { id: string; role: string }) => ({
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


    // Fetch updated family with members and children
    const { data: updatedFamily, error: fetchError } = await supabase
      .from('families')
      .select(`
        *,
        members:family_members(
          role,
          individual:individuals(*)
        ),
        children(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new FamilyError('fetch-failed', 'Failed to fetch updated family', fetchError);
    }

    return {
      ...updatedFamily,
      members: [
        ...updatedFamily.members.map((m: any) => ({
          ...m.individual,
          family_role: m.role
        })),
        ...(updatedFamily.children || []).map((child: any) => ({
          ...child,
          family_role: 'child'
        }))
      ]
    };
  } catch (error) {
    if (error instanceof FamilyError) throw error;
    throw new FamilyError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function deleteFamily(id: string): Promise<void> {
  try {
    // First, set family_id to null for all individuals in this family
    // This prevents orphaned records with invalid foreign keys
    const { error: individualsError } = await supabase
      .from('individuals')
      .update({ family_id: null })
      .eq('family_id', id);

    if (individualsError) {
      throw new FamilyError('delete-failed', 'Failed to unlink individuals from family', individualsError);
    }

    // Delete children
    const { error: childrenError } = await supabase
      .from('children')
      .delete()
      .eq('family_id', id);

    if (childrenError) {
      throw new FamilyError('delete-failed', 'Failed to delete family children', childrenError);
    }

    // Delete family_members (should cascade, but be explicit)
    const { error: membersError } = await supabase
      .from('family_members')
      .delete()
      .eq('family_id', id);

    if (membersError) {
      throw new FamilyError('delete-failed', 'Failed to delete family members', membersError);
    }

    // Then delete the family
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

