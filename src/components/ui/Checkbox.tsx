import React from 'react';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export function Checkbox({ label, checked, onChange, className = '' }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
      />
      <span className="mr-2 text-sm text-gray-700">{label}</span>
    </label>
  );
} 