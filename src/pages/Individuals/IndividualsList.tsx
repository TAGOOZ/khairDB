import React, { useState, useCallback } from 'react';
    import { Individual } from '../../types';
    import { formatDate } from '../../utils/formatters';
    import { NeedsBadge } from '../../components/NeedsBadge';
    import { Pencil, Trash2, Eye, Printer } from 'lucide-react';
    import { Button } from '../../components/ui/Button';
    import { printIndividualsToCSV, downloadCSV } from '../../utils/print';
    
    interface IndividualsListProps {
      individuals: Individual[];
      onEdit: (individual: Individual) => void;
      onDelete: (id: string) => void;
      onView: (individual: Individual) => void;
      userRole?: 'admin' | 'user';
      selectedForDistribution: string[];
      setSelectedForDistribution: (ids: string[]) => void;
    }
    
    export function IndividualsList({ individuals, onEdit, onDelete, onView, userRole, selectedForDistribution, setSelectedForDistribution }: IndividualsListProps) {
      const handleCheckboxChange = (id: string) => {
        setSelectedForDistribution((prevSelected) => {
          if (prevSelected.includes(id)) {
            return prevSelected.filter((selectedId) => selectedId !== id);
          } else {
            return [...prevSelected, id];
          }
        });
      };
    
      const handleSelectAll = () => {
        if (selectedForDistribution.length === individuals.length) {
          setSelectedForDistribution([]);
        } else {
          setSelectedForDistribution(individuals.map(individual => individual.id));
        }
      };
    
      const handlePrint = useCallback((format: 'csv') => {
        if (selectedForDistribution.length === 0) {
          alert('Please select at least one individual to print.');
          return;
        }
    
        const selected = individuals.filter(individual => selectedForDistribution.includes(individual.id));
    
        if (format === 'csv') {
          const csv = printIndividualsToCSV(selected);
          downloadCSV(csv, 'individuals.csv');
        }
      }, [individuals, selectedForDistribution]);
    
      return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedForDistribution.length === individuals.length ? 'Deselect All' : 'Select All'}
              </Button>
              <span className="ml-2 text-sm text-gray-500">
                ({selectedForDistribution.length})
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => handlePrint('csv')}
              >
                Print CSV
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Needs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added by
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {individuals.map((individual) => (
                  <tr key={individual.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedForDistribution.includes(individual.id)}
                          onChange={() => handleCheckboxChange(individual.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-2"
                        />
                        <div className="text-sm font-medium text-gray-900">
                          {individual.first_name} {individual.last_name}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(individual.date_of_birth)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{individual.id_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{individual.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">District {individual.district}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {individual.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1">
                        {individual.needs.map((need) => (
                          <NeedsBadge key={need.id} need={need} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(individual.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {individual.created_by_user ? (
                          `${individual.created_by_user.first_name} ${individual.created_by_user.last_name}`
                        ) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          onClick={() => onView(individual)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          View
                        </Button>
                        {userRole === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Pencil}
                            onClick={() => onEdit(individual)}
                          >
                            Edit
                          </Button>
                        )}
                        {userRole === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => onDelete(individual.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }
