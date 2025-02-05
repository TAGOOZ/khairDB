import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, DollarSign, Users, CheckCircle2 } from 'lucide-react';
import { Distribution } from '../../types';
import { Button } from '../../components/ui/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface DistributionDetailsProps {
  distribution: Distribution;
  onClose: () => void;
}

export function DistributionDetails({ distribution, onClose }: DistributionDetailsProps) {
  const statusColors = {
   
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={onClose}
            >
              Back
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Aid Distribution Details</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[distribution.status]}`}>
                {distribution.status.charAt(0).toUpperCase() + distribution.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Distribution Date</span>
              </div>
              <p className="text-lg text-gray-900">{formatDate(distribution.date)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Aid Type</span>
              </div>
              <p className="text-lg capitalize text-gray-900">{distribution.aid_type}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Total Value</span>
              </div>
              <p className="text-lg text-gray-900">{formatCurrency(distribution.value)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Users className="w-5 h-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Total Recipients</span>
              </div>
              <p className="text-lg text-gray-900">{distribution.recipients.length} people</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
            <p className="text-gray-700">{distribution.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recipients</h3>
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {distribution.recipients.map((recipient) => (
                    <tr key={recipient.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {recipient.individual.first_name} {recipient.individual.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{recipient.quantity_received}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(recipient.value_received)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{recipient.notes || '-'}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
