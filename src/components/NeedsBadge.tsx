import React from 'react';
import { Need } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NeedsBadgeProps {
  need: Need;
}

const colors = {
  medical: 'bg-red-100 text-red-800',
  financial: 'bg-green-100 text-green-800',
  food: 'bg-yellow-100 text-yellow-800',
  shelter: 'bg-purple-100 text-purple-800',
  clothing: 'bg-blue-100 text-blue-800',
  education: 'bg-indigo-100 text-indigo-800',
  employment: 'bg-pink-100 text-pink-800',
  transportation: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
};

export function NeedsBadge({ need }: NeedsBadgeProps) {
  const { t } = useLanguage();
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[need.category]}`}>
      {t(need.category)}
    </span>
  );
}
