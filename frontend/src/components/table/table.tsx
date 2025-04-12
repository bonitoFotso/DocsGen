import React, { useState, ReactNode, useMemo } from 'react';
import { 
  ChevronDown, 
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Search, 
  ArrowUpDown, 
  ArrowDown, 
  ArrowUp,
  Download,
  RefreshCw,
  Settings,
  X,
  Check,
  ChevronLeft
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
  renderExpanded?: (item: T) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface GroupingOption<T> {
  key: keyof T;
  label: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  description?: string;
  searchKeys?: (keyof T)[];
  groupingOptions?: GroupingOption<T>[];
  defaultGroupBy?: keyof T | null;
  keyExtractor: (item: T) => string | number;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  className?: string;
  expandableRows?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRefresh?: () => void;
  onExport?: () => void;
  dense?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  selectedItems?: T[];
  onItemSelect?: (item: T) => void;
  onSelectionChange?: (items: T[]) => void;
}

function Table<T>({
  data,
  columns,
  title,
  description,
  searchKeys = [],
  groupingOptions = [],
  defaultGroupBy = null,
  keyExtractor,
  onRowClick,
  isLoading = false,
  className = "",
  expandableRows = false,
  pagination = true,
  pageSize = 10,
  onRefresh,
  onExport,
  dense = false,
  striped = false,
  hoverable = true,
  selectedItems = [],
  onItemSelect,
  onSelectionChange,
}: TableProps<T>) {
  const [search, setSearch] = useState('');
  const [groupBy, setGroupBy] = useState<keyof T | null>(defaultGroupBy);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<string | number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(
    new Set(selectedItems.map(keyExtractor))
  );

  // Filter and sort data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter(item =>
        searchKeys.some(key => {
          const value = item[key];
          return String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, searchKeys, sortConfig]);

  // Group data
  const groupedData = useMemo(() => {
    if (!groupBy) {
      return [{ group: null, items: filteredData }];
    }

    const groups = new Map<string, T[]>();
    
    filteredData.forEach(item => {
      const groupValue = String(item[groupBy]);
      if (!groups.has(groupValue)) {
        groups.set(groupValue, []);
      }
      groups.get(groupValue)!.push(item);
    });

    return Array.from(groups.entries()).map(([group, items]) => ({
      group,
      items
    }));
  }, [filteredData, groupBy]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Handlers
  const toggleGroup = (group: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(group)) {
      newExpandedGroups.delete(group);
    } else {
      newExpandedGroups.add(group);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const toggleRow = (id: string | number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (key: keyof T) => {
    setSortConfig(current => {
      if (current?.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        return null;
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newSelected = new Set(filteredData.map(keyExtractor));
      setSelectedRows(newSelected);
      onSelectionChange?.(filteredData);
    } else {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (item: T) => {
    const id = keyExtractor(item);
    const newSelected = new Set(selectedRows);
    
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    
    setSelectedRows(newSelected);
    onItemSelect?.(item);
    
    const selectedItems = filteredData.filter(item => 
      newSelected.has(keyExtractor(item))
    );
    onSelectionChange?.(selectedItems);
  };

  const renderPagination = () => {
    if (!pagination || totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Affichage de {((currentPage - 1) * pageSize) + 1} à{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} sur{' '}
          {filteredData.length} éléments
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => {
                const distance = Math.abs(page - currentPage);
                return distance === 0 || distance === 1 || page === 1 || page === totalPages;
              })
              .map((page, i, arr) => (
                <React.Fragment key={page}>
                  {i > 0 && arr[i - 1] !== page - 1 && (
                    <span className="text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </React.Fragment>
              ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Enhanced loading state
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="h-8 bg-gray-200 rounded-md w-1/4 animate-pulse" />
        <div className="flex gap-4 items-center">
          <div className="h-10 bg-gray-200 rounded-md w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse" />
        </div>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-4">
            <div className="h-6 bg-gray-200 rounded-md w-full animate-pulse" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t p-4">
              <div className="h-6 bg-gray-200 rounded-md w-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            {title && <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {onRefresh && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actualiser les données</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onExport && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={onExport}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Exporter les données</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Options d'affichage</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className={cn(
                    "flex items-center gap-2",
                    !groupBy && "text-primary font-medium"
                  )}
                  onClick={() => setGroupBy(null)}
                >
                  <span className="flex-1">Sans groupement</span>
                  {!groupBy && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
                {groupingOptions.map(option => (
                  <DropdownMenuItem
                    key={String(option.key)}
                    className={cn(
                      "flex items-center gap-2",
                      groupBy === option.key && "text-primary font-medium"
                    )}
                    onClick={() => setGroupBy(option.key)}
                  >
                    <span className="flex-1">Grouper par {option.label}</span>
                    {groupBy === option.key && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {searchKeys.length > 0 && (
            <div className="relative flex-1 max-w-md">
              <Input
                type="search"
                placeholder="Rechercher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}

          {groupingOptions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!groupBy ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy(null)}
                className="h-8"
              >
                Sans groupement
              </Button>
              {groupingOptions.map(option => (
                <Button
                  key={String(option.key)}
                  variant={groupBy === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupBy(option.key)}
                  className="h-8"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Active Filters Display */}
        {(search || groupBy) && (
          <div className="flex flex-wrap gap-2">
            {search && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>Recherche: {search}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => setSearch('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {groupBy && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>
                  Groupé par: {groupingOptions.find(opt => opt.key === groupBy)?.label}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1 hover:bg-transparent"
                  onClick={() => setGroupBy(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                {onItemSelect && (
                  <th className="w-8 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredData.length}
                      onChange={handleSelectAll}
                      className="rounded border-input"
                    />
                  </th>
                )}
                {expandableRows && (
                  <th className="w-8 px-4 py-3"></th>
                )}
                {columns.map(column => (
                  <th
                    key={String(column.key)}
                    className={cn(
                      "px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider",
                      column.align === 'center' && "text-center",
                      column.align === 'right' && "text-right"
                    )}
                    style={{ width: column.width }}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 hover:text-foreground",
                        column.sortable === false && "cursor-default"
                      )}
                      onClick={() => column.sortable !== false && handleSort(column.key as keyof T)}
                      disabled={column.sortable === false}
                    >
                      {column.label}
                      {column.sortable !== false && getSortIcon(column.key as keyof T)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (expandableRows ? 1 : 0) + (onItemSelect ? 1 : 0)}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p>Aucun résultat trouvé</p>
                      {search && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSearch('')}
                          className="mt-2"
                        >
                          Effacer la recherche
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                groupedData.map(({ group, items }) => (
                  <React.Fragment key={group}>
                    {groupBy && (
                      <tr className="bg-muted/30">
                        <td
                          colSpan={columns.length + (expandableRows ? 1 : 0) + (onItemSelect ? 1 : 0)}
                          className="px-6 py-3"
                        >
                          <button
                            className="flex items-center gap-2 w-full text-left font-medium"
                            onClick={() => toggleGroup(group!)}
                          >
                            {expandedGroups.has(group!) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            {group} ({items.length} éléments)
                          </button>
                        </td>
                      </tr>
                    )}
                    {(!groupBy || expandedGroups.has(group!)) &&
                      items.map((item: T, index: number) => (
                        <React.Fragment key={keyExtractor(item)}>
                          <tr
                            className={cn(
                              "border-b transition-colors",
                              hoverable && "hover:bg-muted/50",
                              striped && index % 2 === 1 && "bg-muted/30",
                              onRowClick && "cursor-pointer",
                              dense && "h-8"
                            )}
                            onClick={() => onRowClick?.(item)}
                          >
                            {onItemSelect && (
                              <td className="w-8 px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.has(keyExtractor(item))}
                                  onChange={() => handleSelectRow(item)}
                                  onClick={e => e.stopPropagation()}
                                  className="rounded border-input"
                                />
                              </td>
                            )}
                            {expandableRows && (
                              <td className="w-8 px-4 py-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleRow(keyExtractor(item));
                                  }}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  {expandedRows.has(keyExtractor(item)) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                            )}
                            {columns.map(column => (
                              <td
                                key={String(column.key)}
                                className={cn(
                                  "px-6 py-3",
                                  column.align === 'center' && "text-center",
                                  column.align === 'right' && "text-right"
                                )}
                              >
                                {column.render
                                  ? column.render(item)
                                  : String(item[column.key as keyof T])}
                              </td>
                            ))}
                          </tr>
                          {expandableRows && expandedRows.has(keyExtractor(item)) && (
                            <tr className="border-b">
                              <td
                                colSpan={columns.length + 1 + (onItemSelect ? 1 : 0)}
                                className="bg-muted/30 px-6 py-4"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                  {columns
                                    .filter(col => col.renderExpanded)
                                    .map(col => (
                                      <div key={String(col.key)} className="space-y-2">
                                        <h4 className="font-medium">{col.label}</h4>
                                        {col.renderExpanded!(item)}
                                      </div>
                                    ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Section */}
      {renderPagination()}
    </div>
  );
}

export default Table;