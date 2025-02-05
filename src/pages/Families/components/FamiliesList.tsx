import React from 'react';
import { Family } from '../../../types';
import { formatDate } from '../../../utils/formatters';
import { Users, Pencil, Trash2, Eye, Phone, MapPin } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface FamiliesListProps {
  families: Family[];
  onEdit: (family: Family) => void;
  onDelete: (id: string) => void;
  onView: (family: Family) => void;
}

export function FamiliesList({ families, onEdit, onDelete, onView }: FamiliesListProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Family Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact Info
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Members
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {families.map((family) => (
            <tr key={family.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => onView(family)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {family.name}
                </button>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {family.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-1" />
                      <span>{family.phone}</span>
                    </div>
                  )}
                  {family.district && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>District {family.district}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 text-gray-400 mr-1" />
                  <span>{family.members?.length || 0} members</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${family.status === 'green' ? 'bg-green-100 text-green-800' :
                    family.status === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'}`}>
                  {family.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(family.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() => onView(family)}
                  >
                    View
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Pencil}
                    onClick={() => onEdit(family)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => onDelete(family.id)}
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
  );
}
