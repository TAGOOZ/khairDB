/**
 * @jest-environment jsdom
 */
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { updateIndividual } from '../individuals';
import { IndividualFormData } from '../../schemas/individualSchema';

// Mock supabase client
const mockSupabaseOperations = {
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  single: jest.fn(),
  maybeSingle: jest.fn()
};

const mockSupabase = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn().mockReturnValue(mockSupabaseOperations),
};

jest.mock('../../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock Google Drive API
jest.mock('../../api/googleDrive', () => ({
  createIndividualFolderAPI: jest.fn()
}));

// Mock hashtags service
jest.mock('../hashtags', () => ({
  addHashtagToAll: jest.fn()
}));

describe('Child Duplication Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });

    // Reset all mock implementations
    Object.values(mockSupabaseOperations).forEach(mock => {
      if (typeof mock === 'function') {
        mock.mockReturnThis?.();
      }
    });
  });

  describe('updateIndividual with children', () => {
    it('should preserve existing child IDs and not duplicate children', async () => {
      // Mock existing children in database
      mockSupabaseOperations.select.mockImplementation((fields: string) => {
        if (fields === 'id') {
          // Return existing children IDs when querying children table
          return {
            ...mockSupabaseOperations,
            eq: jest.fn().mockResolvedValue({
              data: [{ id: 'existing-child-1' }, { id: 'existing-child-2' }],
              error: null
            })
          };
        }
        if (fields === 'family_id') {
          // Return individual family info when querying individuals table
          return {
            ...mockSupabaseOperations,
            single: jest.fn().mockResolvedValue({
              data: { family_id: 'test-family-id' },
              error: null
            })
          };
        }
        return mockSupabaseOperations;
      });

      // Mock successful updates and inserts
      mockSupabaseOperations.update.mockResolvedValue({ error: null });
      mockSupabaseOperations.insert.mockResolvedValue({ error: null });
      mockSupabaseOperations.delete.mockResolvedValue({ error: null });
      mockSupabaseOperations.maybeSingle.mockResolvedValue({ data: null, error: null });

      // Prepare test data with existing child (has ID) and new child (no ID)
      const updateData: Partial<IndividualFormData> = {
        first_name: 'John',
        last_name: 'Doe',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'married',
        district: 'Test District',
        employment_status: 'has_salary',
        list_status: 'whitelist',
        family_id: 'test-family-id',
        children: [
          {
            id: 'existing-child-1', // Existing child with ID
            first_name: 'Alice',
            last_name: 'Doe',
            date_of_birth: '2010-01-01',
            gender: 'girl',
            school_stage: 'primary',
            description: 'Updated description'
          },
          {
            // New child without ID
            first_name: 'Bob',
            last_name: 'Doe',
            date_of_birth: '2012-01-01',
            gender: 'boy',
            school_stage: 'kindergarten',
            description: 'New child'
          }
        ]
      };

      // Execute update
      await updateIndividual('test-individual-id', updateData as IndividualFormData);

      // Verify that the existing child was updated (not duplicated)
      expect(mockSupabaseOperations.update).toHaveBeenCalledWith({
        first_name: 'Alice',
        last_name: 'Doe',
        date_of_birth: '2010-01-01',
        gender: 'girl',
        school_stage: 'primary',
        description: 'Updated description',
        parent_id: 'test-individual-id',
        family_id: 'test-family-id'
      });

      // Verify that the new child was inserted
      expect(mockSupabaseOperations.insert).toHaveBeenCalledWith([{
        first_name: 'Bob',
        last_name: 'Doe',
        date_of_birth: '2012-01-01',
        gender: 'boy',
        school_stage: 'kindergarten',
        description: 'New child',
        parent_id: 'test-individual-id',
        family_id: 'test-family-id',
        created_by: 'test-user-id'
      }]);

      // Verify that children not in the submitted list were deleted
      expect(mockSupabaseOperations.delete).toHaveBeenCalled();
    });

    it('should log warning when children without IDs are submitted while existing children exist', async () => {
      // Mock console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Mock existing children in database
      mockSupabaseOperations.select.mockImplementation((fields: string) => {
        if (fields === 'id') {
          return {
            ...mockSupabaseOperations,
            eq: jest.fn().mockResolvedValue({
              data: [{ id: 'existing-child-1' }],
              error: null
            })
          };
        }
        if (fields === 'family_id') {
          return {
            ...mockSupabaseOperations,
            single: jest.fn().mockResolvedValue({
              data: { family_id: 'test-family-id' },
              error: null
            })
          };
        }
        return mockSupabaseOperations;
      });

      mockSupabaseOperations.update.mockResolvedValue({ error: null });
      mockSupabaseOperations.insert.mockResolvedValue({ error: null });
      mockSupabaseOperations.maybeSingle.mockResolvedValue({ data: null, error: null });

      // Prepare test data with children missing IDs (simulating frontend bug)
      const updateData: Partial<IndividualFormData> = {
        first_name: 'John',
        last_name: 'Doe',
        id_number: '12345678901234',
        date_of_birth: '1990-01-01',
        gender: 'male',
        marital_status: 'married',
        district: 'Test District',
        employment_status: 'has_salary',
        list_status: 'whitelist',
        family_id: 'test-family-id',
        children: [
          {
            // Child without ID - this should trigger warning
            first_name: 'Alice',
            last_name: 'Doe',
            date_of_birth: '2010-01-01',
            gender: 'girl',
            school_stage: 'primary'
          }
        ]
      };

      // Execute update
      await updateIndividual('test-individual-id', updateData as IndividualFormData);

      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Child duplication risk detected: Frontend submitted children without IDs while children exist in database',
        expect.objectContaining({
          childrenWithoutIds: ['Alice Doe'],
          existingChildrenCount: 1,
          individualId: 'test-individual-id'
        })
      );

      consoleSpy.mockRestore();
    });
  });
});