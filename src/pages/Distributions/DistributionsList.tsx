import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, History, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useDistributions } from '../../hooks/useDistributions';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Distribution } from '../../types';
import { DistributionDetails } from './DistributionDetails';
import { deleteDistribution } from '../../services/distributions';
import { toast } from '../Individuals/Toast';

export function DistributionsList() {
  const { distributions, isLoading, refreshDistributions } = useDistributions();
  const [selectedDistribution, setSelectedDistribution] = useState<Distribution | null>(null);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this distribution?')) {
      try {
        await deleteDistribution(id);
        toast.success('Distribution deleted successfully');
        refreshDistributions();
      } catch (error) {
        toast.error('Failed to delete distribution');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Aid Distribution</h1>
        <div className="flex space-x-4">
          <Link to="/distributions/history">
            <Button variant="outline" icon={History}>
              View History
            </Button>
          </Link>
          <Link to="/distributions/create">
            <Button icon={Package}>
              Create Distribution
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aid Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {distributions.map((distribution) => (
                  <tr key={distribution.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(distribution.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {distribution.aid_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {distribution.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {distribution.recipients.length} recipients
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(distribution.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => setSelectedDistribution(distribution)}
                        >
                          View
                        </Button>
                        <Link to={`/distributions/edit/${distribution.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDelete(distribution.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedDistribution && (
        <DistributionDetails
          distribution={selectedDistribution}
          onClose={() => setSelectedDistribution(null)}
        />
      )}
    </div>
  );
}
