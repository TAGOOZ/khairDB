import { supabase } from '../lib/supabase';
import { Distribution } from '../types';
import { DistributionFormData } from '../schemas/distributionSchema';

export class DistributionError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DistributionError';
  }
}

/**
 * Get all family members for distribution including additional members
 */
export async function getFamilyMembersForDistribution(familyId: string) {
  try {
    // Get main family individuals
    const { data: individuals, error: individualsError } = await supabase
      .from('individuals')
      .select(`
        id,
        first_name,
        last_name,
        id_number,
        gender,
        additional_members,
        date_of_birth
      `)
      .eq('family_id', familyId);

    if (individualsError) throw individualsError;

    // Get children
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select(`
        id,
        first_name,
        last_name,
        gender,
        date_of_birth
      `)
      .eq('family_id', familyId);

    if (childrenError) throw childrenError;

    // Extract additional members and format them
    const additionalMembers = individuals.reduce((acc: any[], individual: any) => {
      if (individual.additional_members && Array.isArray(individual.additional_members)) {
        const formattedMembers = individual.additional_members.map((member: any, index: number) => ({
          id: `additional_${individual.id}_${index}`, // Generate unique ID
          first_name: member.name?.split(' ')[0] || member.name || 'Unknown',
          last_name: member.name?.split(' ').slice(1).join(' ') || '',
          gender: member.gender || 'unknown',
          type: 'additional_member',
          relation: member.relation || 'other',
          date_of_birth: member.date_of_birth,
          job_title: member.job_title,
          phone_number: member.phone_number,
          parent_individual_id: individual.id,
          parent_name: `${individual.first_name} ${individual.last_name}`
        }));
        acc.push(...formattedMembers);
      }
      return acc;
    }, []);

    return {
      individuals: individuals || [],
      children: children || [],
      additional_members: additionalMembers
    };
  } catch (error) {
    console.error('Error fetching family members for distribution:', error);
    throw new DistributionError(
      'fetch-failed',
      'Failed to fetch family members',
      error
    );
  }
}

export async function createDistribution(data: DistributionFormData): Promise<Distribution> {
  try {
    // Validate the data exists
    if (!data.description || !data.date || !data.recipients || !data.aid_type) {
      throw new DistributionError(
        'invalid-data',
        'Missing required fields'
      );
    }

    // Format recipients to handle additional members
    const formattedRecipients = data.recipients.map(recipient => {
      // If it's an additional member, store the reference but keep the original ID for processing
      if (recipient.individual_id.toString().startsWith('additional_')) {
        const [, parentIndividualId, memberIndex] = recipient.individual_id.toString().split('_');
        return {
          ...recipient,
          original_individual_id: recipient.individual_id, // Keep original for processing
          individual_id: null, // Set to null for database
          additional_member_ref: {
            parent_individual_id: parentIndividualId,
            member_index: parseInt(memberIndex),
            type: 'additional_member'
          }
        };
      }

      return {
        ...recipient,
        original_individual_id: recipient.individual_id,
        individual_id: recipient.individual_id,
        additional_member_ref: null
      };
    });

    // Calculate total quantity if not provided
    const totalQuantity = data.quantity || data.recipients.reduce((sum, recipient) => sum + recipient.quantity_received, 0);

    console.log('Distribution creation debug:', {
      totalRecipients: data.recipients.length,
      totalQuantity,
      recipients: data.recipients.map(r => ({
        id: r.individual_id,
        quantity: r.quantity_received,
        isAdditional: r.individual_id.toString().startsWith('additional_')
      }))
    });

    // First, create the distribution record
    const { data: distribution, error } = await supabase
      .from('distributions')
      .insert({
        description: data.description,
        date: data.date,
        aid_type: data.aid_type,
        quantity: totalQuantity,
        status: 'in_progress',
        value: data.value,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error creating distribution:', error);
      throw new DistributionError(
        'db-error',
        'Failed to create distribution',
        error
      );
    }

    // Then, create the recipient records
    const recipientsToInsert = [];

    // Group recipients by individual, aggregating additional members
    const recipientGroups = new Map();
    const additionalMembersToProcess = [];

    // First pass: Process main individuals and children, collect additional members
    for (const recipient of formattedRecipients) {
      const isAdditionalMember = recipient.original_individual_id && recipient.original_individual_id.toString().startsWith('additional_');

      if (isAdditionalMember) {
        // Store additional member for second pass
        additionalMembersToProcess.push(recipient);
        continue;
      }

      if (!recipient.individual_id) {
        continue; // Skip null IDs
      }

      // Check if this ID exists in the children table
      const { data: childData } = await supabase
        .from('children')
        .select('id')
        .eq('id', recipient.individual_id)
        .single();

      const individualId = recipient.individual_id;

      if (recipientGroups.has(individualId)) {
        // Add to existing entry
        recipientGroups.get(individualId).quantity_received += recipient.quantity_received;
      } else {
        // Create new entry
        recipientGroups.set(individualId, {
          individual_id: individualId,
          quantity_received: recipient.quantity_received,
          additional_members_count: 0,
          is_child: !!childData
        });
      }
    }

    // Second pass: Process additional members and add to their parent individuals
    for (const recipient of additionalMembersToProcess) {
      // Parse additional member reference
      const [, parentIndividualId] = recipient.original_individual_id.toString().split('_');

      // Add quantity to the parent individual
      if (recipientGroups.has(parentIndividualId)) {
        recipientGroups.get(parentIndividualId).quantity_received += recipient.quantity_received;
        recipientGroups.get(parentIndividualId).additional_members_count++;
      } else {
        // If parent still not found, create entry with just additional member quantity
        recipientGroups.set(parentIndividualId, {
          individual_id: parentIndividualId,
          quantity_received: recipient.quantity_received,
          additional_members_count: 1,
          is_child: false
        });
      }
    }

    console.log('Recipients after grouping:', {
      totalGroups: recipientGroups.size,
      groups: Array.from(recipientGroups.entries()).map(([id, data]) => ({
        id,
        quantity: data.quantity_received,
        additionalMembers: data.additional_members_count,
        isChild: data.is_child
      }))
    });

    // Convert grouped recipients to insert format
    for (const [individualId, groupData] of recipientGroups) {
      if (groupData.is_child) {
        // This is a child
        recipientsToInsert.push({
          distribution_id: distribution.id,
          individual_id: null,
          child_id: individualId,
          quantity_received: groupData.quantity_received,
          value_received: (data.value / totalQuantity) * groupData.quantity_received,
          notes: groupData.additional_members_count > 0
            ? `Includes ${groupData.additional_members_count} additional family member(s)`
            : null
        });
      } else {
        // This is an individual
        recipientsToInsert.push({
          distribution_id: distribution.id,
          individual_id: individualId,
          child_id: null,
          quantity_received: groupData.quantity_received,
          value_received: (data.value / totalQuantity) * groupData.quantity_received,
          notes: groupData.additional_members_count > 0
            ? `Includes ${groupData.additional_members_count} additional family member(s)`
            : null
        });
      }
    }

    if (recipientsToInsert.length === 0) {
      // Rollback: delete the distribution if no valid recipients
      await supabase.from('distributions').delete().eq('id', distribution.id);
      throw new DistributionError(
        'no-valid-recipients',
        'No valid recipients found for distribution'
      );
    }

    const { error: recipientsError } = await supabase
      .from('distribution_recipients')
      .insert(recipientsToInsert);

    if (recipientsError) {
      // Rollback: delete the distribution if recipient creation fails
      await supabase.from('distributions').delete().eq('id', distribution.id);
      console.error('Database error creating recipients:', recipientsError);
      throw new DistributionError(
        'db-error',
        'Failed to create distribution recipients',
        recipientsError
      );
    }

    // Fetch the complete distribution with recipients using the same approach as useDistributions
    const { data: distributionData, error: fetchError } = await supabase
      .from('distributions')
      .select('*')
      .eq('id', distribution.id)
      .single();

    if (fetchError) {
      console.error('Error fetching distribution:', fetchError);
      throw new DistributionError(
        'fetch-failed',
        'Failed to fetch created distribution',
        fetchError
      );
    }

    // Get all recipients for this distribution
    const { data: recipientsData, error: recipientsFetchError } = await supabase
      .from('distribution_recipients')
      .select('*')
      .eq('distribution_id', distribution.id);

    if (recipientsFetchError) {
      console.error('Error fetching recipients:', recipientsFetchError);
      throw new DistributionError(
        'fetch-failed',
        'Failed to fetch distribution recipients',
        recipientsFetchError
      );
    }

    // For each recipient, fetch the individual or child data separately
    const recipientsWithDetails = await Promise.all(
      (recipientsData || []).map(async (recipient) => {
        let individual = null;
        let child = null;

        // If recipient has individual_id, fetch individual data
        if (recipient.individual_id) {
          const { data: individualData } = await supabase
            .from('individuals')
            .select('*')
            .eq('id', recipient.individual_id)
            .single();
          individual = individualData;
        }

        // If recipient has child_id, fetch child data
        if (recipient.child_id) {
          const { data: childData } = await supabase
            .from('children')
            .select('*')
            .eq('id', recipient.child_id)
            .single();
          child = childData;
        }

        return {
          ...recipient,
          individual,
          child
        };
      })
    );

    const completeDistribution = {
      ...distributionData,
      recipients: recipientsWithDetails
    };

    return completeDistribution;
  } catch (error) {
    console.error('Failed to create distribution:', error);
    if (error instanceof DistributionError) {
      throw error;
    }
    throw new DistributionError(
      'creation-failed',
      'Failed to create distribution',
      error
    );
  }
}

export async function updateDistribution(id: string, data: DistributionFormData): Promise<Distribution> {
  try {
    // Calculate total quantity if not matching (allow auto-calculation like create)
    const totalRecipientQuantity = data.recipients.reduce((sum, r) => sum + r.quantity_received, 0);
    const totalQuantity = data.quantity || totalRecipientQuantity;

    const { data: distribution, error: distributionError } = await supabase
      .from('distributions')
      .update({
        date: data.date,
        aid_type: data.aid_type,
        description: data.description,
        quantity: totalQuantity,
        value: data.value,
      })
      .eq('id', id)
      .select()
      .single();

    if (distributionError) throw distributionError;

    // Calculate value per unit
    const valuePerUnit = data.value / totalQuantity;

    // Delete existing recipients
    await supabase
      .from('distribution_recipients')
      .delete()
      .eq('distribution_id', id);

    // Process recipients - handle children and additional members
    const recipientsToInsert = [];
    const recipientGroups = new Map();

    for (const recipient of data.recipients) {
      const recipientId = recipient.individual_id?.toString() || '';

      // Skip additional members - aggregate to parent
      if (recipientId.startsWith('additional_')) {
        const [, parentIndividualId] = recipientId.split('_');
        if (recipientGroups.has(parentIndividualId)) {
          recipientGroups.get(parentIndividualId).quantity_received += recipient.quantity_received;
          recipientGroups.get(parentIndividualId).additional_members_count++;
        } else {
          recipientGroups.set(parentIndividualId, {
            individual_id: parentIndividualId,
            child_id: null,
            quantity_received: recipient.quantity_received,
            additional_members_count: 1,
            is_child: false
          });
        }
        continue;
      }

      // Check if this is a child
      const { data: childData } = await supabase
        .from('children')
        .select('id')
        .eq('id', recipientId)
        .single();

      const isChild = !!childData;

      if (recipientGroups.has(recipientId)) {
        recipientGroups.get(recipientId).quantity_received += recipient.quantity_received;
      } else {
        recipientGroups.set(recipientId, {
          individual_id: isChild ? null : recipientId,
          child_id: isChild ? recipientId : null,
          quantity_received: recipient.quantity_received,
          additional_members_count: 0,
          is_child: isChild
        });
      }
    }

    // Convert to insert format
    for (const [, groupData] of recipientGroups) {
      recipientsToInsert.push({
        distribution_id: id,
        individual_id: groupData.individual_id,
        child_id: groupData.child_id,
        quantity_received: groupData.quantity_received,
        value_received: Number((groupData.quantity_received * valuePerUnit).toFixed(2)),
        notes: groupData.additional_members_count > 0
          ? `Includes ${groupData.additional_members_count} additional family member(s)`
          : null
      });
    }

    const { error: recipientsError } = await supabase
      .from('distribution_recipients')
      .insert(recipientsToInsert);

    if (recipientsError) throw recipientsError;

    return distribution;
  } catch (error) {
    console.error('Error updating distribution:', error);
    throw new DistributionError(
      'update-failed',
      'Failed to update distribution',
      error
    );
  }
}


export async function deleteDistribution(id: string): Promise<void> {
  try {
    // Explicitly delete recipients first (cascades exist, but be explicit for clarity)
    const { error: recipientsError } = await supabase
      .from('distribution_recipients')
      .delete()
      .eq('distribution_id', id);

    if (recipientsError) {
      console.error('Error deleting distribution recipients:', recipientsError);
    }

    // Then delete the distribution
    const { error } = await supabase
      .from('distributions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting distribution:', error);
    throw new DistributionError(
      'deletion-failed',
      'Failed to delete distribution',
      error
    );
  }
}


export async function getDistributionHistory(
  startDate?: Date,
  endDate?: Date
): Promise<Distribution[]> {
  try {
    let query = supabase
      .from('distributions')
      .select(`
        *,
        recipients:distribution_recipients(
          *,
          individual:individuals(*),
          child:children(*)
        )
      `)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate.toISOString());
    }

    if (endDate) {
      query = query.lte('date', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching distribution history:', error);
    throw new DistributionError(
      'fetch-failed',
      'Failed to fetch distribution history',
      error
    );
  }
}

/**
 * Update the status of a distribution
 * @param id Distribution ID
 * @param status New status: 'in_progress', 'completed', or 'cancelled'
 */
export async function updateDistributionStatus(
  id: string,
  status: 'in_progress' | 'completed' | 'cancelled'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('distributions')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating distribution status:', error);
    throw new DistributionError(
      'status-update-failed',
      'Failed to update distribution status',
      error
    );
  }
}
