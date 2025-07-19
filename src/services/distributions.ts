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

export async function createDistribution(data: DistributionFormData): Promise<Distribution> {
  try {
    // Calculate total quantity from recipients
    const totalQuantity = data.recipients.reduce((sum, r) => sum + r.quantity_received, 0);

    // Create the distribution with calculated quantity
    const { data: distribution, error: distributionError } = await supabase
      .from('distributions')
      .insert([{
        date: data.date,
        aid_type: data.aid_type,
        description: data.description,
        quantity: totalQuantity, // Use calculated quantity
        value: data.value,
      }])
      .select()
      .single();

    if (distributionError) throw distributionError;

    // Calculate value per unit
    const valuePerUnit = data.value / totalQuantity;

    // Prepare recipient records with calculated value_received
    const recipientInserts = data.recipients.map(recipient => ({
      distribution_id: distribution.id,
      individual_id: recipient.individual_id,
      quantity_received: recipient.quantity_received,
      value_received: Number((recipient.quantity_received * valuePerUnit).toFixed(2)), // Round to 2 decimal places
      notes: null
    }));

    const { error: recipientsError } = await supabase
      .from('distribution_recipients')
      .insert(recipientInserts);

    if (recipientsError) throw recipientsError;

    return distribution;
  } catch (error) {
    console.error('Error creating distribution:', error);
    throw new DistributionError(
      'creation-failed',
      'Failed to create distribution',
      error
    );
  }
}

export async function updateDistribution(id: string, data: DistributionFormData): Promise<Distribution> {
  try {
    // Validate total quantities
    const totalRecipientQuantity = data.recipients.reduce((sum, r) => sum + r.quantity_received, 0);
    if (totalRecipientQuantity !== data.quantity) {
      throw new DistributionError(
        'invalid-quantities',
        'Total recipient quantities must match the distribution quantity'
      );
    }

    const { data: distribution, error: distributionError } = await supabase
      .from('distributions')
      .update({
        date: data.date,
        aid_type: data.aid_type,
        description: data.description,
        quantity: data.quantity,
        value: data.value,
      })
      .eq('id', id)
      .select()
      .single();

    if (distributionError) throw distributionError;

    // Calculate value per unit
    const valuePerUnit = data.value / data.quantity;

    // Delete existing recipients
    await supabase
      .from('distribution_recipients')
      .delete()
      .eq('distribution_id', id);

    // Insert new recipients with calculated value_received
    const recipientInserts = data.recipients.map(recipient => ({
      distribution_id: id,
      individual_id: recipient.individual_id,
      quantity_received: recipient.quantity_received,
      value_received: Number((recipient.quantity_received * valuePerUnit).toFixed(2)),
      notes: null
    }));

    const { error: recipientsError } = await supabase
      .from('distribution_recipients')
      .insert(recipientInserts);

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
          individual:individuals(*)
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
