import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronRight,
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Maximize2,
  Minimize2,
  ChevronLeftCircle,
  ChevronRightCircle,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import React from 'react';

// Interface générique pour les données
interface KDTableData {
  id: number | string;
  [key: string]: unknown;
}

// Interface pour la configuration de tri
interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

// Interface pour les colonnes
interface KDTableColumn<T extends KDTableData> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

// Interface pour la pagination
interface PaginationConfig {
  pageSizes?: number[];
  defaultPageSize?: number;
}

// Interface pour les props du composant
interface KDTableProps<T extends KDTableData> {
  data: T[];
  columns: KDTableColumn<T>[];
  groupByOptions?: Array<{ key: string, label: string }>;
  title?: string;
  onRowClick?: (row: T) => void;
  initialGroupBy?: string;
  initialSort?: SortConfig;
  searchPlaceholder?: string;
  noGroupText?: string;
  noResultsText?: string;
  pagination?: PaginationConfig;
  className?: string;
  density?: 'compact' | 'normal' | 'comfortable';
  alternateRowColors?: boolean;
  bordered?: boolean;
  headerActions?: React.ReactNode;
}

const KDTable = <T extends KDTableData>({
  data,
  columns,
  groupByOptions = [],
  title,
  onRowClick,
  initialGroupBy = 'none',
  initialSort = { key: null, direction: 'asc' },
  searchPlaceholder = "Rechercher...",
  noGroupText = "Aucun groupement",
  noResultsText = "Aucun résultat trouvé",
  pagination = { pageSizes: [10, 25, 50, 100], defaultPageSize: 10 },
  className = "",
  density = 'normal',
  alternateRowColors = true,
  bordered = true,
  headerActions
}: KDTableProps<T>) => {
  const [tableData, setTableData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [groupBy, setGroupBy] = useState<string>(initialGroupBy);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.defaultPageSize || 10);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Initialiser les données
  useEffect(() => {
    setTableData(data);
    setFilteredData(data);
  }, [data]);

  // Filtrer et trier les données
  useEffect(() => {
    let result = [...tableData];

    // Appliquer la recherche globale
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => {
        return columns.some(column => {
          const value = item[column.key];
          return value !== undefined && value !== null &&
            String(value).toLowerCase().includes(searchLower);
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
    // Réinitialiser la page à 1 quand le filtrage change
    setCurrentPage(1);
  }, [tableData, search, sortConfig, columns]);

  // Gérer le tri
  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (column?.sortable === false) return;

    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Obtenir l'icône de tri appropriée
  const getSortIcon = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (column?.sortable === false) return null;

    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ?
      <ArrowUp className="w-4 h-4" /> :
      <ArrowDown className="w-4 h-4" />;
  };

  // Basculer l'état d'un groupe (déplié/replié)
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

  // Grouper les données paginées
  const getPagedData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // Grouper les données
  const groupData = () => {
    const pagedData = getPagedData();

    if (groupBy === 'none') return [{ group: 'all', data: pagedData }];

    const groups = new Map<string, T[]>();

    pagedData.forEach(item => {
      const value = item[groupBy];
      const groupKey = value !== undefined && value !== null ? String(value) : '(Non défini)';
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

  // Rendre une cellule avec rendu personnalisé si nécessaire
  const renderCell = (row: T, column: KDTableColumn<T>) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return row[column.key] ?? '-';
  };

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      tableRef.current?.requestFullscreen().catch(err => {
        console.error(`Erreur: Impossible de passer en plein écran: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // Écouter les changements d'état plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Style conditionnel pour la densité
  const densityStyles = {
    compact: {
      table: "text-xs",
      cell: "py-1 px-2"
    },
    normal: {
      table: "text-sm",
      cell: "py-2 px-4"
    },
    comfortable: {
      table: "text-base",
      cell: "py-3 px-6"
    }
  };

  // Navigation de pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Générer la liste des pages à afficher
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Toujours montrer la première page
      pageNumbers.push(1);

      // Pages du milieu
      let startPage = Math.max(2, currentPage - Math.floor((maxPagesToShow - 2) / 2));
      const endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 3);

      // Ajuster si nécessaire
      if (endPage - startPage < maxPagesToShow - 3) {
        startPage = Math.max(2, totalPages - maxPagesToShow + 2);
      }

      // Ajouter des ellipses si nécessaire
      if (startPage > 2) {
        pageNumbers.push('...');
      }

      // Ajouter les pages du milieu
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Ajouter des ellipses si nécessaire
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }

      // Toujours montrer la dernière page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <div
      ref={tableRef}
      className={`${className} transition-all duration-300 ${isFullscreen ? 'bg-white p-4 flex flex-col h-screen' : ''}`}
    >
      <Card className={`w-full ${isFullscreen ? 'flex-1 flex flex-col' : ''} ${bordered ? 'border' : 'border-0'} shadow-sm`}>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 pb-2">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {title && <CardTitle className="text-xl font-bold">{title}</CardTitle>}

            {/* Recherche globale */}
            <div className="relative w-full max-w-sm">
              <Input
                className="peer pe-9 ps-9 h-9 bg-background"
                type="search"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Submit search"
                type="submit"
              >
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {headerActions}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <MoreHorizontal size={16} />
                  Options
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <><Minimize2 className="mr-2 h-4 w-4" /> Quitter le plein écran</>
                  ) : (
                    <><Maximize2 className="mr-2 h-4 w-4" /> Plein écran</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage(1)}>
                  <ChevronsLeft className="mr-2 h-4 w-4" /> Première page
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentPage(totalPages)}>
                  <ChevronsRight className="mr-2 h-4 w-4" /> Dernière page
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          </div>
        </CardHeader>

        {/* Options de groupement */}
        {groupByOptions.length > 0 && (
          <div className="px-6 py-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={groupBy === 'none' ? "default" : "outline"}
                size="sm"
                onClick={() => setGroupBy('none')}
              >
                {noGroupText}
              </Button>
              {groupByOptions.map(option => (
                <Button
                  key={option.key}
                  variant={groupBy === option.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGroupBy(option.key)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <CardContent className={`p-0 ${isFullscreen ? 'flex-1 overflow-auto' : ''}`}>
          <div className={`${bordered ? 'rounded-md border' : ''} overflow-hidden`}>
            <div className={`${isFullscreen ? 'h-full' : ''} overflow-auto`}>
              <Table className={densityStyles[density].table}>
                <TableHeader className="bg-muted/40 sticky top-0 z-10">
                  <TableRow className="hover:bg-muted/20">
                    {columns.map(column => (
                      <TableHead
                        key={column.key}
                        className={`${column.sortable === false ? '' : 'cursor-pointer'}`}
                        style={{
                          width: column.width,
                          textAlign: column.align || 'left'
                        }}
                      >
                        <button
                          className="flex items-center gap-1 w-full"
                          onClick={() => handleSort(column.key)}
                          disabled={column.sortable === false}
                          style={{ justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start' }}
                        >
                          {column.label}
                          {getSortIcon(column.key)}
                        </button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                        {noResultsText}
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupData().map(({ group, data: groupData }) => (
                      <React.Fragment key={group}>
                        {groupBy !== 'none' && (
                          <TableRow className="bg-muted/30 hover:bg-muted/50 border-t border-b">
                            <TableCell
                              colSpan={columns.length}
                              className={densityStyles[density].cell}
                            >
                              <button
                                className="flex items-center w-full"
                                onClick={() => toggleGroup(group)}
                              >
                                {expandedGroups.has(group) ? (
                                  <ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                                )}
                                <span className="font-medium">
                                  {groupByOptions.find(opt => opt.key === groupBy)?.label || groupBy}: {group}
                                </span>
                                <span className="ml-2 text-muted-foreground">
                                  ({groupData.length} éléments)
                                </span>
                              </button>
                            </TableCell>
                          </TableRow>
                        )}

                        {(groupBy === 'none' || expandedGroups.has(group)) &&
                          groupData.map((row, rowIndex) => (
                            <TableRow
                              key={row.id}
                              className={`
                                ${onRowClick ? "cursor-pointer" : ""}
                                ${alternateRowColors && rowIndex % 2 === 1 ? 'bg-muted/20' : ''}
                                hover:bg-muted/40 transition-colors
                              `}
                              onClick={onRowClick ? () => onRowClick(row) : undefined}
                            >
                              {columns.map(column => (
                                <TableCell
                                  key={`${row.id}-${column.key}`}
                                  className={densityStyles[density].cell}
                                  style={{ textAlign: column.align || 'left' }}
                                >
                                  {renderCell(row, column)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>

        {filteredData.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-t gap-4">
            <div className="text-sm text-muted-foreground">
              Affichage de {(currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, filteredData.length)} sur {filteredData.length} éléments
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Lignes par page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent>
                    {pagination.pageSizes?.map(size => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  title="Première page"
                >
                  <ChevronsLeft size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 ml-1"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  title="Page précédente"
                >
                  <ChevronLeftCircle size={16} />
                </Button>

                <div className="flex items-center mx-2">
                  {getPageNumbers().map((pageNumber, index) => (
                    typeof pageNumber === 'number' ? (
                      <Button
                        key={index}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8 mx-0.5"
                        onClick={() => goToPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    ) : (
                      <span key={index} className="mx-1">...</span>
                    )
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 mr-1"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  title="Page suivante"
                >
                  <ChevronRightCircle size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Dernière page"
                >
                  <ChevronsRight size={16} />
                </Button>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default KDTable;