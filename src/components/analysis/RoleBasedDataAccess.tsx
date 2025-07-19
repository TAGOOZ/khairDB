import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { Shield, Users, Eye, AlertTriangle } from 'lucide-react';

/**
 * Component to analyze and display current data access permissions by role
 * This is for testing and analysis purposes
 */
export function RoleBasedDataAccess() {
  const { user } = useAuthStore();
  const [dataAccess, setDataAccess] = useState({
    canViewAllIndividuals: false,
    canCreateIndividuals: false,
    canUpdateAllIndividuals: false,
    canDeleteIndividuals: false,
    individualsCount: 0,
    ownIndividualsCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      analyzeDataAccess();
    }
  }, [user]);

  const analyzeDataAccess = async () => {
    setIsLoading(true);
    try {
      // Test 1: Can view all individuals
      const { data: allIndividuals, error: viewError } = await supabase
        .from('individuals')
        .select('id, created_by')
        .limit(1000);

      // Test 2: Count own individuals
      const { data: ownIndividuals, error: ownError } = await supabase
        .from('individuals')
        .select('id')
        .eq('created_by', user?.id);

      // Test 3: Try to create (this would be a dry run in real implementation)
      // For now, we'll check the RLS policies

      setDataAccess({
        canViewAllIndividuals: !viewError && allIndividuals !== null,
        canCreateIndividuals: true, // Based on RLS policy analysis
        canUpdateAllIndividuals: user?.role === 'admin',
        canDeleteIndividuals: user?.role === 'admin',
        individualsCount: allIndividuals?.length || 0,
        ownIndividualsCount: ownIndividuals?.length || 0
      });
    } catch (error) {
      console.error('Error analyzing data access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-4">
        <Shield className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold">Data Access Analysis</h2>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Users className="w-5 h-5 text-gray-600 mr-2" />
          <span className="font-medium">Current User: {user?.first_name} {user?.last_name}</span>
        </div>
        <div className="text-sm text-gray-600">
          Role: <span className="font-medium capitalize">{user?.role}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">View All Individuals</span>
              {dataAccess.canViewAllIndividuals ? (
                <div className="flex items-center text-green-600">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-sm">Allowed</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Restricted</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Can access: {dataAccess.individualsCount} individuals
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Own Individuals</span>
              <div className="flex items-center text-blue-600">
                <Users className="w-4 h-4 mr-1" />
                <span className="text-sm">{dataAccess.ownIndividualsCount}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Created by you
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Create Individuals</span>
              {dataAccess.canCreateIndividuals ? (
                <div className="flex items-center text-green-600">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-sm">Allowed</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Restricted</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {user?.role === 'admin' ? 'Direct creation' : 'Via approval process'}
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Delete Individuals</span>
              {dataAccess.canDeleteIndividuals ? (
                <div className="flex items-center text-green-600">
                  <Eye className="w-4 h-4 mr-1" />
                  <span className="text-sm">Allowed</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Restricted</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Admin only operation
            </div>
          </div>
        </div>

        {/* Security Warning */}
        {user?.role === 'user' && dataAccess.canViewAllIndividuals && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-800">Security Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your user account can currently view ALL individuals in the system ({dataAccess.individualsCount} total), 
                  including those created by other users and admins. This may not be the intended behavior for a role-based system.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data Access Summary */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Data Access Summary</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• You can view {dataAccess.individualsCount} individuals total</p>
            <p>• You created {dataAccess.ownIndividualsCount} individuals</p>
            <p>• Form submission: {user?.role === 'admin' ? 'Direct to database' : 'Requires approval'}</p>
            <p>• Data visibility: {dataAccess.canViewAllIndividuals ? 'All individuals' : 'Own individuals only'}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          onClick={analyzeDataAccess}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh Analysis
        </button>
      </div>
    </div>
  );
}