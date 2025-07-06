import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { createIndividual, IndividualError } from '../individuals';
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
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    maybeSingle: jest.fn(),
    single: jest.fn()
  }
}));

describe('Individual Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
    
    // Mock database operations to return success
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ 
        data: { id: 'new-individual-id' }, 
        error: null 
      })
    });
  });

  describe('createIndividual', () => {
    it('should create an individual with all types of assistance details', async () => {
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
      const individualId = await createIndividual(testIndividualData);

      // Check authentication was verified
      expect(supabase.auth.getUser).toHaveBeenCalled();

      // Check if it checked for existing individual with same ID
      expect(supabase.from).toHaveBeenCalledWith('individuals');
      expect(supabase.from('individuals').select().eq('id_number', '12345678901234').maybeSingle)
        .toHaveBeenCalled();

      // Verify individual creation
      const createIndividualCall = jest.spyOn(supabase.from('individuals'), 'insert');
      expect(createIndividualCall).toHaveBeenCalledWith([
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          id_number: '12345678901234',
          gender: 'male',
          employment_status: 'no_salary',
          created_by: 'test-user-id'
        })
      ]);

      // Verify assistance details were added
      const assistanceDetailsCalls = jest.spyOn(supabase.from('assistance_details'), 'insert');
      
      // Check medical assistance was inserted
      expect(assistanceDetailsCalls).toHaveBeenCalledWith([
        expect.objectContaining({
          individual_id: 'new-individual-id',
          assistance_type: 'medical_help',
          details: testIndividualData.medical_help
        })
      ]);
      
      // Check food assistance was inserted
      expect(assistanceDetailsCalls).toHaveBeenCalledWith([
        expect.objectContaining({
          individual_id: 'new-individual-id',
          assistance_type: 'food_assistance',
          details: testIndividualData.food_assistance
        })
      ]);
      
      // Check marriage assistance was inserted
      expect(assistanceDetailsCalls).toHaveBeenCalledWith([
        expect.objectContaining({
          individual_id: 'new-individual-id',
          assistance_type: 'marriage_assistance',
          details: testIndividualData.marriage_assistance
        })
      ]);
      
      // Check debt assistance was inserted
      expect(assistanceDetailsCalls).toHaveBeenCalledWith([
        expect.objectContaining({
          individual_id: 'new-individual-id',
          assistance_type: 'debt_assistance',
          details: expect.objectContaining({
            needs_debt_assistance: true,
            debt_amount: 5000,
            hospital_bills: true
          })
        })
      ]);
      
      // Check education assistance was inserted
      expect(assistanceDetailsCalls).toHaveBeenCalledWith([
        expect.objectContaining({
          individual_id: 'new-individual-id',
          assistance_type: 'education_assistance',
          details: testIndividualData.education_assistance
        })
      ]);
      
      // Check shelter assistance was inserted
      expect(assistanceDetailsCalls).toHaveBeenCalledWith([
        expect.objectContaining({
          individual_id: 'new-individual-id',
          assistance_type: 'shelter_assistance',
          details: testIndividualData.shelter_assistance
        })
      ]);

      // Verify the function returns the new individual ID
      expect(individualId).toBe('new-individual-id');
    });

    it('should handle errors when creating an individual', async () => {
      // Mock the supabase.from(...) call to be more specific for the first check
      // Reset the mock first
      (supabase.from as jest.Mock).mockReset();
      
      // Set up the mock to return different behaviors based on the parameters
      (supabase.from as jest.Mock).mockImplementation((table) => {
        if (table === 'individuals') {
          return {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Database error') 
            }),
            single: jest.fn().mockResolvedValue({ 
              data: { id: 'new-individual-id' }, 
              error: null 
            })
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          insert: jest.fn().mockReturnThis(),
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
          single: jest.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          })
        };
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
        children: [],
        debt_assistance: {
          needs_debt_assistance: false,
          debt_amount: 0,
          household_appliances: false,
          hospital_bills: false,
          education_fees: false,
          business_debt: false,
          other_debt: false
        }
      };

      // Execute the function and expect it to throw an error
      await expect(createIndividual(testIndividualData))
        .rejects
        .toThrow(IndividualError);

      // Verify error handling with a separate setup
      const error = await createIndividual(testIndividualData).catch(e => e);
      expect(error).toBeInstanceOf(IndividualError);
      expect(error.code).toBe('check-failed');
      expect(error.message).toBe('Failed to check ID number');
    });
  });
}); 