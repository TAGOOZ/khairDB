import React from 'react';
    import { NeedCategory, NeedPriority } from '../../types';
    import { SearchInput } from '../search/SearchInput';
    import { Select } from '../ui/Select';
    
    interface NeedFilter {
      category: NeedCategory | '';
      priority: NeedPriority | '';
    }
    
    interface FiltersState {
      search: string;
      district: string;
      needs: NeedFilter[];
      status?: 'green' | 'yellow' | 'red' | '';
      listStatus: 'whitelist' | 'blacklist' | 'waitinglist' | '';
    }
    
    interface IndividualsFilterProps {
      filters: FiltersState;
      onFilterChange: (filters: FiltersState) => void;
    }
    
    export function IndividualsFilter({ filters, onFilterChange }: IndividualsFilterProps) {
      const districts = Array.from({ length: 10 }, (_, i) => ({
        value: `${i + 1}`,
        label: `District ${i + 1}`
      }));
    
      const needCategories = [
        { value: '', label: 'All Categories' },
        { value: 'medical', label: 'Medical' },
        { value: 'financial', label: 'Financial' },
        { value: 'food', label: 'Food' },
        { value: 'shelter', label: 'Shelter' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'education', label: 'Education' },
        { value: 'employment', label: 'Employment' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'other', label: 'Other' }
      ];
    
      const priorityOptions = [
        { value: '', label: 'Any Priority' },
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ];
    
      const addNeedFilter = () => {
        onFilterChange({
          ...filters,
          needs: [...filters.needs, { category: '', priority: '' }]
        });
      };
    
      const removeNeedFilter = (index: number) => {
        const newNeeds = [...filters.needs];
        newNeeds.splice(index, 1);
        onFilterChange({ ...filters, needs: newNeeds });
      };
    
      const updateNeedFilter = (index: number, field: keyof NeedFilter, value: string) => {
        const newNeeds = [...filters.needs];
        newNeeds[index] = {
          ...newNeeds[index],
          [field]: value
        };
        onFilterChange({ ...filters, needs: newNeeds });
      };
    
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchInput
              label="Search"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search by name, ID, phone, or description..."
            />
    
            <Select
              label="District"
              value={filters.district}
              onChange={(e) => onFilterChange({ ...filters, district: e.target.value })}
              options={[
                { value: '', label: 'All Districts' },
                ...districts
              ]}
            />
            <Select
              label="List Status"
              value={filters.listStatus}
              onChange={(e) => onFilterChange({ ...filters, listStatus: e.target.value as 'whitelist' | 'blacklist' | 'waitinglist' | '' })}
              options={[
                { value: '', label: 'All' },
                { value: 'whitelist', label: 'Whitelist' },
                { value: 'blacklist', label: 'Blacklist' },
                { value: 'waitinglist', label: 'Waitinglist' }
              ]}
            />
          </div>
    
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Need Filters</h3>
              <button
                type="button"
                onClick={addNeedFilter}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Add Filter
              </button>
            </div>
    
            {filters.needs.map((need, index) => (
              <div key={index} className="flex gap-4 items-end bg-gray-50 p-3 rounded-lg">
                <div className="flex-1">
                  <Select
                    label="Category"
                    value={need.category}
                    onChange={(e) => updateNeedFilter(index, 'category', e.target.value)}
                    options={needCategories}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    label="Priority"
                    value={need.priority}
                    onChange={(e) => updateNeedFilter(index, 'priority', e.target.value)}
                    options={priorityOptions}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeNeedFilter(index)}
                  className="px-2 py-2 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    }
