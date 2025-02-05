import { supabase } from '../lib/supabase';
    import { IndividualFormData } from '../schemas/individualSchema';
    
    export class PendingRequestError extends Error {
      constructor(
        public code: string,
        message: string,
        public details?: unknown
      ) {
        super(message);
        this.name = 'PendingRequestError';
      }
    }
    
    export async function submitIndividualRequest(data: IndividualFormData) {
      try {
        // First check if ID number already exists
        const { data: existingIndividual } = await supabase
          .from('individuals')
          .select('id')
          .eq('id_number', data.id_number)
          .single();
    
        if (existingIndividual) {
          throw new PendingRequestError(
            'duplicate-id',
            'An individual with this ID number already exists'
          );
        }
    
        // Get current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new PendingRequestError(
            'unauthorized',
            'You must be logged in to submit a request'
          );
        }
    
        const { data: result, error } = await supabase
          .from('pending_requests')
          .insert([{
            type: 'individual',
            data,
            status: 'pending',
            submitted_by: user.id
          }])
          .select()
          .single();
    
        if (error) {
          throw new PendingRequestError(
            'submission-failed',
            error.message || 'Failed to submit request',
            error
          );
        }
    
        return result;
      } catch (error) {
        if (error instanceof PendingRequestError) {
          throw error;
        }
        throw new PendingRequestError(
          'submission-failed',
          'Failed to submit request',
          error
        );
      }
    }
    
    export async function editRequest(requestId: string, data: IndividualFormData) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new PendingRequestError(
            'unauthorized',
            'You must be logged in to edit requests'
          );
        }
    
        const { data: oldRequest, error: fetchError } = await supabase
          .from('pending_requests')
          .select('*')
          .eq('id', requestId)
          .single();
    
        if (fetchError) {
          throw new PendingRequestError(
            'edit-failed',
            fetchError.message || 'Failed to fetch request for editing',
            fetchError
          );
        }
    
        if (oldRequest.status === 'approved') {
          throw new PendingRequestError(
            'edit-not-allowed',
            'Cannot edit a request that is approved'
          );
        }
    
        const { data: result, error: updateError } = await supabase
          .from('pending_requests')
          .update({
            data,
            status: 'pending',
            reviewed_by: null,
            reviewed_at: null,
            admin_comment: null,
            version: oldRequest.version + 1,
            previous_version_id: oldRequest.id
          })
          .eq('id', requestId)
          .select()
          .single();
    
        if (updateError) {
          throw new PendingRequestError(
            'edit-failed',
            updateError.message || 'Failed to edit request',
            updateError
          );
        }
    
        return result;
      } catch (error) {
        if (error instanceof PendingRequestError) {
          throw error;
        }
        throw new PendingRequestError(
          'edit-failed',
          'Failed to edit request',
          error
        );
      }
    }
    
    export async function approveRequest(id: string, comment?: string) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new PendingRequestError(
            'unauthorized',
            'You must be logged in to approve requests'
          );
        }
    
        const { data: request, error: fetchError } = await supabase
          .from('pending_requests')
          .select('*')
          .eq('id', id)
          .single();
    
        if (fetchError) {
          throw new PendingRequestError(
            'approval-failed',
            fetchError.message || 'Failed to fetch request for approval',
            fetchError
          );
        }
    
        const { data: result, error } = await supabase
          .rpc('approve_request', {
            request_id: id,
            p_admin_comment: comment || null
          });
    
        if (error) {
          throw new PendingRequestError(
            'approval-failed',
            error.message || 'Failed to approve request',
            error
          );
        }
    
        // Insert needs if any
        if (request?.data?.needs && Array.isArray(request.data.needs)) {
          const { data: individual, error: individualError } = await supabase
            .from('individuals')
            .select('id')
            .eq('id_number', request.data.id_number)
            .single();
    
          if (individualError) {
            throw new PendingRequestError(
              'approval-failed',
              individualError.message || 'Failed to fetch individual after approval',
              individualError
            );
          }
    
          const needsInserts = request.data.needs.map((need) => ({
            individual_id: individual.id,
            category: need.category,
            priority: need.priority,
            description: need.description,
            status: 'pending'
          }));
    
          const { error: needsError } = await supabase
            .from('needs')
            .insert(needsInserts);
    
          if (needsError) {
            throw new PendingRequestError(
              'approval-failed',
              needsError.message || 'Failed to insert needs after approval',
              needsError
            );
          }
        }
    
        return result;
      } catch (error) {
        if (error instanceof PendingRequestError) {
          throw error;
        }
        throw new PendingRequestError(
          'approval-failed',
          'Failed to approve request',
          error
        );
      }
    }
    
    export async function rejectRequest(id: string, comment: string) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new PendingRequestError(
            'unauthorized',
            'You must be logged in to reject requests'
          );
        }
    
        const { error } = await supabase
          .rpc('reject_request', {
            request_id: id,
            p_admin_comment: comment
          });
    
        if (error) {
          throw new PendingRequestError(
            'rejection-failed',
            error.message || 'Failed to reject request',
            error
          );
        }
      } catch (error) {
        if (error instanceof PendingRequestError) {
          throw error;
        }
        throw new PendingRequestError(
          'rejection-failed',
          'Failed to reject request',
          error
        );
      }
    }
    
    export async function deleteRequest(id: string) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new PendingRequestError(
            'unauthorized',
            'You must be logged in to delete requests'
          );
        }
    
        const { error } = await supabase
          .from('pending_requests')
          .delete()
          .eq('id', id)
          .eq('submitted_by', user.id); // Only allow deleting own requests
    
        if (error) {
          throw new PendingRequestError(
            'deletion-failed',
            error.message || 'Failed to delete request',
            error
          );
        }
      } catch (error) {
        if (error instanceof PendingRequestError) {
          throw error;
        }
        throw new PendingRequestError(
          'deletion-failed',
          'Failed to delete request',
          error
        );
      }
    }
