import { supabase } from '../lib/supabase';
import { Family } from '../types';
import { FamilyFormData, parentRelations, RelationType } from '../schemas/familySchema';
import { logActivity } from './activityLogs';
import { ServiceError } from '../utils/errors';

// Map frontend relation to database role
function relationToRole(relation: RelationType): 'parent' | 'child' {
  return parentRelations.includes(relation) ? 'parent' : 'child';
}

// Map database role to a default relation
function roleToRelation(role: string): RelationType {
  return role === 'parent' ? 'husband' : 'son'; // Default values
}

export async function createFamily(data: FamilyFormData): Promise<Family> {
  try {
    // Validate that there's at least one parent relation
    const hasParent = data.members.some((member) => parentRelations.includes(member.relation));
    if (!hasParent) {
      throw new ServiceError('invalid-members', 'At least one parent is required');
    }

    // Validate that all member IDs exist in individuals table
    const memberIds = data.members.map((m: { id: string }) => m.id);
    const { data: validMembers, error: validationError } = await supabase
      .from('individuals')
      .select('id')
      .in('id', memberIds);

    if (validationError) {
      throw new ServiceError('validation-failed', 'Failed to validate members', validationError);
    }

    const validIds = (validMembers || []).map((m: { id: string }) => m.id);
    const invalidIds = memberIds.filter((id: string) => !validIds.includes(id));
    if (invalidIds.length > 0) {
      throw new ServiceError('invalid-members', `Some members do not exist: ${invalidIds.join(', ')}`);
    }

    // Call RPC transaction - map relation to role for database
    const membersForDb = data.members.map(m => ({
      id: m.id,
      role: relationToRole(m.relation)
    }));

    const { data: family, error: rpcError } = await supabase
      .rpc('create_family_transaction', {
        p_name: data.name,
        p_status: data.status,
        p_district: data.district,
        p_phone: data.phone,
        p_address: data.address,
        p_members: membersForDb
      });

    if (rpcError) {
      console.error('RPC Error creating family:', rpcError);
      throw new ServiceError('creation-failed', 'Failed to create family', rpcError);
    }

    // Fetch the complete family with members and children to match return type expectation
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
      throw new ServiceError('fetch-failed', 'Failed to fetch complete family data', fetchError);
    }

    // Log the activity after successful creation
    await logActivity(
      'create',
      'family',
      family.id,
      data.name,
      { members_count: data.members.length }
    );

    return {
      ...completeFamily,
      members: [
        ...completeFamily.members.map((m: any) => ({
          ...m.individual,
          family_relation: roleToRelation(m.role)
        })),
        ...(completeFamily.children || []).map((child: any) => ({
          ...child,
          family_relation: 'son' as RelationType // children default to son/daughter
        }))
      ]
    };
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function updateFamily(id: string, data: FamilyFormData): Promise<Family> {
  try {
    // Auto-assign first 'other' member as parent if no parent exists
    const hasParent = data.members.some((member) => parentRelations.includes(member.relation));
    if (!hasParent && data.members.length > 0) {
      // Promote first 'other' member to 'husband' (parent) role
      console.warn('Family has no parent, auto-assigning first member as parent');
      data.members[0].relation = 'husband';
    }

    // Validate that all member IDs exist in individuals table
    const memberIds = data.members.map((m: { id: string }) => m.id);
    const { data: validMembers, error: validationError } = await supabase
      .from('individuals')
      .select('id')
      .in('id', memberIds);

    if (validationError) {
      throw new ServiceError('validation-failed', 'Failed to validate members', validationError);
    }

    const validIds = (validMembers || []).map((m: { id: string }) => m.id);
    const invalidMembers = data.members.filter((m: { id: string }) => !validIds.includes(m.id));

    if (invalidMembers.length > 0) {
      // Auto-filter out invalid members
      console.warn('Removing invalid members from family:', invalidMembers.map(m => m.id));
      data.members = data.members.filter((m: { id: string }) => validIds.includes(m.id));
    }

    if (data.members.length === 0) {
      throw new ServiceError('invalid-members', 'Family must have at least one member');
    }

    // Call RPC transaction - map relation to role for database
    const membersForDb = data.members.map(m => ({
      id: m.id,
      role: relationToRole(m.relation)
    }));

    const { data: family, error: rpcError } = await supabase
      .rpc('update_family_transaction', {
        p_id: id,
        p_name: data.name,
        p_status: data.status,
        p_district: data.district,
        p_phone: data.phone,
        p_address: data.address,
        p_members: membersForDb
      });

    if (rpcError) {
      console.error('RPC Error updating family:', rpcError);
      throw new ServiceError('update-failed', 'Failed to update family', rpcError);
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
      throw new ServiceError('fetch-failed', 'Failed to fetch updated family', fetchError);
    }

    // Log the activity
    await logActivity(
      'update',
      'family',
      id,
      data.name,
      { members_count: data.members.length }
    );

    return {
      ...updatedFamily,
      members: [
        ...updatedFamily.members.map((m: any) => ({
          ...m.individual,
          family_relation: m.role === 'parent' ? 'husband' : 'other', // Map role to default relation
          family_role: m.role
        })),
        ...(updatedFamily.children || []).map((child: any) => ({
          ...child,
          family_relation: 'son' as RelationType,
          family_role: 'child'
        }))
      ]
    };
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred', error);
  }
}

export async function deleteFamily(id: string): Promise<void> {
  try {
    const { error: rpcError } = await supabase
      .rpc('delete_family_transaction', { p_id: id });

    if (rpcError) {
      throw new ServiceError('delete-failed', 'Failed to delete family transaction', rpcError);
    }

    // Log the activity
    await logActivity(
      'delete',
      'family',
      id,
      'Family deleted',
      { deleted_family_id: id }
    );
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError('unexpected', 'An unexpected error occurred', error);
  }
}

