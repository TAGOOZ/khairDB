import { supabase } from '../lib/supabase';
import { Distribution } from '../types';
import { DistributionFormData } from '../schemas/distributionSchema';
import { logActivity } from './activityLogs';
import { ServiceError } from '../utils/errors';

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
        const formattedMembers = individual.additional_members.map((member: any, index: number) => {
          // Split name properly: last space separates first_name from last_name
          const fullName = member.name || '';
          const lastSpaceIndex = fullName.lastIndexOf(' ');
          const firstName = lastSpaceIndex > 0 ? fullName.substring(0, lastSpaceIndex) : fullName || 'Unknown';
          const lastName = lastSpaceIndex > 0 ? fullName.substring(lastSpaceIndex + 1) : '';

          return {
            id: `additional_${individual.id}_${index}`, // Generate unique ID
            first_name: firstName,
            last_name: lastName,
            gender: member.gender || 'unknown',
            type: 'additional_member',
            relation: member.relation || 'other',
            date_of_birth: member.date_of_birth,
            job_title: member.job_title,
            phone_number: member.phone_number,
            parent_individual_id: individual.id,
            parent_name: `${individual.first_name} ${individual.last_name}`
          };
        });
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
    throw new ServiceError(
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
      throw new ServiceError(
        'invalid-data',
        'Missing required fields'
      );
    }

    // Format recipients to handle additional members and walk-ins
    const formattedRecipients = data.recipients.map((recipient: { individual_id: string; quantity_received: number; notes?: string; name?: string }) => {
      // If it's a walk-in
      if (recipient.individual_id.toString().startsWith('walkin_')) {
        return {
          ...recipient,
          original_individual_id: recipient.individual_id,
          individual_id: null,
          is_walkin: true,
          walkin_name: recipient.name || 'Unknown Walk-in',
          additional_member_ref: null
        };
      }

      // If it's an additional member
      if (recipient.individual_id.toString().startsWith('additional_')) {
        const [, parentIndividualId, memberIndex] = recipient.individual_id.toString().split('_');
        return {
          ...recipient,
          original_individual_id: recipient.individual_id,
          individual_id: null,
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
    const totalQuantity = data.quantity || data.recipients.reduce((sum: number, recipient: { quantity_received: number }) => sum + recipient.quantity_received, 0);

    // Calculate total value if value_per_unit provided
    const totalValue = data.value_per_unit
      ? data.value_per_unit * totalQuantity
      : data.value;

    console.log('Distribution creation debug:', {
      totalRecipients: data.recipients.length,
      totalQuantity,
      totalValue,
      status: data.status
    });

    // Prepare recipients data for RPC
    const recipientsToInsert = [];

    // Group recipients by individual, aggregating additional members
    const recipientGroups = new Map();
    const additionalMembersToProcess = [];
    const walkinsToProcess = [];

    // First pass: Process main individuals and children, collect others
    for (const recipient of formattedRecipients) {
      if ((recipient as any).is_walkin) {
        walkinsToProcess.push(recipient);
        continue;
      }

      const isAdditionalMember = recipient.original_individual_id && recipient.original_individual_id.toString().startsWith('additional_');

      if (isAdditionalMember) {
        additionalMembersToProcess.push(recipient);
        continue;
      }

      if (!recipient.individual_id) {
        continue; // Skip null IDs (shouldn't happen for regulars)
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
      const parentIndividualId = (recipient as any).additional_member_ref.parent_individual_id;

      if (recipientGroups.has(parentIndividualId)) {
        recipientGroups.get(parentIndividualId).quantity_received += recipient.quantity_received;
        recipientGroups.get(parentIndividualId).additional_members_count++;
      } else {
        recipientGroups.set(parentIndividualId, {
          individual_id: parentIndividualId,
          quantity_received: recipient.quantity_received,
          additional_members_count: 1,
          is_child: false
        });
      }
    }

    // Convert grouped recipients to insert format
    for (const [individualId, groupData] of recipientGroups) {
      const unitValue = totalValue / totalQuantity;
      const valueReceived = unitValue * groupData.quantity_received;

      if (groupData.is_child) {
        recipientsToInsert.push({
          individual_id: null,
          child_id: individualId,
          quantity_received: groupData.quantity_received,
          value_received: valueReceived,
          notes: groupData.additional_members_count > 0
            ? `Includes ${groupData.additional_members_count} additional family member(s)`
            : null
        });
      } else {
        recipientsToInsert.push({
          individual_id: individualId,
          child_id: null,
          quantity_received: groupData.quantity_received,
          value_received: valueReceived,
          notes: groupData.additional_members_count > 0
            ? `Includes ${groupData.additional_members_count} additional family member(s)`
            : null
        });
      }
    }

    // Process Walk-ins
    for (const recipient of walkinsToProcess) {
      const unitValue = totalValue / totalQuantity;
      recipientsToInsert.push({
        individual_id: null,
        child_id: null,
        quantity_received: recipient.quantity_received,
        value_received: unitValue * recipient.quantity_received,
        notes: `Walk-in Recipient: ${(recipient as any).walkin_name}`
      });
    }

    if (recipientsToInsert.length === 0) {
      throw new ServiceError(
        'no-valid-recipients',
        'No valid recipients found for distribution'
      );
    }

    // Call RPC transaction
    const { data: distributionRecord, error: rpcError } = await supabase
      .rpc('create_distribution_transaction', {
        p_description: data.description,
        p_date: data.date,
        p_aid_type: data.aid_type,
        p_quantity: totalQuantity,
        p_value: totalValue,
        p_status: data.status || 'completed', // Pass status
        p_recipients: recipientsToInsert
      });

    if (rpcError) {
      console.error('RPC Error creating distribution:', rpcError);
      throw new ServiceError(
        'creation-failed',
        'Failed to create distribution transaction',
        rpcError
      );
    }

    // Fetch the complete distribution with recipients using the same approach as useDistributions
    const { data: distributionData, error: fetchError } = await supabase
      .from('distributions')
      .select('*')
      .eq('id', distributionRecord.id)
      .single();

    if (fetchError) {
      console.error('Error fetching distribution:', fetchError);
      throw new ServiceError(
        'fetch-failed',
        'Failed to fetch created distribution',
        fetchError
      );
    }

    // Get all recipients for this distribution
    const { data: recipientsData, error: recipientsFetchError } = await supabase
      .from('distribution_recipients')
      .select('*')
      .eq('distribution_id', distributionRecord.id);

    if (recipientsFetchError) {
      console.error('Error fetching recipients:', recipientsFetchError);
      throw new ServiceError(
        'fetch-failed',
        'Failed to fetch distribution recipients',
        recipientsFetchError
      );
    }

    // For each recipient, fetch the individual or child data separately
    const recipientsWithDetails = await Promise.all(
      (recipientsData || []).map(async (recipient: { individual_id: string | null; child_id: string | null; quantity_received: number; value_received: number; notes: string | null }) => {
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

    // Log the activity
    await logActivity(
      'create',
      'distribution',
      distributionRecord.id,
      data.description,
      { aid_type: data.aid_type, recipients_count: recipientsToInsert.length, value: data.value }
    );

    return completeDistribution;
  } catch (error) {
    console.error('Failed to create distribution:', error);
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
      'creation-failed',
      'Failed to create distribution',
      error
    );
  }
}


export async function updateDistribution(id: string, data: DistributionFormData): Promise<Distribution> {
  try {
    // Calculate total quantity if not matching (allow auto-calculation like create)
    const totalRecipientQuantity = data.recipients.reduce((sum: number, r: { quantity_received: number }) => sum + r.quantity_received, 0);
    const totalQuantity = data.quantity || totalRecipientQuantity;

    // Calculate value per unit
    const valuePerUnit = data.value / totalQuantity;

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
        individual_id: groupData.individual_id,
        child_id: groupData.child_id,
        quantity_received: groupData.quantity_received,
        value_received: Number((groupData.quantity_received * valuePerUnit).toFixed(2)),
        notes: groupData.additional_members_count > 0
          ? `Includes ${groupData.additional_members_count} additional family member(s)`
          : null
      });
    }

    // Call RPC transaction
    const { data: distributionRecord, error: rpcError } = await supabase
      .rpc('update_distribution_transaction', {
        p_id: id,
        p_date: data.date,
        p_aid_type: data.aid_type,
        p_description: data.description,
        p_quantity: totalQuantity,
        p_value: data.value,
        p_recipients: recipientsToInsert
      });

    if (rpcError) {
      throw new ServiceError(
        'update-failed',
        'Failed to update distribution transaction',
        rpcError
      );
    }

    // Log the activity
    await logActivity(
      'update',
      'distribution',
      id,
      data.description,
      { aid_type: data.aid_type, recipients_count: recipientsToInsert.length, value: data.value }
    );

    return distributionRecord as Distribution;

  } catch (error) {
    console.error('Error updating distribution:', error);
    throw new ServiceError(
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

    // Log the activity
    await logActivity(
      'delete',
      'distribution',
      id,
      'Distribution deleted',
      { deleted_distribution_id: id }
    );
  } catch (error) {
    console.error('Error deleting distribution:', error);
    throw new ServiceError(
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
    throw new ServiceError(
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
    throw new ServiceError(
      'status-update-failed',
      'Failed to update distribution status',
      error
    );
  }
}
