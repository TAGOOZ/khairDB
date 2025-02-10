import { supabase } from '../lib/supabase';
import { IndividualFormData } from '../schemas/individualSchema';

export class IndividualError extends Error {
  code: string;
  originalError?: any;

  constructor(code: string, message: string, originalError?: any) {
    super(message);
    this.name = 'IndividualError';
    this.code = code;
    this.originalError = originalError;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export async function createIndividual(data: IndividualFormData) {
  try {
    console.log('Starting individual creation with data:', {
      ...data,
      id_number: '***',
      phone: '***'
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new IndividualError('auth-error', 'User not authenticated');

    console.log('Authenticated user:', user.id);

    // Check if ID number exists
    const { data: existingIndividual, error: checkError } = await supabase
      .from('individuals')
      .select('id')
      .eq('id_number', data.id_number)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing individual:', checkError);
      throw new IndividualError('check-failed', 'Failed to check ID number', checkError);
    }

    if (existingIndividual) {
      throw new IndividualError('duplicate-id', 'An individual with this ID number already exists');
    }

    // Create new family if needed
    let familyId = data.family_id;
    if (!familyId && (data.new_family_name || (data.children && data.children.length > 0))) {
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: data.new_family_name || `${data.last_name} Family`,
          status: 'green',
          district: data.district,
          phone: data.phone,
          address: data.address
        }])
        .select()
        .single();

      if (familyError) {
        throw new IndividualError('family-creation-failed', 'Failed to create family', familyError);
      }

      familyId = newFamily.id;
    }

    // Create individual
    const { data: newIndividual, error: individualError } = await supabase
      .from('individuals')
      .insert([{
        first_name: data.first_name,
        last_name: data.last_name,
        id_number: data.id_number,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        marital_status: data.marital_status,
        phone: data.phone || null,
        address: data.address || null,
        family_id: familyId,
        district: data.district,
        description: data.description || null,
        job: data.job || null,
        employment_status: data.employment_status,
        salary: data.salary || null,
        list_status: data.list_status || 'whitelist',
        created_by: user.id
      }])
      .select()
      .single();

    if (individualError) {
      // If individual creation fails and we created a new family, clean up
      if (familyId && !data.family_id) {
        await supabase.from('families').delete().eq('id', familyId);
      }
      throw new IndividualError('creation-failed', 'Failed to create individual', individualError);
    }

    // Add individual to family_members if family exists
    if (familyId) {
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          individual_id: newIndividual.id,
          role: 'parent'
        }]);

      if (memberError) {
        console.error('Error adding family member:', memberError);
        // Clean up if adding parent to family_members fails
        await supabase.from('individuals').delete().eq('id', newIndividual.id);
        if (!data.family_id) {
          await supabase.from('families').delete().eq('id', familyId);
        }
        throw new IndividualError('family-member-creation-failed', 'Failed to add individual as parent', memberError);
      }
    }

    // Insert children if any
    if (data.children && data.children.length > 0 && familyId) {
      const childPromises = data.children.map(async (child) => {
        const { data: newChild, error: childError } = await supabase
          .from('children')
          .insert([{
            first_name: child.first_name,
            last_name: child.last_name,
            date_of_birth: child.date_of_birth,
            gender: child.gender === 'male' ? 'boy' : 'girl',
            school_stage: child.school_stage,
            description: child.description || null,
            parent_id: newIndividual.id,
            family_id: familyId
          }])
          .select()
          .single();

        if (childError) {
          throw new IndividualError('child-creation-failed', 'Failed to create child', childError);
        }

        // Add child to family_members
        const { error: childMemberError } = await supabase
          .from('family_members')
          .insert([{
            family_id: familyId,
            individual_id: newChild.id,
            role: 'child'
          }]);

        if (childMemberError) {
          throw new IndividualError('child-member-creation-failed', 'Failed to add child as family member', childMemberError);
        }

        return newChild;
      });

      try {
        await Promise.all(childPromises);
      } catch (error) {
        // Clean up on child creation failure
        await supabase.from('children').delete().eq('parent_id', newIndividual.id);
        await supabase.from('family_members').delete().eq('individual_id', newIndividual.id);
        await supabase.from('individuals').delete().eq('id', newIndividual.id);
        if (!data.family_id) {
          await supabase.from('families').delete().eq('id', familyId);
        }
        throw error;
      }
    }

    return newIndividual.id;
  } catch (error) {
    if (error instanceof IndividualError) {
      throw error;
    }
    
    console.error('Unexpected error creating individual:', error);
    throw new IndividualError(
      'unexpected',
      'An unexpected error occurred while creating the individual',
      error
    );
  }
}

export async function updateIndividual(id: string, data: IndividualFormData) {
  try {
    // Check for duplicate ID number
    const { data: existingIndividuals, error: checkError } = await supabase
      .from('individuals')
      .select('id')
      .eq('id_number', data.id_number)
      .neq('id', id)
      .maybeSingle();

    if (checkError) {
      throw new IndividualError('check-failed', 'Failed to check ID number', checkError);
    }

    if (existingIndividuals) {
      throw new IndividualError('duplicate-id', 'An individual with this ID number already exists');
    }

    // Create new family if needed
    let familyId = data.family_id;
    if (!familyId && data.new_family_name) {
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: data.new_family_name,
          status: 'green',
          district: data.district,
          phone: data.phone,
          address: data.address
        }])
        .select()
        .single();

      if (familyError) {
        throw new IndividualError('family-creation-failed', 'Failed to create family', familyError);
      }

      familyId = newFamily.id;
    }

    // Update individual
    const { error: updateError } = await supabase
      .from('individuals')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        id_number: data.id_number,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        marital_status: data.marital_status,
        phone: data.phone || null,
        address: data.address || null,
        family_id: familyId,
        district: data.district,
        description: data.description || null,
        job: data.job || null,
        employment_status: data.employment_status,
        salary: data.salary || null,
        list_status: data.list_status || 'whitelist',
        additional_members: data.additional_members || []
      })
      .eq('id', id);

    if (updateError) {
      throw new IndividualError('update-failed', 'Failed to update individual', updateError);
    }

    // Update family membership if family changed
    if (familyId) {
      // Remove from old family if exists
      await supabase
        .from('family_members')
        .delete()
        .eq('individual_id', id);

      // Add to new family
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          individual_id: id,
          role: 'parent'
        }]);

      if (memberError) {
        throw new IndividualError('family-member-update-failed', 'Failed to update family membership', memberError);
      }
    }

    // Update children
    if (data.children && data.children.length > 0 && familyId) {
      // First delete existing children
      await supabase
        .from('children')
        .delete()
        .eq('parent_id', id);

      // Then insert new children
      const childPromises = data.children.map(async (child) => {
        const { data: newChild, error: childError } = await supabase
          .from('children')
          .insert([{
            first_name: child.first_name,
            last_name: child.last_name,
            date_of_birth: child.date_of_birth,
            gender: child.gender === 'male' ? 'boy' : 'girl',
            school_stage: child.school_stage,
            description: child.description || null,
            parent_id: id,
            family_id: familyId
          }])
          .select()
          .single();

        if (childError) {
          throw new IndividualError('child-update-failed', 'Failed to update child', childError);
        }

        // Add child to family_members
        const { error: childMemberError } = await supabase
          .from('family_members')
          .insert([{
            family_id: familyId,
            individual_id: newChild.id,
            role: 'child'
          }]);

        if (childMemberError) {
          throw new IndividualError('child-member-update-failed', 'Failed to update child family membership', childMemberError);
        }

        return newChild;
      });

      try {
        await Promise.all(childPromises);
      } catch (error) {
        throw error;
      }
    }

    return id;
  } catch (error) {
    if (error instanceof IndividualError) {
      throw error;
    }
    throw new IndividualError('unexpected', 'An unexpected error occurred while updating the individual', error);
  }
}

export async function deleteIndividual(id: string) {
  try {
    const { error } = await supabase
      .from('individuals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new IndividualError('deletion-failed', 'Failed to delete individual', error);
    }
  } catch (error) {
    if (error instanceof IndividualError) {
      throw error;
    }
    throw new IndividualError('unexpected', 'An unexpected error occurred while deleting the individual', error);
  }
}