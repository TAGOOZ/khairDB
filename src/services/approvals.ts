import { supabase } from '../lib/supabase';
import { IndividualRequest, ApprovalLog } from '../types';
import { ServiceError } from '../utils/errors';

export async function submitIndividualRequest(data: Omit<IndividualRequest, 'id' | 'status' | 'submitted_by' | 'submitted_at' | 'reviewed_by' | 'reviewed_at' | 'admin_comment'>): Promise<IndividualRequest> {
  try {
    const { data: request, error } = await supabase
      .from('individual_requests')
      .insert([{
        ...data,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return request;
  } catch (error) {
    throw new ServiceError('submission-failed', 'Failed to submit request', error);
  }
}

export async function getPendingRequests(): Promise<IndividualRequest[]> {
  try {
    // Note: individual_requests stores data in 'details' JSONB column, not separate columns
    const { data, error } = await supabase
      .from('individual_requests')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new ServiceError('fetch-failed', 'Failed to fetch pending requests', error);
  }
}



export async function approveRequest(requestId: string, comment?: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('approve_individual_request', {
        request_id: requestId,
        admin_comment: comment || null
      });

    if (error) throw error;
  } catch (error) {
    throw new ServiceError('approval-failed', 'Failed to approve request', error);
  }
}

export async function rejectRequest(requestId: string, comment: string): Promise<void> {
  try {
    const { error } = await supabase
      .rpc('reject_individual_request', {
        request_id: requestId,
        admin_comment: comment
      });

    if (error) throw error;
  } catch (error) {
    throw new ServiceError('rejection-failed', 'Failed to reject request', error);
  }
}

export async function getApprovalLogs(): Promise<ApprovalLog[]> {
  try {
    const { data, error } = await supabase
      .from('approval_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new ServiceError('fetch-logs-failed', 'Failed to fetch approval logs', error);
  }
}
