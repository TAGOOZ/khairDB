import React from 'react';

interface DateRangePickerProps {
  value: {
    start: Date;
    end: Date;
  };
  onChange: (range: { start: Date; end: Date }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex items-center space-x-4">
      <div>
        <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          id="start-date"
          value={value.start.toISOString().split('T')[0]}
          onChange={(e) => onChange({ ...value, start: new Date(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="end-date" className="block text-sm font-medium text-gray-700">
          End Date
        </label>
        <input
          type="date"
          id="end-date"
          value={value.end.toISOString().split('T')[0]}
          onChange={(e) => onChange({ ...value, end: new Date(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>
    </div>
  );
}
