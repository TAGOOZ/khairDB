import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { createIndividual } from '../individuals';
import { ServiceError } from '../../utils/errors';
import { IndividualFormData } from '../../schemas/individualSchema';
import { supabase } from '../../lib/supabase';

// Mock supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    single: jest.fn(),
    rpc: jest.fn()
  }
}));

// Mock API calls
jest.mock('../../api/googleDrive', () => ({
  createIndividualFolderAPI: jest.fn().mockResolvedValue({
    folderId: 'folder-id',
    folderUrl: 'http://folder.url'
  })
}));

// Mock activity logs
jest.mock('../activityLogs', () => ({
  logActivity: jest.fn().mockResolvedValue(undefined)
}));

describe('Individual Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Mock database operations
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({
        data: { id: 'new-individual-id' },
        error: null
      })
    });

    // Mock RPC
    (supabase.rpc as jest.Mock).mockResolvedValue({
      data: {
        id: 'new-individual-id',
        first_name: 'John',
        last_name: 'Doe',
        id_number: '12345678901234',
        district: 'Test District'
      },
      error: null
    });
  });

  describe('createIndividual', () => {
    it('should create an individual using RPC transaction', async () => {
      // Create test data with all assistance types
      const testIndividualData: IndividualFormData = {
        first_name: 'John',
        last_name: 'Doe',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'single',
        district: 'Test District',
        employment_status: 'no_salary',
        list_status: 'whitelist',
        needs: [],
        additional_members: [],
        children: [],
        // Assistance details
        medical_help: {
          type_of_medical_assistance_needed: ['Medical Checkup', 'Lab Tests'],
          medication_distribution_frequency: 'Monthly',
          estimated_cost_of_treatment: 'Partially',
          health_insurance_coverage: true,
          additional_details: 'Needs regular checkups'
        },
        food_assistance: {
          type_of_food_assistance_needed: ['Ready-made meals'],
          food_supply_card: true
        },
        marriage_assistance: {
          marriage_support_needed: true,
          wedding_contract_signed: false,
          wedding_date: '2023-12-01',
          specific_needs: 'Needs help with wedding expenses'
        },
        debt_assistance: {
          needs_debt_assistance: true,
          debt_amount: 5000,
          household_appliances: false,
          hospital_bills: true,
          education_fees: false,
          business_debt: false,
          other_debt: false
        },
        education_assistance: {
          family_education_level: 'Higher Education',
          desire_for_education: 'University education for children',
          children_educational_needs: ['Tuition Fees', 'Books']
        },
        shelter_assistance: {
          type_of_housing: 'Owned',
          housing_condition: 'Moderate',
          number_of_rooms: 3,
          household_appliances: ['Refrigerator', 'Stove']
        }
      };

      // Execute the function
      const individualRecord = await createIndividual(testIndividualData);

      // Check authentication was verified
      expect(supabase.auth.getUser).toHaveBeenCalled();

      // Check if it checked for existing individual with same ID (still done via standard Select)
      expect(supabase.from).toHaveBeenCalledWith('individuals');
      expect(supabase.from('individuals').select().eq('id_number', '12345678901234').maybeSingle)
        .toHaveBeenCalled();

      // Verify RPC call
      expect(supabase.rpc).toHaveBeenCalledWith('create_individual_transaction', expect.objectContaining({
        p_individual_data: expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          id_number: '12345678901234'
        }),
        p_created_by: 'test-user-id',
        // Check assistance details array presence
        p_assistance_details: expect.arrayContaining([
          expect.objectContaining({ assistance_type: 'medical_help' }),
          expect.objectContaining({ assistance_type: 'food_assistance' }),
          expect.objectContaining({ assistance_type: 'marriage_assistance' }),
          expect.objectContaining({ assistance_type: 'debt_assistance' }),
          expect.objectContaining({ assistance_type: 'education_assistance' }),
          expect.objectContaining({ assistance_type: 'shelter_assistance' })
        ])
      }));

      // Verify function returns the record
      expect(individualRecord.id).toBe('new-individual-id');
    });

    it('should handle RPC errors', async () => {
      // Mock RPC failure
      (supabase.rpc as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'RPC Transaction Failed', code: 'P0001' }
      });

      const testIndividualData: IndividualFormData = {
        first_name: 'John',
        last_name: 'Doe',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'single',
        district: 'Test District',
        employment_status: 'no_salary',
        list_status: 'whitelist',
        needs: [],
        additional_members: [],
        children: []
      };

      // Execute the function and expect it to throw an error
      await expect(createIndividual(testIndividualData))
        .rejects
        .toThrow(ServiceError);

      const error = await createIndividual(testIndividualData).catch(e => e);
      expect(error).toBeInstanceOf(ServiceError);
      expect(error.code).toBe('creation-failed');
    });
  });
}); 