import { SortField, SortOrder } from '@/types';
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react';

interface TableHeaderProps {
  column: string;
  icon?: React.ReactNode;
  sortBy: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  column,
  icon,
  sortBy,
  sortOrder,
  onSort
}) => (
  <th
    onClick={() => onSort(column as SortField)}
    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
  >
    <div className="flex items-center space-x-1">
      {icon}
      <span>{column}</span>
      {sortBy === column && (
        sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
      )}
    </div>
  </th>
);