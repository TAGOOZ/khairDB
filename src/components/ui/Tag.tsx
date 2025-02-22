import React from 'react';

interface TagProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}

export function Tag({ label, selected = false, onClick, className = '' }: TagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-sm
        ${selected 
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
        }
        transition-colors duration-200
        ${className}
      `}
    >
      {label}
    </button>
  );
} 