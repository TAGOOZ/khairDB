import React from 'react';

interface RadioOption {
  value: string | boolean;
  label: string;
}

interface RadioGroupProps {
  label: string;
  value?: string | boolean;
  onChange: (value: any) => void;
  options: RadioOption[];
  className?: string;
}

export function RadioGroup({ label, value, onChange, options, className = '' }: RadioGroupProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option.value.toString()} className="inline-flex items-center ml-6">
            <input
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="mr-2 text-sm text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
} 