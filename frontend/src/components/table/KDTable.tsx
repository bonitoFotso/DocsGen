import { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpDown,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Settings,
  ChevronDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import React from 'react';

// Définition des types
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export interface GroupConfig {
  key: string | null;
  direction: SortDirection;
}

export interface ColumnDefinition<T> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge';
  sortable?: boolean;
  filterable?: boolean;
  groupable?: boolean;
  className?: string;
  cellClassName?: string;
  defaultValue?: string | number | boolean;
  render?: (row: T) => ReactNode;
  sortFn?: (a: T, b: T) => number;
  filterFn?: (row: T, filterValue: string) => boolean;
  width?: string;
  hidden?: boolean;
}

export interface KDTableProps<T> {
  data: T[];
  columns: ColumnDefinition<T>[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  keyField?: string;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  enableGrouping?: boolean;
  pageSize?: number;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  emptyStateComponent?: ReactNode;
  enableColumnResize?: boolean;
  enableExport?: boolean;
  compact?: boolean;
  storageKey?: string;  // Pour sauvegarder les préférences dans localStorage
  darkMode?: boolean;
}

interface GroupedData<T> {
  groupKey: string;
  groupValue: unknown;
  rows: T[];
  isExpanded: boolean;
}

/**
 * KDTable - Composant de tableau avancé avec tri, filtrage, pagination, sélection et groupement
 */
function KDTable<T extends Record<string, unknown>>({
  data = [],
  columns: initialColumns = [],
  onRowClick,
  rowClassName,
  keyField = "id",
  enableFiltering = true,
  enableSorting = true,
  enablePagination = true,
  enableGrouping = false,
  pageSize = 10,
  enableSelection = false,
  onSelectionChange,
  emptyStateComponent,
  enableColumnResize = true,
  enableExport = true,
  compact = false,
  storageKey,
  darkMode = false,
}: KDTableProps<T>) {
  // État des colonnes (pour gérer la visibilité et la taille)
  const [columns, setColumns] = useState(initialColumns);

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  // États pour le tableau
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [displayData, setDisplayData] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // État pour la sélection
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [allSelected, setAllSelected] = useState(false);

  // États pour le groupement
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [groupedData, setGroupedData] = useState<GroupedData<T>[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Référence pour le redimensionnement des colonnes
  const tableRef = useRef<HTMLDivElement>(null);
  const resizingColumnRef = useRef<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);


  // Récupérer les préférences du localStorage si un storageKey est fourni
  useEffect(() => {
    if (storageKey) {
      try {
        const savedState = localStorage.getItem(`kdtable-${storageKey}`);
        if (savedState) {
          const {
            filters: savedFilters,
            sortConfig: savedSortConfig,
            columnsState,
            groupBy: savedGroupBy,
            expandedGroups: savedExpandedGroups
          } = JSON.parse(savedState);

          if (savedFilters) setFilters(savedFilters);
          if (savedSortConfig) setSortConfig(savedSortConfig);
          if (savedGroupBy) setGroupBy(savedGroupBy);
          if (savedExpandedGroups) setExpandedGroups(savedExpandedGroups);

          if (columnsState) {
            setColumns(initialColumns.map(col => {
              const savedCol = columnsState.find((c: { key: string }) => c.key === col.key);
              return savedCol ? { ...col, hidden: savedCol.hidden, width: savedCol.width } : col;
            }));
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des préférences:", error);
      }
    }
  }, [storageKey, initialColumns]);

  // Sauvegarder les préférences dans localStorage
  useEffect(() => {
    if (storageKey) {
      try {
        const columnsState = columns.map(col => ({
          key: col.key,
          hidden: col.hidden,
          width: col.width
        }));

        localStorage.setItem(`kdtable-${storageKey}`, JSON.stringify({
          filters,
          sortConfig,
          columnsState,
          groupBy,
          expandedGroups
        }));
      } catch (error) {
        console.error("Erreur lors de la sauvegarde des préférences:", error);
      }
    }
  }, [filters, sortConfig, columns, storageKey, groupBy, expandedGroups]);

  // Fonction pour obtenir la valeur depuis un chemin en notation dot (ex: "user.name")
  const getNestedValue = useCallback((obj: T, path: string): unknown => {
    return path.split('.').reduce((prev, curr) => {
      return prev && typeof prev === 'object' && curr in (prev as Record<string, unknown>)
        ? (prev as Record<string, unknown>)[curr]
        : null;
    }, obj as unknown);
  }, []);

  // Fonction pour trier les données
  const sortData = useCallback((dataToSort: T[], key: string, direction: SortDirection): T[] => {
    if (!direction) return dataToSort;

    const column = columns.find(col => col.key === key);

    if (!column) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      // Utiliser la fonction de tri personnalisée si elle existe
      if (column.sortFn) {
        return direction === 'asc'
          ? column.sortFn(a, b)
          : column.sortFn(b, a);
      }

      let aValue: unknown = getNestedValue(a, key);
      let bValue: unknown = getNestedValue(b, key);

      // Gérer les valeurs nulles ou undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convertir en minuscules pour les chaînes
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      // Tri par date si les valeurs sont des dates
      if (column.type === 'date') {
        aValue = aValue ? new Date(aValue as string | number | Date).getTime() : 0;
        bValue = bValue ? new Date(bValue as string | number | Date).getTime() : 0;
      }

      // Tri numérique
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Tri alphabétique par défaut
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [columns, getNestedValue]);

  // Appliquer filtres et tri
  const applyFiltersAndSort = useCallback((
    dataToProcess: T[],
    currentFilters: Record<string, string>,
    currentSortConfig: SortConfig
  ): T[] => {
    // Appliquer les filtres
    let result = [...dataToProcess];

    Object.keys(currentFilters).forEach((filterKey) => {
      const filterValue = currentFilters[filterKey].toLowerCase();
      const col = columns.find(c => c.key === filterKey);

      if (!col) return;

      result = result.filter(item => {
        const itemValue = getNestedValue(item, filterKey);

        if (col.filterFn) {
          return col.filterFn(item, filterValue);
        }

        if (itemValue === null || itemValue === undefined) return false;

        if (typeof itemValue === 'number') {
          return itemValue.toString().includes(filterValue);
        }

        if (typeof itemValue === 'boolean') {
          return itemValue.toString() === filterValue;
        }

        return itemValue.toString().toLowerCase().includes(filterValue);
      });
    });

    // Appliquer le tri
    if (currentSortConfig.key && currentSortConfig.direction) {
      result = sortData(result, currentSortConfig.key, currentSortConfig.direction);
    }

    return result;
  }, [columns, getNestedValue, sortData]);

  // Fonction pour grouper les données
  const groupData = useCallback((dataToGroup: T[], groupByKey: string | null): GroupedData<T>[] => {
    if (!groupByKey) return [];

    const grouped: Record<string, T[]> = {};

    dataToGroup.forEach(item => {
      const groupValue = getNestedValue(item, groupByKey);
      const groupKeyStr = groupValue !== null && groupValue !== undefined ? String(groupValue) : 'Non défini';

      if (!grouped[groupKeyStr]) {
        grouped[groupKeyStr] = [];
      }

      grouped[groupKeyStr].push(item);
    });

    return Object.entries(grouped).map(([groupValueStr, rows]) => ({
      groupKey: groupByKey,
      groupValue: groupValueStr,
      rows,
      isExpanded: expandedGroups[groupValueStr] ?? true // Par défaut, les groupes sont ouverts
    }));
  }, [getNestedValue, expandedGroups]);

  // Mettre à jour les données filtrées lorsque les données d'entrée changent
  useEffect(() => {
    const newFilteredData = applyFiltersAndSort(data, filters, sortConfig);
    setFilteredData(newFilteredData);

    // Grouper les données si nécessaire
    if (enableGrouping && groupBy) {
      const newGroupedData = groupData(newFilteredData, groupBy);
      setGroupedData(newGroupedData);
    } else {
      setGroupedData([]);
    }

    // Réinitialiser la page si nécessaire
    if (enablePagination) {
      setCurrentPage(1);
    }

    // Réinitialiser la sélection
    setSelectedRows({});
    setAllSelected(false);
  }, [applyFiltersAndSort, data, enablePagination, filters, sortConfig, enableGrouping, groupBy, groupData]);

  // Mettre à jour les données affichées lorsque les données filtrées, la pagination ou le groupement change
  useEffect(() => {
    let dataToDisplay: T[] = [];

    if (enableGrouping && groupBy && groupedData.length > 0) {
      // Si le groupement est activé, utiliser uniquement les lignes des groupes développés
      groupedData.forEach(group => {
        if (group.isExpanded) {
          dataToDisplay = [...dataToDisplay, ...group.rows];
        }
      });
    } else {
      dataToDisplay = filteredData;
    }

    if (enablePagination) {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      setDisplayData(dataToDisplay.slice(startIndex, endIndex));
    } else {
      setDisplayData(dataToDisplay);
    }
  }, [filteredData, currentPage, itemsPerPage, enablePagination, enableGrouping, groupBy, groupedData]);

  // Notifier le changement de sélection
  useEffect(() => {
    if (onSelectionChange) {
      const selectedItems = filteredData.filter(item =>
        selectedRows[item[keyField] as string]
      );
      onSelectionChange(selectedItems);
    }
  }, [selectedRows, filteredData, onSelectionChange, keyField]);

  // Fonction pour basculer l'état d'expansion d'un groupe
  const toggleGroupExpansion = (groupValue: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupValue]: !prev[groupValue]
    }));
  };

  // Fonction pour définir la colonne de groupement
  const setGroupingColumn = (columnKey: string | null) => {
    setGroupBy(columnKey);

    if (columnKey) {
      // Mettre à jour les données groupées
      const newGroupedData = groupData(filteredData, columnKey);
      setGroupedData(newGroupedData);
    } else {
      setGroupedData([]);
    }

    // Réinitialiser la pagination
    if (enablePagination) {
      setCurrentPage(1);
    }
  };

  // Fonction pour gérer le filtrage
  const handleFilter = useCallback((column: ColumnDefinition<T>, value: string) => {
    const newFilters = { ...filters, [column.key]: value };

    if (value === "") {
      delete newFilters[column.key];
    }

    setFilters(newFilters);

    // Appliquer les filtres et le tri
    const newFilteredData = applyFiltersAndSort(data, newFilters, sortConfig);
    setFilteredData(newFilteredData);

    // Mettre à jour les données groupées si nécessaire
    if (enableGrouping && groupBy) {
      const newGroupedData = groupData(newFilteredData, groupBy);
      setGroupedData(newGroupedData);
    }

    // Réinitialiser la page si on utilise la pagination
    if (enablePagination) {
      setCurrentPage(1);
    }
  }, [filters, sortConfig, data, applyFiltersAndSort, enablePagination, enableGrouping, groupBy, groupData]);

  // Fonction pour gérer le tri
  const handleSort = useCallback((key: string) => {
    let direction: SortDirection = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    const newSortConfig: SortConfig = direction ? { key, direction } : { key: null, direction: null };
    setSortConfig(newSortConfig);

    // Mettre à jour les données filtrées avec le nouveau tri
    const newFilteredData = applyFiltersAndSort(data, filters, newSortConfig);
    setFilteredData(newFilteredData);

    // Mettre à jour les données groupées si nécessaire
    if (enableGrouping && groupBy) {
      const newGroupedData = groupData(newFilteredData, groupBy);
      setGroupedData(newGroupedData);
    }
  }, [sortConfig, data, filters, applyFiltersAndSort, enableGrouping, groupBy, groupData]);

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = useCallback(() => {
    setFilters({});
    const newFilteredData = sortConfig.key && sortConfig.direction
      ? sortData([...data], sortConfig.key, sortConfig.direction)
      : data;

    setFilteredData(newFilteredData);

    // Mettre à jour les données groupées si nécessaire
    if (enableGrouping && groupBy) {
      const newGroupedData = groupData(newFilteredData, groupBy);
      setGroupedData(newGroupedData);
    }

    if (enablePagination) {
      setCurrentPage(1);
    }
  }, [sortConfig.key, sortConfig.direction, sortData, data, enablePagination, enableGrouping, groupBy, groupData]);

  // Fonction pour supprimer un filtre spécifique
  const removeFilter = useCallback((key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);

    // Mettre à jour les données filtrées
    const newFilteredData = applyFiltersAndSort(data, newFilters, sortConfig);
    setFilteredData(newFilteredData);

    // Mettre à jour les données groupées si nécessaire
    if (enableGrouping && groupBy) {
      const newGroupedData = groupData(newFilteredData, groupBy);
      setGroupedData(newGroupedData);
    }
  }, [filters, data, sortConfig, applyFiltersAndSort, enableGrouping, groupBy, groupData]);

  // Fonction pour afficher la valeur d'une cellule
  const renderCellValue = (row: T, column: ColumnDefinition<T>): ReactNode => {
    if (column.render) {
      return column.render(row);
    }

    const value = getNestedValue(row, column.key);

    if (value === null || value === undefined) {
      return column.defaultValue || '-';
    }

    if (column.type === 'date' && value) {
      try {
        return new Date(value as string | number | Date).toLocaleDateString();
      } catch {
        return value as ReactNode;
      }
    }

    if (column.type === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    if (column.type === 'badge') {
      return <Badge>{String(value)}</Badge>;
    }

    return String(value);
  };

  // Fonctions pour la pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, Math.ceil(filteredData.length / itemsPerPage))));
  };

  const goToFirstPage = () => goToPage(1);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);
  const goToLastPage = () => goToPage(Math.ceil(filteredData.length / itemsPerPage));

  // Fonction pour exporter les données en CSV
  const exportToCSV = useCallback(() => {
    const visibleColumns = columns.filter(col => !col.hidden);

    // Entêtes des colonnes
    const headers = visibleColumns.map(col => col.label).join(',');

    // Lignes de données
    const csvRows = filteredData.map(row => {
      return visibleColumns.map(column => {
        const value = getNestedValue(row, column.key);
        // Échapper les virgules et guillemets
        const cellValue = value !== null && value !== undefined ? String(value).replace(/"/g, '""') : '';
        return `"${cellValue}"`;
      }).join(',');
    });

    // Combiner entêtes et lignes
    const csvContent = [headers, ...csvRows].join('\n');

    // Créer un objet Blob et un lien de téléchargement
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'export.csv');
    link.style.display = 'none';
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [columns, filteredData, getNestedValue]);

  // Fonctions pour la sélection
  const toggleRowSelection = (rowId: string) => {
    setSelectedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));

    // Mettre à jour l'état de sélection globale
    const newSelectedRows = {
      ...selectedRows,
      [rowId]: !selectedRows[rowId]
    };

    const allCurrentDisplayDataSelected = displayData.every(
      row => newSelectedRows[row[keyField] as string]
    );

    setAllSelected(allCurrentDisplayDataSelected);
  };

  const toggleSelectAll = () => {
    const newAllSelected = !allSelected;
    const newSelectedRows = { ...selectedRows };

    displayData.forEach(row => {
      newSelectedRows[row[keyField] as string] = newAllSelected;
    });

    setSelectedRows(newSelectedRows);
    setAllSelected(newAllSelected);
  };

  // Fonctions pour le redimensionnement des colonnes
  const handleResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    resizingColumnRef.current = columnKey;
    startXRef.current = e.clientX;

    // Trouver la cellule d'en-tête correspondante et obtenir sa largeur
    const headerCell = tableRef.current?.querySelector(`[data-column-key="${columnKey}"]`);
    if (headerCell) {
      startWidthRef.current = headerCell.getBoundingClientRect().width;
    }

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingColumnRef.current) return;

    const columnKey = resizingColumnRef.current;
    const diffX = e.clientX - startXRef.current;
    const newWidth = Math.max(50, startWidthRef.current + diffX); // Minimum 50px

    // Mettre à jour la largeur de la colonne dans l'état
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.key === columnKey
          ? { ...col, width: `${newWidth}px` }
          : col
      )
    );
  };

  const handleResizeEnd = () => {
    resizingColumnRef.current = null;
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Fonction pour basculer la visibilité d'une colonne
  const toggleColumnVisibility = (columnKey: string) => {
    setColumns(prevColumns =>
      prevColumns.map(col =>
        col.key === columnKey
          ? { ...col, hidden: !col.hidden }
          : col
      )
    );
  };

  // Filtrer les colonnes visibles
  const visibleColumns = columns.filter(col => !col.hidden);

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Colonnes groupables
  const groupableColumns = columns.filter(col => col.groupable !== false);

  // Déterminer si nous affichons des lignes groupées
  const isGroupedView = enableGrouping && groupBy && groupedData.length > 0;

  return (
    <div className="space-y-2" ref={tableRef}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {enableFiltering && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Search size={16} />
              {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            </Button>
          )}

          {/* Bouton pour le groupement */}
          {enableGrouping && (
            <DropdownMenu>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "flex items-center gap-2",
                          groupBy ? "bg-primary/10" : ""
                        )}
                      >
                        <Layers size={16} />
                        <span className="sr-only md:not-sr-only">
                          {groupBy
                            ? `Groupé par ${columns.find(c => c.key === groupBy)?.label || groupBy}`
                            : 'Grouper par'}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Grouper les données</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenuContent>
                <DropdownMenuLabel>Grouper par</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setGroupingColumn(null)}
                  className="flex items-center gap-2"
                >
                  <span className={cn(
                    "h-4 w-4 rounded-sm border flex items-center justify-center",
                    groupBy === null ? "bg-primary" : ""
                  )}>
                    {groupBy === null && (
                      <span className="h-2 w-2 bg-white rounded-sm" />
                    )}
                  </span>
                  <span>Aucun groupement</span>
                </DropdownMenuItem>
                {groupableColumns.map(column => (
                  <DropdownMenuItem
                    key={`groupby-${column.key}`}
                    onClick={() => setGroupingColumn(column.key)}
                    className="flex items-center gap-2"
                  >
                    <span className={cn(
                      "h-4 w-4 rounded-sm border flex items-center justify-center",
                      groupBy === column.key ? "bg-primary" : ""
                    )}>
                      {groupBy === column.key && (
                        <span className="h-2 w-2 bg-white rounded-sm" />
                      )}
                    </span>
                    <span>{column.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Bouton pour gérer les colonnes */}
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings size={16} />
                      <span className="sr-only md:not-sr-only">Colonnes</span>
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Gérer les colonnes</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent>
              <DropdownMenuLabel>Afficher/Masquer les colonnes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {columns.map(column => (
                <DropdownMenuItem
                  key={`visibility-${column.key}`}
                  onClick={() => toggleColumnVisibility(column.key)}
                  className="flex items-center gap-2"
                >
                  <Checkbox
                    checked={!column.hidden}
                    id={`col-visibility-${column.key}`}
                    onCheckedChange={() => toggleColumnVisibility(column.key)}
                  />
                  <label
                    htmlFor={`col-visibility-${column.key}`}
                    className="flex-grow cursor-pointer"
                  >
                    {column.label}
                  </label>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Bouton d'export */}
          {enableExport && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportToCSV}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} />
                    <span className="sr-only md:not-sr-only">Exporter</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exporter en CSV</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Badges des filtres actifs */}
        {Object.keys(filters).length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {Object.keys(filters).map((key) => {
              const column = columns.find(col => col.key === key);
              return (
                <Badge
                  key={`filter-badge-${key}`}
                  variant="secondary"
                  className="px-2 py-1 flex items-center gap-1"
                >
                  <span>{column?.label || key}: {filters[key]}</span>
                  <X
                    size={14}
                    className="cursor-pointer hover:text-destructive"
                    onClick={() => removeFilter(key)}
                  />
                </Badge>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <X size={14} />
              Tout effacer
            </Button>
          </div>
        )}

        {/* Badge du groupement actif */}
        {groupBy && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="px-2 py-1 flex items-center gap-1"
            >
              <span>Groupé par: {columns.find(col => col.key === groupBy)?.label || groupBy}</span>
              <X
                size={14}
                className="cursor-pointer hover:text-destructive"
                onClick={() => setGroupingColumn(null)}
              />
            </Badge>
          </div>
        )}
      </div>

      <div className={cn(
        "rounded-md border overflow-hidden",
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white"
      )}>
        <div className="overflow-x-auto">
          <Table className={cn(compact ? "table-compact" : "")}>
            <TableHeader>
              <TableRow className={cn(
                darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-700",
                compact ? "h-8" : ""
              )}>
                {/* Colonne de sélection */}
                {enableSelection && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Sélectionner toutes les lignes"
                    />
                  </TableHead>
                )}

                {/* Colonne vide pour les groupes */}
                {isGroupedView && (
                  <TableHead className="w-[40px]" />
                )}

                {/* Colonnes de données */}
                {visibleColumns.map((column) => (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.className,
                      "relative",
                      enableSorting && column.sortable !== false ? "cursor-pointer" : "",
                      compact ? "py-1" : ""
                    )}
                    style={{ width: column.width }}
                    data-column-key={column.key}
                    onClick={() => {
                      if (enableSorting && column.sortable !== false) {
                        handleSort(column.key);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 pr-4">
                      <span>{column.label}</span>
                      {enableSorting && column.sortable !== false && (
                        <ArrowUpDown
                          size={16}
                          className={cn(
                            "transition-transform",
                            sortConfig.key === column.key && sortConfig.direction === 'asc'
                              ? "text-primary rotate-0"
                              : sortConfig.key === column.key && sortConfig.direction === 'desc'
                                ? "text-primary rotate-180"
                                : "text-gray-400"
                          )}
                        />
                      )}
                    </div>

                    {/* Poignée de redimensionnement */}
                    {enableColumnResize && (
                      <div
                        className={cn(
                          "absolute right-0 top-0 h-full w-1 cursor-col-resize",
                          "hover:bg-primary/60 active:bg-primary",
                          darkMode ? "hover:bg-blue-500/60 active:bg-blue-500" : "hover:bg-primary/60 active:bg-primary"
                        )}
                        onMouseDown={(e) => handleResizeStart(e, column.key)}
                      />
                    )}
                  </TableHead>
                ))}
              </TableRow>

              {/* Ligne des filtres */}
              {enableFiltering && showFilters && (
                <TableRow className={darkMode ? "bg-gray-800" : "bg-gray-50"}>
                  {/* Espace pour la colonne de sélection */}
                  {enableSelection && (
                    <TableHead />
                  )}

                  {/* Espace pour la colonne de groupe */}
                  {isGroupedView && (
                    <TableHead />
                  )}

                  {/* Filtres pour chaque colonne */}
                  {visibleColumns.map((column) => (
                    <TableHead key={`filter-${column.key}`}>
                      {column.filterable !== false ? (
                        <Input
                          placeholder={`Filtrer ${column.label.toLowerCase()}`}
                          value={filters[column.key] || ''}
                          onChange={(e) => handleFilter(column, e.target.value)}
                          className={cn(
                            "max-w-full text-xs",
                            compact ? "h-7 py-1" : "",
                            darkMode ? "bg-gray-700 border-gray-600 text-white placeholder:text-gray-400" : ""
                          )}
                        />
                      ) : (
                        <div></div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              )}
            </TableHeader>

            <TableBody>
              {displayData.length === 0 && !isGroupedView ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + (enableSelection ? 1 : 0) + (isGroupedView ? 1 : 0)}
                    className={cn(
                      "h-24 text-center",
                      darkMode ? "text-gray-300" : "text-gray-500"
                    )}
                  >
                    {emptyStateComponent || "Aucune donnée disponible"}
                  </TableCell>
                </TableRow>
              ) : isGroupedView ? (
                // Affichage des données groupées
                groupedData.map((group) => (
                  <React.Fragment key={`group-${group.groupValue}`}>
                    {/* Ligne d'en-tête du groupe */}
                    <TableRow
                      className={cn(
                        "cursor-pointer transition-colors",
                        darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200",
                      )}
                      onClick={() => toggleGroupExpansion(String(group.groupValue))}
                    >
                      {/* Espace pour la colonne de sélection */}
                      {enableSelection && (
                        <TableCell />
                      )}

                      {/* Icône d'expansion */}
                      <TableCell className="w-[40px] p-0 pl-2">
                        {expandedGroups[String(group.groupValue)] ?
                          <ChevronDown size={16} /> :
                          <ChevronRight size={16} />
                        }
                      </TableCell>

                      {/* Nom du groupe et nombre de lignes */}
                      <TableCell
                        colSpan={visibleColumns.length}
                        className={cn(
                          "font-medium",
                          darkMode ? "text-white" : ""
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {String(group.groupValue)}
                            <span className="ml-2 text-sm text-gray-500">
                              ({group.rows.length} élément{group.rows.length > 1 ? 's' : ''})
                            </span>
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Lignes du groupe, uniquement affichées si le groupe est développé */}
                    {expandedGroups[String(group.groupValue)] &&
                      group.rows
                        .filter((_, index) => {
                          if (!enablePagination) return true;
                          const pageStart = (currentPage - 1) * itemsPerPage;
                          const pageEnd = pageStart + itemsPerPage;
                          return index >= pageStart && index < pageEnd;
                        })
                        .map((row) => (
                          <TableRow
                            key={row[keyField] as string | number}
                            className={cn(
                              "transition-colors pl-8",
                              onRowClick ? "cursor-pointer" : "",
                              rowClassName ? rowClassName(row) : "",
                              darkMode ? "border-gray-700 hover:bg-gray-800/50" : "hover:bg-gray-50",
                              compact ? "h-8" : ""
                            )}
                            onClick={(e) => {
                              // Éviter de déclencher onRowClick si on clique sur la case à cocher
                              if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                                return;
                              }
                              if (onRowClick) onRowClick(row);
                            }}
                          >
                            {/* Case à cocher de sélection */}
                            {enableSelection && (
                              <TableCell className="w-[40px]">
                                <Checkbox
                                  checked={!!selectedRows[row[keyField] as string]}
                                  onCheckedChange={() => toggleRowSelection(row[keyField] as string)}
                                  aria-label={`Sélectionner la ligne ${row[keyField]}`}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </TableCell>
                            )}

                            {/* Espace pour l'indentation */}
                            <TableCell className="w-[40px] p-0" />

                            {/* Cellules de données */}
                            {visibleColumns.map((column) => (
                              <TableCell
                                key={`${row[keyField]}-${column.key}`}
                                className={cn(
                                  column.cellClassName,
                                  compact ? "py-1" : "",
                                  darkMode ? "text-gray-200" : ""
                                )}
                              >
                                {renderCellValue(row, column)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                    }
                  </React.Fragment>
                ))
              ) : (
                // Affichage normal (non groupé)
                displayData.map((row) => (
                  <TableRow
                    key={row[keyField] as string | number}
                    className={cn(
                      "transition-colors",
                      onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : "",
                      rowClassName ? rowClassName(row) : "",
                      darkMode ? "border-gray-700 hover:bg-gray-800/50" : "hover:bg-gray-50",
                      compact ? "h-8" : ""
                    )}
                    onClick={(e) => {
                      // Éviter de déclencher onRowClick si on clique sur la case à cocher
                      if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                        return;
                      }
                      if (onRowClick) onRowClick(row);
                    }}
                  >
                    {/* Case à cocher de sélection */}
                    {enableSelection && (
                      <TableCell className="w-[40px]">
                        <Checkbox
                          checked={!!selectedRows[row[keyField] as string]}
                          onCheckedChange={() => toggleRowSelection(row[keyField] as string)}
                          aria-label={`Sélectionner la ligne ${row[keyField]}`}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}

                    {/* Cellules de données */}
                    {visibleColumns.map((column) => (
                      <TableCell
                        key={`${row[keyField]}-${column.key}`}
                        className={cn(
                          column.cellClassName,
                          compact ? "py-1" : "",
                          darkMode ? "text-gray-200" : ""
                        )}
                      >
                        {renderCellValue(row, column)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className={cn(
          "flex items-center justify-between mt-4",
          darkMode ? "text-gray-200" : "text-gray-700"
        )}>
          <div className="text-sm">
            Affichage de {Math.min((currentPage - 1) * itemsPerPage + 1, filteredData.length)} à {Math.min(currentPage * itemsPerPage, filteredData.length)} sur {filteredData.length} éléments
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={cn(
                "px-2",
                darkMode ? "border-gray-600 hover:bg-gray-700" : ""
              )}
            >
              <ChevronsLeft size={16} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={cn(
                "px-2",
                darkMode ? "border-gray-600 hover:bg-gray-700" : ""
              )}
            >
              <ChevronLeft size={16} />
            </Button>

            <span className="px-2">
              Page {currentPage} sur {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={cn(
                "px-2",
                darkMode ? "border-gray-600 hover:bg-gray-700" : ""
              )}
            >
              <ChevronRight size={16} />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={cn(
                "px-2",
                darkMode ? "border-gray-600 hover:bg-gray-700" : ""
              )}
            >
              <ChevronsRight size={16} />
            </Button>

            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className={cn(
                "ml-2 py-1 px-2 rounded-md border text-sm",
                darkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-200"
              )}
            >
              {[5, 10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} par page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Information sur les éléments sélectionnés */}
      {enableSelection && Object.values(selectedRows).some(Boolean) && (
        <div className={cn(
          "mt-2 p-2 rounded-md flex items-center justify-between",
          darkMode ? "bg-blue-900/20 text-blue-100" : "bg-blue-50 text-blue-700"
        )}>
          <span>
            {Object.values(selectedRows).filter(Boolean).length} élément(s) sélectionné(s)
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedRows({});
              setAllSelected(false);
            }}
            className="text-xs"
          >
            <X size={14} className="mr-1" />
            Effacer la sélection
          </Button>
        </div>
      )}
    </div>
  );
}

export default KDTable;