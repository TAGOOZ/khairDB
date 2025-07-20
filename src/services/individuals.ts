import { supabase } from '../lib/supabase';
import { IndividualFormData } from '../schemas/individualSchema';
import { addHashtagToAll } from './hashtags';
import { createIndividualFolderAPI } from '../api/googleDrive';

interface AssistanceDetail {
  individual_id: string;
  assistance_type: 'medical_help' | 'food_assistance' | 'marriage_assistance' | 'debt_assistance' | 'education_assistance' | 'shelter_assistance';
  details: any;
}

/**
 * Utility functions for handling assistance details
 */
class AssistanceDetailsHandler {
  /**
   * Validates and normalizes assistance details
   */
  static normalizeAssistanceDetails(data: IndividualFormData): AssistanceDetail[] {
    const assistanceDetails: AssistanceDetail[] = [];
    
    // Helper to check if an array has actual values
    const hasArrayValues = (arr: any[] | null | undefined): boolean => {
      return Array.isArray(arr) && arr.length > 0;
    };

    // Enhanced helper to check if an object has any meaningful values
    const hasNonEmptyValues = (obj: any, assistanceType: string): boolean => {
      if (!obj) return false;
      
      // Special handling for different assistance types
      switch (assistanceType) {
        case 'debt_assistance':
          // For debt assistance, only consider it meaningful if needs_debt_assistance is true
          return obj.needs_debt_assistance === true;
          
        case 'marriage_assistance':
          // For marriage assistance, only consider it meaningful if marriage_support_needed is true
          return obj.marriage_support_needed === true;
          
        case 'medical_help':
          // For medical help, check if any assistance types are selected or other meaningful data exists
          return hasArrayValues(obj.type_of_medical_assistance_needed) || 
                 obj.health_insurance_coverage === true ||
                 (obj.medication_distribution_frequency && obj.medication_distribution_frequency.trim().length > 0) ||
                 (obj.estimated_cost_of_treatment && obj.estimated_cost_of_treatment.trim().length > 0) ||
                 (obj.additional_details && obj.additional_details.trim().length > 0);
          
        case 'food_assistance':
          // For food assistance, check if any food types are selected or food supply card is true
          return hasArrayValues(obj.type_of_food_assistance_needed) || obj.food_supply_card === true;
          
        case 'education_assistance':
          // For education assistance, check if any meaningful education data exists
          return (obj.family_education_level && obj.family_education_level.trim().length > 0) ||
                 (obj.desire_for_education && obj.desire_for_education.trim().length > 0) ||
                 hasArrayValues(obj.children_educational_needs);
          
        case 'shelter_assistance':
          // For shelter assistance, check if any housing details are provided
          return (obj.type_of_housing && obj.type_of_housing.trim().length > 0) ||
                 (obj.housing_condition && obj.housing_condition.trim().length > 0) ||
                 (obj.number_of_rooms && obj.number_of_rooms > 0) ||
                 hasArrayValues(obj.household_appliances);
          
        default:
          // Fallback to generic check
          return Object.entries(obj).some(([_, value]) => {
            if (Array.isArray(value)) return hasArrayValues(value);
            if (typeof value === 'boolean') return value === true;
            if (typeof value === 'number') return value > 0;
            if (typeof value === 'string') return value.trim().length > 0;
            return false;
          });
      }
    };

    // Helper to normalize assistance data based on type
    const normalizeAssistanceData = (data: any, assistanceType: string): any => {
      switch (assistanceType) {
        case 'debt_assistance':
          // If needs_debt_assistance is false, reset all other fields
          if (!data.needs_debt_assistance) {
            return {
              needs_debt_assistance: false,
              debt_amount: 0,
              household_appliances: false,
              hospital_bills: false,
              education_fees: false,
              business_debt: false,
              other_debt: false
            };
          }
          return {
            needs_debt_assistance: Boolean(data.needs_debt_assistance),
            debt_amount: Number(data.debt_amount) || 0,
            household_appliances: Boolean(data.household_appliances),
            hospital_bills: Boolean(data.hospital_bills),
            education_fees: Boolean(data.education_fees),
            business_debt: Boolean(data.business_debt),
            other_debt: Boolean(data.other_debt)
          };
          
        case 'marriage_assistance':
          // If marriage_support_needed is false, reset all other fields
          if (!data.marriage_support_needed) {
            return {
              marriage_support_needed: false,
              wedding_contract_signed: false,
              wedding_date: null,
              specific_needs: null
            };
          }
          return {
            marriage_support_needed: Boolean(data.marriage_support_needed),
            wedding_contract_signed: Boolean(data.wedding_contract_signed),
            wedding_date: data.wedding_date || null,
            specific_needs: data.specific_needs || null
          };
          
        default:
          return data;
      }
    };
       

    // Medical Help
    if (data.medical_help && hasNonEmptyValues(data.medical_help, 'medical_help')) {
      assistanceDetails.push({
        individual_id: '', // Will be set later
        assistance_type: 'medical_help',
        details: normalizeAssistanceData({
          type_of_medical_assistance_needed: hasArrayValues(data.medical_help.type_of_medical_assistance_needed) 
            ? data.medical_help.type_of_medical_assistance_needed 
            : [],
          medication_distribution_frequency: data.medical_help.medication_distribution_frequency || null,
          estimated_cost_of_treatment: data.medical_help.estimated_cost_of_treatment || null,
          health_insurance_coverage: Boolean(data.medical_help.health_insurance_coverage),
          additional_details: data.medical_help.additional_details || null
        }, 'medical_help')
      });
    }

    // Food Assistance
    if (data.food_assistance && hasNonEmptyValues(data.food_assistance, 'food_assistance')) {
      assistanceDetails.push({
        individual_id: '',
        assistance_type: 'food_assistance',
        details: normalizeAssistanceData({
          type_of_food_assistance_needed: hasArrayValues(data.food_assistance.type_of_food_assistance_needed)
            ? data.food_assistance.type_of_food_assistance_needed
            : [],
          food_supply_card: Boolean(data.food_assistance.food_supply_card)
        }, 'food_assistance')
      });
    }

    // Marriage Assistance
    if (data.marriage_assistance && hasNonEmptyValues(data.marriage_assistance, 'marriage_assistance')) {
      assistanceDetails.push({
        individual_id: '',
        assistance_type: 'marriage_assistance',
        details: normalizeAssistanceData(data.marriage_assistance, 'marriage_assistance')
      });
    }

    // Debt Assistance
    if (data.debt_assistance && hasNonEmptyValues(data.debt_assistance, 'debt_assistance')) {
      assistanceDetails.push({
        individual_id: '',
        assistance_type: 'debt_assistance',
        details: normalizeAssistanceData(data.debt_assistance, 'debt_assistance')
      });
    }

    // Education Assistance
    if (data.education_assistance && hasNonEmptyValues(data.education_assistance, 'education_assistance')) {
      assistanceDetails.push({
        individual_id: '',
        assistance_type: 'education_assistance',
        details: normalizeAssistanceData({
          family_education_level: data.education_assistance.family_education_level || null,
          desire_for_education: data.education_assistance.desire_for_education || null,
          children_educational_needs: hasArrayValues(data.education_assistance.children_educational_needs)
            ? data.education_assistance.children_educational_needs
            : []
        }, 'education_assistance')
      });
    }

    // Shelter Assistance
    if (data.shelter_assistance && hasNonEmptyValues(data.shelter_assistance, 'shelter_assistance')) {
      // Validate housing condition
      const validHousingConditions = ['excellent', 'good', 'fair', 'poor', 'critical'];
      const housingCondition = data.shelter_assistance.housing_condition || '';
      
      // Validate housing type
      const validHousingTypes = ['owned', 'rented', 'temporary', 'shelter', 'other'];
      const housingType = data.shelter_assistance.type_of_housing || '';
      
      // Validate and normalize number of rooms
      const numberOfRooms = Math.max(0, Number(data.shelter_assistance.number_of_rooms) || 0);
      
      assistanceDetails.push({
        individual_id: '',
        assistance_type: 'shelter_assistance',
        details: normalizeAssistanceData({
          type_of_housing: validHousingTypes.includes(housingType) ? housingType : null,
          housing_condition: validHousingConditions.includes(housingCondition) ? housingCondition : null,
          number_of_rooms: numberOfRooms,
          household_appliances: hasArrayValues(data.shelter_assistance.household_appliances)
            ? data.shelter_assistance.household_appliances
            : []
        }, 'shelter_assistance')
      });
    }

    return assistanceDetails;
  }

  /**
   * Updates assistance details for an individual
   * @throws IndividualError if the update fails
   */
  static async updateAssistanceDetails(
    supabase: any,
    individualId: string,
    data: IndividualFormData
  ): Promise<void> {
    try {
      // Get existing assistance details for comparison
      const { data: existingDetails, error: fetchError } = await supabase
        .from('assistance_details')
        .select('*')
        .eq('individual_id', individualId);

      if (fetchError) throw fetchError;

      // Normalize new assistance details
      const normalizedDetails = this.normalizeAssistanceDetails(data);
      normalizedDetails.forEach(detail => detail.individual_id = individualId);

      // If we have existing details and no new details, delete all
      if (existingDetails?.length > 0 && normalizedDetails.length === 0) {
        const { error: deleteError } = await supabase
          .from('assistance_details')
          .delete()
          .eq('individual_id', individualId);

        if (deleteError) throw deleteError;
      }
      // If we have new details, replace all existing ones
      else if (normalizedDetails.length > 0) {
        // Delete existing
        if (existingDetails?.length > 0) {
          const { error: deleteError } = await supabase
            .from('assistance_details')
            .delete()
            .eq('individual_id', individualId);

          if (deleteError) throw deleteError;
        }

        // Insert new
        const { error: insertError } = await supabase
          .from('assistance_details')
          .insert(normalizedDetails);

        if (insertError) throw insertError;
      }
    } catch (error) {
      console.error('Error updating assistance details:', error);
      throw new IndividualError(
        'assistance-update-failed',
        'Failed to update assistance details',
        error
      );
    }
  }
}

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

    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new IndividualError('auth-error', 'Authentication required', null);
    }

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

    // Handle family creation or selection
    let familyId = data.family_id;
    
    if (!familyId && data.new_family_name) {
      console.log('Creating new family:', data.new_family_name);
      
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: data.new_family_name,
          district: data.district,
          phone: data.phone || '',
          address: data.address || '',
          status: 'green'
        }])
        .select();
        
      if (familyError) {
        console.error('Family creation error details:', familyError);
        throw new IndividualError('family-creation-failed', 'Failed to create family: ' + familyError.message, familyError);
      }
      
      if (!newFamily || newFamily.length === 0) {
        throw new IndividualError('family-creation-failed', 'Family was created but no data was returned', null);
      }
      
      familyId = newFamily[0].id;
      console.log('Successfully created new family with ID:', familyId);
    }
  
    // Create individual record
    const individualData = {
      first_name: data.first_name,
      last_name: data.last_name,
      id_number: data.id_number,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      marital_status: data.marital_status,
      phone: data.phone || null,
      address: data.address || null,
      district: data.district,
      description: data.description || null,
      job: data.job || null,
      employment_status: data.employment_status,
      salary: data.salary || null,
      list_status: data.list_status,
      family_id: familyId,
      created_by: user.id
    };

    const { data: newIndividual, error } = await supabase
      .from('individuals')
      .insert([individualData])
      .select()
      .single();

    if (error) {
      // If individual creation fails and we created a new family, clean up
      if (familyId && !data.family_id) {
        await supabase.from('families').delete().eq('id', familyId);
      }
      throw new IndividualError('creation-failed', 'Failed to create individual', error);
    }

    if (!newIndividual) {
      throw new IndividualError('creation-failed', 'Individual was created but no data was returned', null);
    }

    // Add hashtags to the individual if specified
    if (data.hashtags && data.hashtags.length > 0) {
      for (const hashtag of data.hashtags) {
        await addHashtagToAll(hashtag, [newIndividual.id]);
      }
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
      try {
        const childPromises = data.children.map(async (child) => {
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
              family_id: familyId
            }])
            .select()
            .single();

          if (childError) {
            throw new IndividualError('child-creation-failed', 'Failed to create child', childError);
          }

          return newChild;
        });

        await Promise.all(childPromises);
      } catch (error) {
        console.error('Failed to create children:', error);
        // Clean up on child creation failure
        await supabase.from('individuals').delete().eq('id', newIndividual.id);
        if (!data.family_id) {
          await supabase.from('families').delete().eq('id', familyId);
        }
        throw error;
      }
    }

    // Handle assistance details creation
    const assistanceDetails = AssistanceDetailsHandler.normalizeAssistanceDetails(data);
    if (assistanceDetails.length > 0) {
      // Set the individual_id for each assistance detail
      assistanceDetails.forEach(detail => detail.individual_id = newIndividual.id);
      
      const { error: assistanceError } = await supabase
        .from('assistance_details')
        .insert(assistanceDetails);

      if (assistanceError) {
        console.error('Error creating assistance details:', assistanceError);
        throw new IndividualError('assistance-creation-failed', 'Failed to create assistance details', assistanceError);
      }
    }

    // Create Google Drive folder
    try {
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
      }
    } catch (driveError) {
      console.error('Error creating Google Drive folder:', driveError);
      // Don't throw here, as the individual was created successfully
    }

    return newIndividual;
  } catch (error) {
    console.error('Individual creation failed:', error);
    throw error;
  }
}

export async function updateIndividual(id: string, data: IndividualFormData) {
  try {
    // Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new IndividualError('auth-error', 'Authentication required', null);
    }
    
    // Handle family creation or selection
    let familyId = data.family_id;
    
    if (!familyId && data.new_family_name) {
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert([{
          name: data.new_family_name,
          district: data.district,
          phone: data.phone || '',
          address: data.address || '',
          status: 'green'
        }])
        .select();
        
      if (familyError) {
        throw new IndividualError('family-update-failed', 'Failed to create family', familyError);
      }
      
      if (newFamily && newFamily.length > 0) {
        familyId = newFamily[0].id;
      }
    }
    
    // Update individual record
    const individualData = {
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
      list_status: data.list_status
    };

    const { error } = await supabase
      .from('individuals')
      .update(individualData)
      .eq('id', id);

    if (error) {
      throw new IndividualError('update-failed', 'Failed to update individual', error);
    }

    // Update hashtags if specified
    if (data.hashtags && data.hashtags.length > 0) {
      // First, delete existing hashtag associations
      const { error: hashtagDeleteError } = await supabase
        .from('individual_hashtags')
        .delete()
        .eq('individual_id', id);
        
      if (hashtagDeleteError) {
        console.error('Error deleting existing hashtags:', hashtagDeleteError);
      }
      
      // Then add the new hashtags
      for (const hashtag of data.hashtags) {
        await addHashtagToAll(hashtag, [id]);
      }
    }

    // Update family membership if family changed
    if (familyId) {
      // Get the current family_id of the individual
      const { data: currentIndividual } = await supabase
        .from('individuals')
        .select('family_id')
        .eq('id', id)
        .single();
      
      // Only remove from old family if they're changing families
      if (currentIndividual && currentIndividual.family_id && currentIndividual.family_id !== familyId) {
        // Check if they're the only parent in their current family
        const { data: familyParents, error: parentsCheckError } = await supabase
          .from('family_members')
          .select('individual_id')
          .eq('family_id', currentIndividual.family_id)
          .eq('role', 'parent');
          
        if (parentsCheckError) {
          console.error('Error checking family parents:', parentsCheckError);
        }
        
        // If they are the only parent, don't remove them from the family
        // This avoids violating the "at least one parent" constraint
        if (!familyParents || familyParents.length > 1) {
          // Safe to remove - there are other parents
          const { error: deleteError } = await supabase
        .from('family_members')
        .delete()
        .eq('individual_id', id);

          if (deleteError) {
            console.error('Error removing from previous family:', deleteError);
          }
        } else {
          console.log('Skipping family_members removal - individual is the only parent in family');
        }
      }

      // Check if the record already exists before inserting
      const { data: existingMember, error: checkError } = await supabase
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .eq('individual_id', id)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing family member:', checkError);
      }

      if (!existingMember) {
        // Add to new family only if not already a member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert([{
          family_id: familyId,
          individual_id: id,
          role: 'parent'
        }]);

      if (memberError) {
          console.error('Family member insert error details:', memberError);
        throw new IndividualError('family-member-update-failed', 'Failed to update family membership', memberError);
        }
      }
    }

    // Update children
    if (data.children && data.children.length > 0 && familyId) {
      // First verify the family exists
      const { data: familyCheck, error: familyCheckError } = await supabase
        .from('families')
        .select('id')
        .eq('id', familyId)
        .single();
        
      if (familyCheckError || !familyCheck) {
        console.error('Family does not exist or cannot be accessed:', {
          error: familyCheckError,
          familyId
        });
        throw new IndividualError('family-not-found', 'The specified family could not be found or accessed', familyCheckError);
      }
      
      // First find existing children from the children table
      const { data: existingChildren, error: existingChildrenError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', id);
        
      if (existingChildrenError) {
        console.error('Error fetching existing children:', existingChildrenError);
      }
      
      const childrenIds = existingChildren?.map(c => c.id) || [];

      // Delete existing children
      if (childrenIds.length > 0) {
        const { error: deleteChildrenError } = await supabase
          .from('children')
        .delete()
        .in('id', childrenIds);
          
        if (deleteChildrenError) {
          console.error('Error deleting children:', deleteChildrenError);
        }
      }

      // Then insert new children
      const childPromises = data.children.map(async (child) => {
        try {
          // Log the child data for debugging
          console.log('Attempting to create child with data:', {
            ...child,
            parent_id: id,
            family_id: familyId
          });
          
          // Check if a child with this name already exists in the family
          const { data: existingChild, error: existingChildError } = await supabase
            .from('children')
            .select('id')
            .eq('family_id', familyId)
            .eq('first_name', child.first_name)
            .eq('last_name', child.last_name)
            .maybeSingle();
            
          if (existingChildError) {
            console.error('Error checking existing child:', existingChildError);
          }
          
          if (existingChild) {
            console.warn('Child already exists in this family:', {
              child_name: `${child.first_name} ${child.last_name}`,
              family_id: familyId
            });
            throw new IndividualError(
              'child-duplicate', 
              `A child named ${child.first_name} ${child.last_name} already exists in this family`, 
              null
            );
          }
          
          // Create child record using the children table
        const { data: newChild, error: childError } = await supabase
            .from('children')
          .insert([{
            first_name: child.first_name,
            last_name: child.last_name,
            date_of_birth: child.date_of_birth,
            gender: child.gender,
              description: child.description || null,
              parent_id: id, // Set parent_id to the current individual
            family_id: familyId,
            created_by: user.id
          }])
          .select()
          .single();

        if (childError) {
            console.error('Error creating child - DETAILED ERROR:', {
              message: childError.message,
              details: childError.details,
              hint: childError.hint,
              code: childError.code,
              childData: {
                first_name: child.first_name,
                last_name: child.last_name,
                gender: child.gender,
                parent_id: id,
                family_id: familyId
              }
            });
            throw new IndividualError('child-update-failed', `Failed to update child: ${childError.message || 'Unknown error'}`, childError);
        }

        return newChild;
        } catch (error: any) {
          console.error('Error in child creation process - FULL DETAILS:', {
            errorType: error?.constructor?.name,
            message: error?.message,
            code: error?.code,
            details: error?.details,
            childData: {
              first_name: child.first_name,
              last_name: child.last_name,
              gender: child.gender,
              parent_id: id,
              family_id: familyId
            }
          });
          throw error;
        }
      });

      try {
        await Promise.all(childPromises);
      } catch (error: any) {
        console.error('Failed to update children - DETAILED ERROR:', {
          errorType: error?.constructor?.name,
          message: error?.message,
          code: error?.code,
          details: error?.details,
          stack: error?.stack
        });
        
        // Clean up on child creation failure
        await supabase.from('individuals').delete().eq('family_id', familyId);
        await supabase.from('family_members').delete().eq('family_id', familyId);
        if (!data.family_id) {
          await supabase.from('families').delete().eq('id', familyId);
        }
        
        throw error;
      }
    }

    // Handle assistance details update
    const hasAssistanceData = data.medical_help || 
                            data.food_assistance || 
                            data.marriage_assistance || 
                            data.debt_assistance || 
                            data.education_assistance || 
                            data.shelter_assistance;

    if (hasAssistanceData) {
      await AssistanceDetailsHandler.updateAssistanceDetails(supabase, id, data);
    }

    return id;
  } catch (error: any) {
    console.error('Error updating individual - DETAILED ERROR:', {
      errorType: error?.constructor?.name,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      stack: error?.stack
    });
    
    // If it's already an IndividualError, just rethrow it
    if (error instanceof IndividualError) {
    throw error;
    }
    
    // Otherwise, create a new one with a more descriptive message
    throw new IndividualError(
      'update-failed', 
      `Failed to update individual: ${error?.message || 'Unknown error'}`, 
      error
    );
  }
}

export async function deleteIndividual(id: string) {
  try {
    // Start a transaction
    const { error: beginError } = await supabase.rpc('begin_transaction');
    if (beginError) {
      throw new IndividualError('transaction-failed', 'Failed to start transaction', beginError);
    }

    try {
      // Check if they're the only parent in their family
      const { data: individual, error: individualError } = await supabase
        .from('individuals')
        .select('family_id')
        .eq('id', id)
        .single();
        
      if (individualError) {
        throw new IndividualError('fetch-failed', 'Failed to fetch individual', individualError);
      }
        
      if (individual?.family_id) {
        const { data: familyParents, error: parentsError } = await supabase
          .from('family_members')
          .select('individual_id')
          .eq('family_id', individual.family_id)
          .eq('role', 'parent');
          
        if (parentsError) {
          throw new IndividualError('fetch-failed', 'Failed to fetch family parents', parentsError);
        }
          
        if (familyParents && familyParents.length <= 1) {
          // This is the only parent, delete the whole family
          console.warn('Deleting the only parent in family:', individual.family_id);
          
          // Delete all family members
          const { error: membersDeleteError } = await supabase
            .from('family_members')
            .delete()
            .eq('family_id', individual.family_id);
            
          if (membersDeleteError) {
            throw new IndividualError('deletion-failed', 'Failed to delete family members', membersDeleteError);
          }
          
          // Delete the family
          const { error: familyDeleteError } = await supabase
            .from('families')
            .delete()
            .eq('id', individual.family_id);
            
          if (familyDeleteError) {
            throw new IndividualError('deletion-failed', 'Failed to delete family', familyDeleteError);
          }
        }
      }
      
      // Delete related records first
      const { error: assistanceError } = await supabase
        .from('assistance_details')
        .delete()
        .eq('individual_id', id);
        
      if (assistanceError) {
        throw new IndividualError('deletion-failed', 'Failed to delete assistance details', assistanceError);
      }
      
      const { error: hashtagsError } = await supabase
        .from('individual_hashtags')
        .delete()
        .eq('individual_id', id);
        
      if (hashtagsError) {
        throw new IndividualError('deletion-failed', 'Failed to delete hashtags', hashtagsError);
      }
      
      const { error: membersError } = await supabase
        .from('family_members')
        .delete()
        .eq('individual_id', id);
        
      if (membersError) {
        throw new IndividualError('deletion-failed', 'Failed to delete family membership', membersError);
      }
      
      const { error: childrenError } = await supabase
        .from('children')
        .delete()
        .eq('parent_id', id);
        
      if (childrenError) {
        throw new IndividualError('deletion-failed', 'Failed to delete children', childrenError);
      }
      
      // Finally delete the individual
      const { error } = await supabase
        .from('individuals')
        .delete()
        .eq('id', id);

      if (error) {
        throw new IndividualError('deletion-failed', 'Failed to delete individual', error);
      }
      
      // Commit the transaction
      const { error: commitError } = await supabase.rpc('commit_transaction');
      if (commitError) {
        throw new IndividualError('transaction-failed', 'Failed to commit transaction', commitError);
      }
      
      return true;
    } catch (error) {
      // Rollback on any error
      const { error: rollbackError } = await supabase.rpc('rollback_transaction');
      if (rollbackError) {
        console.error('Failed to rollback transaction:', rollbackError);
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof IndividualError) {
      throw error;
    }
    throw new IndividualError('unexpected', 'An unexpected error occurred while deleting the individual', error);
  }
}

/**
 * Fetch an individual by ID with all related information
 */
export async function getIndividual(id: string) {
  try {
    console.log('Fetching individual with ID:', id);
    // Get individual with basic info including needs and distributions
    const { data: individual, error } = await supabase
      .from('individuals')
      .select(`
        *,
        needs (*),
        distributions: distribution_recipients (
          id,
          distribution_id,
          quantity_received,
          value_received,
          notes,
          distribution:distributions (
            id,
            date,
            aid_type,
            description,
            value,
            quantity,
            status
          )
        ),
        created_by_user:users!individuals_created_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error in getIndividual initial query:', error);
      throw new IndividualError('fetch-failed', 'Failed to fetch individual', error);
    }

    if (!individual) {
      console.log('No individual found with ID:', id);
      return null;
    }

    console.log('Successfully fetched individual. Now getting related data.');

    // Restructure distributions for easier consumption
    const distributionsData = individual.distributions
      .filter((dr: any) => dr.distribution)
      .map((dr: any) => ({
        id: dr.distribution_id,
        date: dr.distribution.date,
        aid_type: dr.distribution.aid_type,
        description: dr.distribution.description,
        quantity: dr.quantity_received,
        value: dr.value_received,
        notes: dr.notes,
        status: dr.distribution.status
      }));
    
    // Fetch assistance details
    const { data: assistanceDetails, error: assistanceError } = await supabase
      .from('assistance_details')
      .select('*')
      .eq('individual_id', id);

    if (assistanceError) {
      console.error('Error fetching assistance details:', assistanceError);
    }

    // Transform assistance details into the expected format
    const transformedAssistanceDetails = assistanceDetails?.reduce((acc: any, detail: any) => {
      if (detail.details) {
        switch (detail.assistance_type) {
          case 'medical_help':
            acc.medical_help = {
              type_of_medical_assistance_needed: Array.isArray(detail.details.type_of_medical_assistance_needed) 
                ? detail.details.type_of_medical_assistance_needed 
                : [],
              medication_distribution_frequency: detail.details.medication_distribution_frequency ?? null,
              estimated_cost_of_treatment: detail.details.estimated_cost_of_treatment ?? null,
              health_insurance_coverage: detail.details.health_insurance_coverage === true,
              additional_details: detail.details.additional_details ?? null
            };
            break;
          case 'food_assistance':
            acc.food_assistance = {
              type_of_food_assistance_needed: Array.isArray(detail.details.type_of_food_assistance_needed)
                ? detail.details.type_of_food_assistance_needed
                : [],
              food_supply_card: detail.details.food_supply_card === true
            };
            break;
          case 'marriage_assistance':
            acc.marriage_assistance = {
              marriage_support_needed: detail.details.marriage_support_needed === true,
              wedding_contract_signed: detail.details.wedding_contract_signed === true,
              wedding_date: detail.details.wedding_date ?? null,
              specific_needs: detail.details.specific_needs ?? null
            };
            break;
          case 'debt_assistance':
            acc.debt_assistance = {
              needs_debt_assistance: detail.details.needs_debt_assistance === true,
              debt_amount: detail.details.debt_amount ?? 0,
              household_appliances: detail.details.household_appliances === true,
              hospital_bills: detail.details.hospital_bills === true,
              education_fees: detail.details.education_fees === true,
              business_debt: detail.details.business_debt === true,
              other_debt: detail.details.other_debt === true
            };
            break;
          case 'education_assistance':
            acc.education_assistance = {
              family_education_level: detail.details.family_education_level ?? null,
              desire_for_education: detail.details.desire_for_education ?? null,
              children_educational_needs: Array.isArray(detail.details.children_educational_needs)
                ? detail.details.children_educational_needs
                : []
            };
            break;
          case 'shelter_assistance':
            acc.shelter_assistance = {
              type_of_housing: detail.details.type_of_housing ?? null,
              housing_condition: detail.details.housing_condition ?? null,
              number_of_rooms: detail.details.number_of_rooms ?? 0,
              household_appliances: Array.isArray(detail.details.household_appliances)
                ? detail.details.household_appliances
                : []
            };
            break;
        }
      }
      return acc;
    }, {});

    console.log('Fetching children from the children table');
    // Fetch children from the children table
    const { data: children, error: childrenError } = await supabase
      .from('children')
      .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
        gender,
        description,
        school_stage
      `)
      .eq('parent_id', id);

    if (childrenError) {
      console.error('Error fetching children:', childrenError);
    }

    console.log('All data fetched successfully');

    // Return the complete individual data
    return {
      ...individual,
      distributions: distributionsData,
      ...transformedAssistanceDetails, // Spread the transformed assistance details
      assistance_details: assistanceDetails || [], // Keep the original array for reference
      children: children || [],
    };
  } catch (error) {
    console.error('Error fetching individual:', error);
    if (error instanceof IndividualError) {
      throw error;
    }
    throw new IndividualError('unexpected', 'An unexpected error occurred while fetching the individual', error);
  }
}