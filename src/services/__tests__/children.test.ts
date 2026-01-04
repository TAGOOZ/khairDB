import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { deleteChild } from '../children';
import { ServiceError } from '../../utils/errors';
import { supabase } from '../../lib/supabase';

// Mock supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  }
}));

describe('Children Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock database operations to return success
    (supabase.from as jest.Mock).mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis().mockResolvedValue({ 
        data: null, 
        error: null 
      })
    });
  });

  describe('deleteChild', () => {
    it('should successfully delete a child from database', async () => {
      const childId = 'test-child-id';
      
      // Execute the function
      await deleteChild(childId);
      
      // Verify the correct supabase calls were made
      expect(supabase.from).toHaveBeenCalledWith('children');
    });

    it('should throw ServiceError when deletion fails', async () => {
      const childId = 'test-child-id';
      const mockError = new Error('Database error');
      
      // Mock the deletion to fail
      (supabase.from as jest.Mock).mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis().mockResolvedValue({ 
          data: null, 
          error: mockError 
        })
      });
      
      // Execute the function and expect it to throw
      await expect(deleteChild(childId))
        .rejects
        .toThrow(ServiceError);
    });

    it('should handle unexpected errors', async () => {
      const childId = 'test-child-id';
      
      // Mock supabase to throw an unexpected error
      (supabase.from as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });
      
      // Execute the function and expect it to throw
      await expect(deleteChild(childId))
        .rejects
        .toThrow(ServiceError);
    });
  });
});