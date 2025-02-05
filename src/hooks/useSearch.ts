import { useState, useCallback } from 'react';
import { debounce } from '../utils/debounce';

export function useSearch<T extends Record<string, any>>(
  items: T[],
  searchFields: (keyof T)[],
  delay = 300
) {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
    }, delay),
    []
  );

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;

    return searchFields.some((field) => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  });

  return {
    searchTerm,
    setSearchTerm: debouncedSearch,
    filteredItems,
  };
}
