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
    
        const { data: fetchedRequest, error: fetchError } = await supabase
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
    
        // Create the individual directly since we don't have the approve_request function
        const individualData = fetchedRequest.data;
        
        // Check if individual already exists
        const { data: existingIndividual } = await supabase
          .from('individuals')
          .select('id')
          .eq('id_number', individualData.id_number)
          .single();

        if (existingIndividual) {
          // Individual already exists, just update the request status
          const { error: updateError } = await supabase
            .from('pending_requests')
            .update({
              status: 'approved',
              reviewed_by: user.id,
              reviewed_at: new Date().toISOString(),
              admin_comment: comment || null
            })
            .eq('id', id);

          if (updateError) {
            throw new PendingRequestError(
              'approval-failed',
              updateError.message || 'Failed to update request status',
              updateError
            );
          }
          
          return;
        }

        // Handle family creation if needed
        let familyId = individualData.family_id;
        
        if (!familyId && individualData.new_family_name) {
          const { data: newFamily, error: familyError } = await supabase
            .from('families')
            .insert([{
              name: individualData.new_family_name,
              district: individualData.district,
              phone: individualData.phone || '',
              address: individualData.address || '',
              status: 'green'
            }])
            .select()
            .single();
            
          if (familyError) {
            throw new PendingRequestError('approval-failed', 'Failed to create family', familyError);
          }
          
          familyId = newFamily.id;
        }
        
        // Create the individual
        const { data: newIndividual, error: individualError } = await supabase
          .from('individuals')
          .insert([{
            first_name: individualData.first_name,
            last_name: individualData.last_name,
            id_number: individualData.id_number,
            date_of_birth: individualData.date_of_birth,
            gender: individualData.gender,
            marital_status: individualData.marital_status,
            phone: individualData.phone || null,
            address: individualData.address || null,
            district: individualData.district,
            description: individualData.description || null,
            job: individualData.job || null,
            employment_status: individualData.employment_status,
            salary: individualData.salary || null,
            list_status: individualData.list_status || 'whitelist',
            family_id: familyId,
            created_by: fetchedRequest.submitted_by
          }])
          .select()
          .single();
          
        if (individualError) {
          throw new PendingRequestError('approval-failed', 'Failed to create individual', individualError);
        }
        
        // Update the request status immediately after creating the individual
        const { error: updateError } = await supabase
          .from('pending_requests')
          .update({
            status: 'approved',
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
            admin_comment: comment || null
          })
          .eq('id', id);

        if (updateError) {
          // If updating the request fails, we should delete the created individual to maintain consistency
          await supabase
            .from('individuals')
            .delete()
            .eq('id', newIndividual.id);
            
          throw new PendingRequestError(
            'approval-failed',
            updateError.message || 'Failed to update request status',
            updateError
          );
        }

        // Add to family_members if family exists
        if (familyId) {
          const { error: memberError } = await supabase
            .from('family_members')
            .insert([{
              family_id: familyId,
              created_by: fetchedRequest.submitted,
              by_role: 'parent'
            }]);
            
          if (memberError) {
            console.error('Error adding family member:', memberError);
          }
        }
        
        // Create children if any
        if (individualData.children && individualData.children.length > 0) {
          const childPromises = individualData.children.map(async (child: any) => {
            const { data: newChild, error: childError } = await supabase
              .from('children')
              .insert([{
                first_name: child.first_name,
                last_name: child.last_name,
                date_of_birth: child.date_of_birth,
                gender: child.gender,
                school_stage: child.school_stage,
                description: child.description || null,
                parent_id: newIndividual.id,
                family_id: familyId,
                created_by: request.submitted_by
              }])
              .select()
              .single();
              
            if (childError) {
              console.error('Error creating child:', childError);
            }
            
            return newChild;
          });
          
          await Promise.all(childPromises);
        }
        
        // Create assistance details if any
        const assistanceDetails = [];
        
        if (individualData.medical_help && Object.keys(individualData.medical_help).length > 0) {
          assistanceDetails.push({
            individual_id: newIndividual.id,
            assistance_type: 'medical_help',
            details: individualData.medical_help
          });
        }
        
        if (individualData.food_assistance && Object.keys(individualData.food_assistance).length > 0) {
          assistanceDetails.push({
            individual_id: newIndividual.id,
            assistance_type: 'food_assistance',
            details: individualData.food_assistance
          });
        }
        
        if (individualData.marriage_assistance && Object.keys(individualData.marriage_assistance).length > 0) {
          assistanceDetails.push({
            individual_id: newIndividual.id,
            assistance_type: 'marriage_assistance',
            details: individualData.marriage_assistance
          });
        }
        
        if (individualData.debt_assistance && Object.keys(individualData.debt_assistance).length > 0) {
          assistanceDetails.push({
            individual_id: newIndividual.id,
            assistance_type: 'debt_assistance',
            details: individualData.debt_assistance
          });
        }
        
        if (individualData.education_assistance && Object.keys(individualData.education_assistance).length > 0) {
          assistanceDetails.push({
            individual_id: newIndividual.id,
            assistance_type: 'education_assistance',
            details: individualData.education_assistance
          });
        }
        
        if (individualData.shelter_assistance && Object.keys(individualData.shelter_assistance).length > 0) {
          assistanceDetails.push({
            individual_id: newIndividual.id,
            assistance_type: 'shelter_assistance',
            details: individualData.shelter_assistance
          });
        }
        
        if (assistanceDetails.length > 0) {
          const { error: assistanceError } = await supabase
            .from('assistance_details')
            .insert(assistanceDetails);
            
          if (assistanceError) {
            console.error('Error creating assistance details:', assistanceError);
          }
        }
        
        // Insert needs if any
        if (fetchedRequest?.data?.needs && Array.isArray(fetchedRequest.data.needs)) {
          const needsInserts = fetchedRequest.data.needs.map((need) => ({
            individual_id: newIndividual.id,
            category: need.category,
            priority: need.priority,
            description: need.description,
            status: 'pending',
            created_by: fetchedRequest.submitted_by
          }));
    
          const { error: needsError } = await supabase
            .from('needs')
            .insert(needsInserts);
    
          if (needsError) {
            console.error('Error creating needs:', needsError);
          }
        }
    
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

        // Check if fetchedRequest is already approved
        if (fetchedRequest.status === 'approved') {
          throw new PendingRequestError(
            'already-approved',
            'This request has already been approved'
          );
        }
