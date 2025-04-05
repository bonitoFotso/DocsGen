/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, ReactNode, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ChevronFirst,
  ChevronLast,
  MoreHorizontal,
  Download,
  RefreshCw,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import React from 'react';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface SortConfig<T> {
  key: keyof T | null;
  direction: 'asc' | 'desc';
}

interface KDTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: ReactNode;
  description?: ReactNode;
  keyExtractor: (item: T) => string | number;
  searchKeys?: Array<keyof T>;
  groupingOptions?: Array<{
    key: keyof T;
    label: string;
  }>;
  defaultGroupBy?: keyof T | 'none';
  defaultSort?: SortConfig<T>;
  searchPlaceholder?: string;
  noGroupingLabel?: string;
  noResultsMessage?: string;
  className?: string;
  isLoading?: boolean;
  pagination?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  onRefresh?: () => void;
  onExport?: () => void;
  tableActions?: ReactNode;
  emptyStateContent?: ReactNode;
  hoverable?: boolean;
  striped?: boolean;
  dense?: boolean;
  onRowClick?: (item: T) => void;
  selectedItems?: T[];
  onItemSelect?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

const DOTS = "...";

// Fonction utilitaire pour générer la plage de pages
const generatePaginationRange = (
  totalPages: number,
  currentPage: number,
  siblingCount: number = 1
) => {
  // Pages totales inférieures à 7, afficher toutes les pages
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculer le début et la fin de la plage de pages autour de la page actuelle
  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

  // Ne pas afficher les points si les nombres sont consécutifs
  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

  // Différents cas de plage de pagination
  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = Array.from({ length: 4 }, (_, i) => i + 1);
    return [...leftRange, DOTS, totalPages - 1, totalPages];
  } else if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = Array.from(
      { length: 4 },
      (_, i) => totalPages - 3 + i
    );
    return [1, 2, DOTS, ...rightRange];
  } else if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, DOTS, ...middleRange, DOTS, totalPages];
  }

  // Par défaut, retourner une plage simple
  return Array.from({ length: totalPages }, (_, i) => i + 1);
};

function KDTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  keyExtractor,
  searchKeys = [],
  groupingOptions = [],
  defaultGroupBy = 'none',
  defaultSort = { key: null, direction: 'asc' },
  searchPlaceholder = "Rechercher...",
  noGroupingLabel = "Aucun groupement",
  noResultsMessage = "Aucun résultat trouvé",
  className = "",
  isLoading = false,
  pagination = true,
  defaultPageSize = 10,
  pageSizeOptions = [1, 5, 10, 25, 50, 100],
  onRefresh,
  onExport,
  tableActions,
  emptyStateContent,
  hoverable = true,
  striped = false,
  dense = false,
  onRowClick,
  rowClassName,
}: KDTableProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [groupBy, setGroupBy] = useState<keyof T | 'none'>(defaultGroupBy);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(defaultSort);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [showSearch, setShowSearch] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<keyof T>>(new Set());

  // Mise à jour des données filtrées lorsque les données sources ou les filtres changent
  useEffect(() => {
    let result = [...data];

    // Appliquer la recherche globale
    if (search && searchKeys.length > 0) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => {
        return searchKeys.some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(searchLower);
        });
      });
    }

    // Appliquer le tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!]?.toString().toLowerCase() ?? '';
        const bValue = b[sortConfig.key!]?.toString().toLowerCase() ?? '';

        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      });
    }

    setFilteredData(result);
    // Réinitialiser la pagination à la première page quand les filtres changent
    setCurrentPage(1);
  }, [data, search, sortConfig, searchKeys]);

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="w-4 h-4" /> :
      <ArrowDown className="w-4 h-4" />;
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const groupData = () => {
    if (groupBy === 'none') return [{ group: 'all', data: filteredData }];

    const groups = new Map<string, T[]>();

    filteredData.forEach(item => {
      const groupValue = item[groupBy as keyof T];
      const groupKey = groupValue?.toString() || '';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)?.push(item);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, items]) => ({
        group,
        data: items
      }));
  };

  // Calcul de la pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Générer les données paginées
  const paginatedGroups = useMemo(() => {
    const groupedData = groupData();

    if (!pagination || groupBy !== 'none') {
      return groupedData;
    }

    // Ne paginer que lorsque pas de groupement
    return [{
      group: 'all',
      data: filteredData.slice(startIndex, endIndex)
    }];
  }, [groupData, pagination, groupBy, filteredData, startIndex, endIndex]);

  // Générer la plage de pages
  const paginationRange = useMemo(() => {
    return generatePaginationRange(totalPages, currentPage);
  }, [totalPages, currentPage]);

  // Gestionnaire pour changer de page
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Gestionnaire pour changer la taille de page
  const handlePageSizeChange = (value: string) => {
    const newSize = parseInt(value);
    setPageSize(newSize);
    setCurrentPage(1); // Réinitialiser à la première page
  };

  // Style pour les lignes en fonction des props
  const getRowClassName = (item: T) => {
    let classes = "";
    if (hoverable) classes += " hover:bg-gray-50";
    if (onRowClick) classes += " cursor-pointer";
    if (rowClassName) classes += ` ${rowClassName(item)}`;
    return classes;
  };

  // Style pour les cellules en fonction de l'alignement
  const getCellClassName = (column: Column<T>) => {
    let classes = "";
    if (column.align === "center") classes += " text-center";
    if (column.align === "right") classes += " text-right";
    if (column.className) classes += ` ${column.className}`;
    return classes;
  };

  // Style pour les lignes zébrées
  const getStripedClassName = (index: number) => {
    return striped && index % 2 === 1 ? " bg-gray-50" : "";
  };

  // Gérer l'état vide
  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="py-10 text-center">
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="relative flex items-center justify-center w-10 h-10">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">Chargement des données...</p>
            </div>
          </TableCell>
        </TableRow>
      );
    }

    if (filteredData.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className="py-10 text-center">
            {emptyStateContent ? (
              emptyStateContent
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3">
                <Search className="w-10 h-10 text-gray-300" />
                <div className="space-y-1">
                  <p className="text-lg font-medium">{noResultsMessage}</p>
                  {search && (
                    <p className="text-sm text-muted-foreground">
                      Aucun résultat ne correspond à votre recherche.
                    </p>
                  )}
                </div>
                {search && (
                  <Button variant="outline" onClick={() => setSearch("")}>
                    Effacer la recherche
                  </Button>
                )}
              </div>
            )}
          </TableCell>
        </TableRow>
      );
    }

    return null;
  };

  // Rendu des filtres actifs
  const renderActiveFilters = () => {
    if (activeFilters.size === 0 && !search) return null;

    return (
      <div className="flex flex-wrap items-center gap-2 my-2">
        {search && (
          <Badge variant="secondary" className="flex items-center gap-1">
            Recherche: {search}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => setSearch("")}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </Badge>
        )}
        {Array.from(activeFilters).map(filter => (
          <Badge key={String(filter)} variant="secondary" className="flex items-center gap-1">
            {String(filter)}
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => {
                const newFilters = new Set(activeFilters);
                newFilters.delete(filter);
                setActiveFilters(newFilters);
              }}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        {(activeFilters.size > 0 || search) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => {
              setActiveFilters(new Set());
              setSearch("");
            }}
          >
            Réinitialiser tous les filtres
          </Button>
        )}
      </div>
    );
  };

  const renderPagination = () => {
    if (!pagination || totalItems === 0) return null;

    return (
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            Affichage {startIndex + 1} à {endIndex} sur {totalItems} éléments
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>par page</span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </Button>

          <div className="flex items-center">
            {paginationRange.map((page, index) => {
              if (page === DOTS) {
                return (
                  <Button key={`dots-${index}`} variant="ghost" size="icon" className="h-8 w-8" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                );
              }

              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(page as number)}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className={dense ? "pb-2" : ""}>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-2">
            {tableActions}
            
            {searchKeys.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search size={16} />
              </Button>
            )}
            
            {onRefresh && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={onRefresh}
                    >
                      <RefreshCw size={16} />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={onExport}
                    >
                      <Download size={16} />
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8"
                >
                  <Settings size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Options du tableau</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {groupingOptions.length > 0 && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Grouper par
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setGroupBy('none')}>
                      {groupBy === 'none' && <span className="mr-2">✓</span>}
                      {noGroupingLabel}
                    </DropdownMenuItem>
                    {groupingOptions.map(option => (
                      <DropdownMenuItem
                        key={String(option.key)}
                        onClick={() => setGroupBy(option.key)}
                      >
                        {groupBy === option.key && <span className="mr-2">✓</span>}
                        {option.label}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Affichage
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {pagination && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Éléments par page
                    </DropdownMenuLabel>
                    {pageSizeOptions.map(size => (
                      <DropdownMenuItem
                        key={size}
                        onClick={() => handlePageSizeChange(size.toString())}
                      >
                        {pageSize === size && <span className="mr-2">✓</span>}
                        {size}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {/* Recherche globale */}
          {showSearch && searchKeys.length > 0 && (
            <div className="relative w-full max-w-sm">
              <Input className="peer pe-9 ps-9" type="search"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
              {search && (
                <button
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
          )}

          {/* Affichage des filtres actifs */}
          {renderActiveFilters()}

          {/* Boutons de groupement */}
          {groupingOptions.length > 0 && !dense && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={groupBy === 'none' ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy('none')}
              >
                {noGroupingLabel}
              </Button>

              {groupingOptions.map(option => (
                <Button
                  key={String(option.key)}
                  variant={groupBy === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupBy(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={dense ? "pt-0" : ""}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className={dense ? "h-10" : ""}>
                {columns.map(column => (
                  <TableHead 
                    key={String(column.key)} 
                    className={getCellClassName(column)}
                    style={{ width: column.width }}
                  >
                    <button
                      className="flex items-center gap-1 w-full justify-between"
                      onClick={() => column.sortable !== false && handleSort(column.key)}
                      disabled={column.sortable === false}
                    >
                      <span>{column.label}</span>
                      {column.sortable !== false && getSortIcon(column.key)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // État de chargement
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className={`${dense ? "h-10" : ""}`}>
                    {columns.map((_column, colIndex) => (
                      <TableCell key={`skeleton-${index}-${colIndex}`}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                // Données normales
                paginatedGroups.length > 0 ? (
                  paginatedGroups.map(({ group, data: groupItems }) => (
                    <React.Fragment key={group}>
                      {groupBy !== 'none' && (
                        <TableRow className="bg-gray-50 hover:bg-gray-100">
                          <TableCell colSpan={columns.length}>
                            <button
                              className="flex items-center w-full"
                              onClick={() => toggleGroup(group)}
                            >
                              {expandedGroups.has(group) ? (
                                <ChevronDown className="w-4 h-4 mr-2" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2" />
                              )}
                              <span className="font-medium">
                                {groupBy === 'none' ? '' :
                                  typeof groupBy === 'string' ?
                                    groupBy.charAt(0).toUpperCase() + groupBy.slice(1) :
                                    String(groupBy)}: {group}
                              </span>
                              <span className="ml-2 text-gray-500">
                                ({groupItems.length} éléments)
                              </span>
                            </button>
                          </TableCell>
                        </TableRow>
                      )}
                      {(groupBy === 'none' || expandedGroups.has(group)) &&
                        groupItems.map((item, index) => (
                          <TableRow 
                            key={keyExtractor(item)} 
                            className={`${getRowClassName(item)}${getStripedClassName(index)}${dense ? " h-10" : ""}`}
                            onClick={() => onRowClick && onRowClick(item)}
                          >
                            {columns.map(column => (
                              <TableCell 
                                key={`${keyExtractor(item)}-${String(column.key)}`} 
                                className={getCellClassName(column)}
                              >
                                {column.render ?
                                  column.render(item) :
                                  (item[column.key] ?? '-')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                    </React.Fragment>
                  ))
                ) : (
                  renderEmptyState()
                )
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </CardContent>
    </Card>
  );
}

export default KDTable;