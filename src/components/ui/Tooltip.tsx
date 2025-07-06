import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
}

export function Tooltip({ content, position = 'top', children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionStyles = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-2',
  };

  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="cursor-help inline-flex"
      >
        {children || <HelpCircle className="w-4 h-4 text-gray-400" />}
      </div>
      
      {isVisible && (
        <div 
          role="tooltip"
          className={`
            absolute z-10 px-3 py-2 text-sm font-medium text-white 
            bg-gray-900 rounded-lg shadow-sm opacity-100 w-max max-w-xs
            ${positionStyles[position]}
          `}
        >
          {content}
          <div 
            className={`
              absolute w-2 h-2 bg-gray-900 transform rotate-45
              ${position === 'top' ? 'top-full -translate-y-1 left-1/2 -translate-x-1/2' : ''}
              ${position === 'bottom' ? 'bottom-full translate-y-1 left-1/2 -translate-x-1/2' : ''}
              ${position === 'left' ? 'left-full -translate-x-1 top-1/2 -translate-y-1/2' : ''}
              ${position === 'right' ? 'right-full translate-x-1 top-1/2 -translate-y-1/2' : ''}
            `}
          ></div>
        </div>
      )}
    </div>
  );
} 