import { useState, useMemo } from 'react';

interface SortConfig<T> {
  key: keyof T;
  direction: 'asc' | 'desc';
}

export function useSortableData<T>(items: T[], defaultConfig: SortConfig<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(defaultConfig);

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'date_creation') {
          return sortConfig.direction === 'asc'
            ? new Date(a[sortConfig.key] as string).getTime() -
                new Date(b[sortConfig.key] as string).getTime()
            : new Date(b[sortConfig.key] as string).getTime() -
                new Date(a[sortConfig.key] as string).getTime();
        }
        
        const aValue = String(a[sortConfig.key]);
        const bValue = String(b[sortConfig.key]);
        
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    setSortConfig((currentConfig) => ({
      key,
      direction: currentConfig.key === key && currentConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return { items: sortedItems, requestSort, sortConfig };
}