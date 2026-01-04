import { supabase } from '../lib/supabase';
import { IndividualFormData } from '../schemas/individualSchema';
import { logActivity } from './activityLogs';
import { ServiceError } from '../utils/errors';

export async function submitIndividualRequest(data: IndividualFormData) {
  try {
    // First check if ID number already exists
    const { data: existingIndividual } = await supabase
      .from('individuals')
      .select('id')
      .eq('id_number', data.id_number)
      .single();

    if (existingIndividual) {
      throw new ServiceError(
        'duplicate-id',
        'An individual with this ID number already exists'
      );
    }

    // Get current user's ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user?.id) {
      throw new ServiceError(
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
      throw new ServiceError(
        'submission-failed',
        error.message || 'Failed to submit request',
        error
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
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
      throw new ServiceError(
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
      throw new ServiceError(
        'edit-failed',
        fetchError.message || 'Failed to fetch request for editing',
        fetchError
      );
    }

    if (oldRequest.status === 'approved') {
      throw new ServiceError(
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
      throw new ServiceError(
        'edit-failed',
        updateError.message || 'Failed to edit request',
        updateError
      );
    }

    return result;
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
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
      throw new ServiceError(
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
      throw new ServiceError(
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
        throw new ServiceError(
          'approval-failed',
          updateError.message || 'Failed to update request status',
          updateError
        );
      }

      return;
    }

    // Start transaction for data integrity
    const { error: beginError } = await supabase.rpc('begin_transaction');
    if (beginError) {
      throw new ServiceError(
        'transaction-failed',
        'Failed to start transaction. Cannot proceed with approval to ensure data integrity.',
        beginError
      );
    }

    try {
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
          throw new ServiceError('approval-failed', 'Failed to create family', familyError);
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
        throw new ServiceError('approval-failed', 'Failed to create individual', individualError);
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

        throw new ServiceError(
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
            individual_id: newIndividual.id,
            role: 'parent'
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
              created_by: user.id  // Use the approving admin's ID
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

      // Create assistance details if any - with proper validation for meaningful values
      const assistanceDetails: { individual_id: string; assistance_type: string; details: any }[] = [];

      // Helper to check if assistance data has meaningful values
      const hasNonEmptyValues = (obj: any, type: string): boolean => {
        if (!obj) return false;
        if (type === 'debt_assistance') return obj.needs_debt_assistance === true;
        if (type === 'marriage_assistance') return obj.marriage_support_needed === true;
        if (type === 'medical_help') {
          return Array.isArray(obj.type_of_medical_assistance_needed) && obj.type_of_medical_assistance_needed.length > 0;
        }
        if (type === 'food_assistance') {
          return (Array.isArray(obj.type_of_food_assistance_needed) && obj.type_of_food_assistance_needed.length > 0) || obj.food_supply_card === true;
        }
        // Default: check if any non-empty string/array/true boolean exists
        return Object.values(obj).some((v: any) =>
          (typeof v === 'string' && v.trim()) ||
          (Array.isArray(v) && v.length > 0) ||
          v === true
        );
      };

      if (individualData.medical_help && hasNonEmptyValues(individualData.medical_help, 'medical_help')) {
        assistanceDetails.push({
          individual_id: newIndividual.id,
          assistance_type: 'medical_help',
          details: individualData.medical_help
        });
      }

      if (individualData.food_assistance && hasNonEmptyValues(individualData.food_assistance, 'food_assistance')) {
        assistanceDetails.push({
          individual_id: newIndividual.id,
          assistance_type: 'food_assistance',
          details: individualData.food_assistance
        });
      }

      if (individualData.marriage_assistance && hasNonEmptyValues(individualData.marriage_assistance, 'marriage_assistance')) {
        assistanceDetails.push({
          individual_id: newIndividual.id,
          assistance_type: 'marriage_assistance',
          details: individualData.marriage_assistance
        });
      }

      if (individualData.debt_assistance && hasNonEmptyValues(individualData.debt_assistance, 'debt_assistance')) {
        assistanceDetails.push({
          individual_id: newIndividual.id,
          assistance_type: 'debt_assistance',
          details: individualData.debt_assistance
        });
      }

      if (individualData.education_assistance && hasNonEmptyValues(individualData.education_assistance, 'education_assistance')) {
        assistanceDetails.push({
          individual_id: newIndividual.id,
          assistance_type: 'education_assistance',
          details: individualData.education_assistance
        });
      }

      if (individualData.shelter_assistance && hasNonEmptyValues(individualData.shelter_assistance, 'shelter_assistance')) {
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
        const needsInserts = fetchedRequest.data.needs.map((need: { category: string; priority: string; description: string }) => ({
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

      // Create Google Drive folder for the approved individual
      try {
        const { createIndividualFolderAPI } = await import('../api/googleDrive');
        const { folderId, folderUrl } = await createIndividualFolderAPI(
          newIndividual.id,
          newIndividual.first_name,
          newIndividual.last_name
        );

        // Update individual with Google Drive info
        const { error: updateError } = await supabase
          .from('individuals')
          .update({
            google_drive_folder_id: folderId,
            google_drive_folder_url: folderUrl
          })
          .eq('id', newIndividual.id);

        if (updateError) {
          console.error('Error updating individual with Google Drive info:', updateError);
          // Don't throw here, as the individual was created successfully
        } else {
          console.log('Google Drive folder created successfully for approved individual');
        }
      } catch (driveError) {
        console.error('Error creating Google Drive folder for approved individual:', driveError);
        // Don't throw here, as the individual was created successfully
      }

      // Commit transaction if it was started
      try {
        await supabase.rpc('commit_transaction');
      } catch {
        // Ignore commit errors if transaction wasn't started
      }

      // Log the activity
      await logActivity(
        'approve',
        'request',
        id,
        `${individualData.first_name} ${individualData.last_name}`,
        { request_type: fetchedRequest.type, individual_id: newIndividual.id }
      );

    } catch (innerError) {
      // Rollback transaction on any error
      try {
        await supabase.rpc('rollback_transaction');
      } catch {
        // Ignore rollback errors if transaction wasn't started
      }
      throw innerError;
    }

  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
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
      throw new ServiceError(
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
      throw new ServiceError(
        'rejection-failed',
        error.message || 'Failed to reject request',
        error
      );
    }

    // Log the activity
    await logActivity(
      'reject',
      'request',
      id,
      'Request rejected',
      { comment }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
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
      throw new ServiceError(
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
      throw new ServiceError(
        'deletion-failed',
        error.message || 'Failed to delete request',
        error
      );
    }
  } catch (error) {
    if (error instanceof ServiceError) {
      throw error;
    }
    throw new ServiceError(
      'deletion-failed',
      'Failed to delete request',
      error
    );
  }
}

