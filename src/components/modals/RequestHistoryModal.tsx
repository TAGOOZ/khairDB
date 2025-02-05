import React from 'react';
import { X, History, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';
import { PendingRequest } from '../../types';

interface RequestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: PendingRequest[];
}

export function RequestHistoryModal({ isOpen, onClose, history }: RequestHistoryModalProps) {
  if (!isOpen) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={onClose}
            >
              Close
            </Button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
              <History className="w-6 h-6 text-blue-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Request History
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                View all versions and changes made to this request
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {history.map((version, index) => (
              <div
                key={version.id}
                className={`p-4 rounded-lg border ${getStatusColor(version.status)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(version.status)}
                    <span className="text-sm font-medium">
                      Version {version.version}
                      {index === 0 && ' (Original)'}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(version.submitted_at)}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    Submitted by: {version.submitted_by_user?.first_name} {version.submitted_by_user?.last_name}
                  </p>

                  {version.reviewed_by && (
                    <p className="text-sm">
                      Reviewed by: {version.reviewed_by_user?.first_name} {version.reviewed_by_user?.last_name}
                      <span className="ml-2 text-gray-500">
                        ({formatDate(version.reviewed_at!)})
                      </span>
                    </p>
                  )}

                  {version.admin_comment && (
                    <div className="mt-2 p-2 rounded bg-white bg-opacity-50">
                      <p className="text-sm font-medium">Admin Comment:</p>
                      <p className="text-sm">{version.admin_comment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
