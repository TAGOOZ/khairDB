import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { createIndividual, updateIndividual, IndividualError } from '../individuals';
import { IndividualFormData } from '../../schemas/individualSchema';
import { supabase } from '../../lib/supabase';

// Mock supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(),
    rpc: jest.fn()
  }
}));

describe('Child Deletion Bug Fix', () => {
  let mockSupabaseQuery: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    (supabase.auth.getUser as jest.MockedFunction<typeof supabase.auth.getUser>).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Create mock query builder
    mockSupabaseQuery = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
      single: jest.fn()
    };

    (supabase.from as jest.MockedFunction<typeof supabase.from>).mockReturnValue(mockSupabaseQuery);
    (supabase.rpc as jest.MockedFunction<typeof supabase.rpc>).mockResolvedValue({ error: null });
  });

  describe('Child deletion on form update', () => {
    it('should delete children that are removed from the form', async () => {
      // Setup: Mock existing individual with children
      const individualId = 'test-individual-id';
      const familyId = 'test-family-id';

      // Mock the individual fetch to return existing family_id
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { family_id: familyId },
        error: null
      });

      // Mock existing children query
      mockSupabaseQuery.select.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: [
            { id: 'child-1', first_name: 'John', last_name: 'Doe' },
            { id: 'child-2', first_name: 'Jane', last_name: 'Doe' },
            { id: 'child-3', first_name: 'Bob', last_name: 'Doe' }
          ],
          error: null
        })
      });

      // Mock other required queries
      mockSupabaseQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabaseQuery.single.mockResolvedValue({ data: null, error: null });

      // Test data: Form now only contains child-1 and child-3 (child-2 was removed)
      const updatedFormData: IndividualFormData = {
        first_name: 'Test',
        last_name: 'Parent',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'married',
        district: 'Test District',
        employment_status: 'no_salary',
        list_status: 'whitelist',
        family_id: familyId,
        needs: [],
        additional_members: [],
        children: [
          {
            id: 'child-1',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '2015-01-01',
            gender: 'boy',
            school_stage: 'primary'
          },
          {
            id: 'child-3', 
            first_name: 'Bob',
            last_name: 'Doe',
            date_of_birth: '2017-01-01',
            gender: 'boy',
            school_stage: 'kindergarten'
          }
        ]
      };

      // Execute the update
      await updateIndividual(individualId, updatedFormData);

      // Verify that child-2 was deleted
      expect(supabase.from).toHaveBeenCalledWith('children');
      
      // Check that delete operation was called
      const deleteCall = mockSupabaseQuery.delete;
      expect(deleteCall).toHaveBeenCalled();
      
      // Verify that the correct child IDs were targeted for deletion
      const inCall = mockSupabaseQuery.in;
      expect(inCall).toHaveBeenCalledWith('id', ['child-2']);
    });

    it('should not delete children when they remain in the form', async () => {
      // Setup: Mock existing individual with children
      const individualId = 'test-individual-id';
      const familyId = 'test-family-id';

      // Mock the individual fetch to return existing family_id
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { family_id: familyId },
        error: null
      });

      // Mock existing children query - same children as in form
      mockSupabaseQuery.select.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: [
            { id: 'child-1', first_name: 'John', last_name: 'Doe' },
            { id: 'child-2', first_name: 'Jane', last_name: 'Doe' }
          ],
          error: null
        })
      });

      // Mock other required queries
      mockSupabaseQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabaseQuery.single.mockResolvedValue({ data: null, error: null });

      // Test data: Form contains all existing children (no deletions)
      const updatedFormData: IndividualFormData = {
        first_name: 'Test',
        last_name: 'Parent',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'married',
        district: 'Test District',
        employment_status: 'no_salary',
        list_status: 'whitelist',
        family_id: familyId,
        needs: [],
        additional_members: [],
        children: [
          {
            id: 'child-1',
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '2015-01-01',
            gender: 'boy',
            school_stage: 'primary'
          },
          {
            id: 'child-2',
            first_name: 'Jane',
            last_name: 'Doe',
            date_of_birth: '2016-01-01',
            gender: 'girl',
            school_stage: 'kindergarten'
          }
        ]
      };

      // Execute the update
      await updateIndividual(individualId, updatedFormData);

      // Verify that no children were deleted (delete should not be called for children table)
      // We'll check this by ensuring the delete with 'in' method wasn't called
      const deleteChain = mockSupabaseQuery.delete().in;
      expect(deleteChain).not.toHaveBeenCalledWith('id', expect.any(Array));
    });

    it('should handle adding new children without deleting existing ones', async () => {
      // Setup: Mock existing individual with one child
      const individualId = 'test-individual-id';
      const familyId = 'test-family-id';

      // Mock the individual fetch to return existing family_id
      mockSupabaseQuery.single.mockResolvedValueOnce({
        data: { family_id: familyId },
        error: null
      });

      // Mock existing children query - one existing child
      mockSupabaseQuery.select.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: [
            { id: 'child-1', first_name: 'John', last_name: 'Doe' }
          ],
          error: null
        })
      });

      // Mock other required queries
      mockSupabaseQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabaseQuery.single.mockResolvedValue({ data: null, error: null });

      // Test data: Form contains existing child plus a new one (no ID)
      const updatedFormData: IndividualFormData = {
        first_name: 'Test',
        last_name: 'Parent',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'married',
        district: 'Test District',
        employment_status: 'no_salary',
        list_status: 'whitelist',
        family_id: familyId,
        needs: [],
        additional_members: [],
        children: [
          {
            id: 'child-1', // Existing child
            first_name: 'John',
            last_name: 'Doe',
            date_of_birth: '2015-01-01',
            gender: 'boy',
            school_stage: 'primary'
          },
          {
            // New child (no ID)
            first_name: 'Jane',
            last_name: 'Doe',
            date_of_birth: '2016-01-01',
            gender: 'girl',
            school_stage: 'kindergarten'
          }
        ]
      };

      // Execute the update
      await updateIndividual(individualId, updatedFormData);

      // Verify that no children were deleted
      const deleteCall = mockSupabaseQuery.delete;
      expect(deleteCall).not.toHaveBeenCalledWith();

      // Verify that the new child was inserted
      const insertCall = mockSupabaseQuery.insert;
      expect(insertCall).toHaveBeenCalledWith([
        expect.objectContaining({
          first_name: 'Jane',
          last_name: 'Doe',
          parent_id: individualId,
          family_id: familyId
        })
      ]);
    });
  });
});