import React from 'react';
import { RoleBasedDataAccess } from '../components/analysis/RoleBasedDataAccess';
import { useAuthStore } from '../store/authStore';
import { Shield, AlertTriangle, CheckCircle, Info } from 'lucide-react';

/**
 * Security Analysis page to test and display current permission system
 * This page helps identify potential security issues with role-based access
 */
export function SecurityAnalysis() {
  const { user } = useAuthStore();

  const securityIssues = [
    {
      id: 1,
      severity: 'high',
      title: 'User Role Can View All Individuals',
      description: 'Users with "user" role can currently view ALL individuals in the system, including those created by other users and admins.',
      impact: 'Privacy violation, unauthorized data access',
      recommendation: 'Implement RLS policy to restrict users to view only their own created individuals'
    },
    {
      id: 2,
      severity: 'medium',
      title: 'No Data Filtering by Creator',
      description: 'The frontend does not filter individuals based on who created them for non-admin users.',
      impact: 'Users can see sensitive information they should not have access to',
      recommendation: 'Add frontend filtering or use role-specific database views'
    },
    {
      id: 3,
      severity: 'low',
      title: 'Inconsistent Permission Model',
      description: 'Form submission requires approval for users, but data viewing is unrestricted.',
      impact: 'Confusing user experience and potential security expectations mismatch',
      recommendation: 'Align data access permissions with submission workflow'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Shield className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Analysis</h1>
          <p className="text-gray-600">Analyze current role-based permissions and data access</p>
        </div>
      </div>

      {/* Current User Info */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Current Session</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">User</div>
            <div className="font-medium">{user?.first_name} {user?.last_name}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Email</div>
            <div className="font-medium">{user?.email}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600">Role</div>
            <div className={`font-medium capitalize ${user?.role === 'admin' ? 'text-green-600' : 'text-blue-600'}`}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Live Data Access Analysis */}
      <RoleBasedDataAccess />

      {/* Security Issues */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Identified Security Issues</h2>
        <div className="space-y-4">
          {securityIssues.map((issue) => (
            <div key={issue.id} className={`p-4 border rounded-lg ${getSeverityColor(issue.severity)}`}>
              <div className="flex items-start space-x-3">
                {getSeverityIcon(issue.severity)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-medium">{issue.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(issue.severity)}`}>
                      {issue.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{issue.description}</p>
                  <div className="text-sm">
                    <div className="mb-1"><strong>Impact:</strong> {issue.impact}</div>
                    <div><strong>Recommendation:</strong> {issue.recommendation}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Security Recommendations</h2>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">Immediate Actions</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Update RLS policies to restrict user data access to their own records</li>
              <li>• Implement frontend role-based filtering</li>
              <li>• Add audit logging for data access</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Long-term Improvements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Implement hierarchical permissions (organization-based access)</li>
              <li>• Add data classification and sensitivity levels</li>
              <li>• Create separate views for different user roles</li>
              <li>• Implement field-level permissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}