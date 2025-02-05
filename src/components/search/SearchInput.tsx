import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function SearchInput({ label, className = '', ...props }: SearchInputProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className={`
            block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md
            leading-5 bg-white placeholder-gray-500 focus:outline-none
            focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500
            focus:border-blue-500 sm:text-sm ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
}
