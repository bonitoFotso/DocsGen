import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
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
  MoreHorizontal,
  Filter,
  Download,
  Settings,
  Loader2,
  X,
  Save,
  Eye
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter
} from "@/components/ui/sheet";
import React from 'react';
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CSVLink } from "react-csv";
import { useLocalStorage } from '@/hooks/useLocalStorage';

// Types
interface KDTableData {
  id: number | string;
  [key: string]: unknown;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface KDTableColumn<T extends KDTableData> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
  align?: 'left' | 'center' | 'right';
  formatForExport?: (value: unknown) => string;
  columnClassName?: string;
  cellClassName?: string;
}

interface PaginationConfig {
  pageSizes?: number[];
  defaultPageSize?: number;
  serverSidePagination?: boolean;
  totalItems?: number;
  onPaginationChange?: (page: number, pageSize: number) => void;
}

interface FilterConfig {
  key: string;
  value: string | number | boolean | null;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan' | 'between' | 'in';
  secondValue?: string | number | null; // Pour l'opérateur 'between'
  values?: Array<string | number | boolean | null>; // Pour l'opérateur 'in'
}

interface KDTableProps<T extends KDTableData> {
  data: T[];
  columns: KDTableColumn<T>[];
  groupByOptions?: Array<{ key: string, label: string }>;
  title?: string;
  onRowClick?: (row: T) => void;
  initialGroupBy?: string;
  initialSort?: SortConfig;
  initialFilters?: FilterConfig[];
  searchPlaceholder?: string;
  noGroupText?: string;
  noResultsText?: string;
  pagination?: PaginationConfig;
  className?: string;
  densiti?: 'compact' | 'normal' | 'comfortable';
  alternateRowColors?: boolean;
  bordered?: boolean;
  headerActions?: React.ReactNode;
  isLoading?: boolean;
  uniqueId?: string; // Pour sauvegarder les préférences
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  mobileCardRenderer?: (row: T) => React.ReactNode;
  emptyStateComponent?: React.ReactNode;
  exportFileName?: string;
  showColumnVisibilityControl?: boolean;
  refreshData?: () => void;
  showRefreshButton?: boolean;
  disableMemorization?: boolean;
  dateFormat?: string;
  i18n?: {
    search?: string;
    noResults?: string;
    noGroup?: string;
    loading?: string;
    itemsPerPage?: string;
    filteredItems?: string;
    exportData?: string;
    columnVisibility?: string;
    resetFilters?: string;
    savePreferences?: string;
    fullscreen?: string;
    exitFullscreen?: string;
    firstPage?: string;
    lastPage?: string;
    nextPage?: string;
    previousPage?: string;
    selectAll?: string;
    filterMenu?: string;
    equals?: string;
    contains?: string;
    startsWith?: string;
    endsWith?: string;
    greaterThan?: string;
    lessThan?: string;
    between?: string;
    inList?: string;
    apply?: string;
    clear?: string;
    and?: string;
    or?: string;
    filterOperator?: string;
    filterValue?: string;
    filterOptions?: string;
    applyFilter?: string;
    clearFilter?: string;
    settings?: string;
    visibleColumns?: string;
    resetToDefault?: string;
    showDetails?: string;
  };
}

// Fonction d'exportation CSV
const prepareDataForExport = <T extends KDTableData>(
  data: T[],
  columns: KDTableColumn<T>[]
): { headers: { label: string; key: string }[]; data: Record<string, string>[] } => {
  const headers = columns.map((column) => ({
    label: column.label,
    key: column.key,
  }));

  const formattedData = data.map((row) => {
    const newRow: Record<string, string> = {};
    columns.forEach((column) => {
      const value = row[column.key];
      newRow[column.key] = column.formatForExport
        ? column.formatForExport(value)
        : value !== null && value !== undefined
          ? String(value)
          : '';
    });
    return newRow;
  });

  return { headers, data: formattedData };
};

// Composant de cellule
const TableCellContent = <T extends KDTableData>({
  column,
  value,
  row,
}: {
  column: KDTableColumn<T>;
  value: unknown;
  row: T;
}) => {
  if (column.render) {
    return column.render(value, row);
  }

  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">-</span>;
  }

  return <span>{String(value)}</span>;
};

// Composant principal du tableau
const KDTable = <T extends KDTableData>({
  data,
  columns,
  groupByOptions = [],
  title,
  onRowClick,
  initialGroupBy = 'none',
  initialSort = { key: null, direction: 'asc' },
  initialFilters = [],
  searchPlaceholder = "Rechercher...",
  noGroupText = "Aucun groupement",
  noResultsText = "Aucun résultat trouvé",
  pagination = { pageSizes: [10, 25, 50, 100], defaultPageSize: 10 },
  className = "",
  alternateRowColors = true,
  bordered = true,
  headerActions,
  isLoading = false,
  uniqueId,
  selectable = false,
  densiti = 'normal',
  onSelectionChange,
  mobileCardRenderer,
  emptyStateComponent,
  exportFileName = "export",
  showColumnVisibilityControl = true,
  refreshData,
  showRefreshButton = true,
  disableMemorization = false,
  i18n
}: KDTableProps<T>) => {
  // Traduire les textes
  const t = {
    search: i18n?.search ?? searchPlaceholder,
    noResults: i18n?.noResults ?? noResultsText,
    noGroup: i18n?.noGroup ?? noGroupText,
    loading: i18n?.loading ?? "Chargement...",
    itemsPerPage: i18n?.itemsPerPage ?? "Lignes par page:",
    filteredItems: i18n?.filteredItems ?? "Affichage de {start} à {end} sur {total} éléments",
    exportData: i18n?.exportData ?? "Exporter les données",
    columnVisibility: i18n?.columnVisibility ?? "Visibilité des colonnes",
    resetFilters: i18n?.resetFilters ?? "Réinitialiser les filtres",
    savePreferences: i18n?.savePreferences ?? "Enregistrer les préférences",
    fullscreen: i18n?.fullscreen ?? "Plein écran",
    exitFullscreen: i18n?.exitFullscreen ?? "Quitter le plein écran",
    firstPage: i18n?.firstPage ?? "Première page",
    lastPage: i18n?.lastPage ?? "Dernière page",
    nextPage: i18n?.nextPage ?? "Page suivante",
    previousPage: i18n?.previousPage ?? "Page précédente",
    selectAll: i18n?.selectAll ?? "Tout sélectionner",
    filterMenu: i18n?.filterMenu ?? "Filtrer",
    equals: i18n?.equals ?? "Égal à",
    contains: i18n?.contains ?? "Contient",
    startsWith: i18n?.startsWith ?? "Commence par",
    endsWith: i18n?.endsWith ?? "Se termine par",
    greaterThan: i18n?.greaterThan ?? "Supérieur à",
    lessThan: i18n?.lessThan ?? "Inférieur à",
    between: i18n?.between ?? "Entre",
    inList: i18n?.inList ?? "Dans la liste",
    apply: i18n?.apply ?? "Appliquer",
    clear: i18n?.clear ?? "Effacer",
    and: i18n?.and ?? "ET",
    or: i18n?.or ?? "OU",
    filterOperator: i18n?.filterOperator ?? "Opérateur",
    filterValue: i18n?.filterValue ?? "Valeur",
    filterOptions: i18n?.filterOptions ?? "Options de filtre",
    applyFilter: i18n?.applyFilter ?? "Appliquer le filtre",
    clearFilter: i18n?.clearFilter ?? "Effacer le filtre",
    settings: i18n?.settings ?? "Paramètres",
    visibleColumns: i18n?.visibleColumns ?? "Colonnes visibles",
    resetToDefault: i18n?.resetToDefault ?? "Réinitialiser",
    showDetails: i18n?.showDetails ?? "Voir les détails"
  };

  // Détection mobile
  const isMobile = useMediaQuery("(max-width: 768px)");

  // État local
  const [tableData, setTableData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [groupBy, setGroupBy] = useState<string>(initialGroupBy);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSort);
  const [search, setSearch] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns.map(column => column.key)
  );
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>(initialFilters);
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(pagination.defaultPageSize || 10);
  const [, setIsRefreshing] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Identifiant unique pour localStorage
  const storageKey = uniqueId ? `kdtable-preferences-${uniqueId}` : null;

  // Gestion du stockage local des préférences
  const [savedPreferences, setSavedPreferences] = useLocalStorage<{
    visibleColumns: string[];
    sortConfig: SortConfig;
    groupBy: string;
    pageSize: number;
    density: string;
  } | null>(
    storageKey || "",
    null
  );

  // Charger les préférences au démarrage si disponibles et mémorisation activée
  useEffect(() => {
    if (!disableMemorization && storageKey && savedPreferences) {
      setVisibleColumns(savedPreferences.visibleColumns);
      setSortConfig(savedPreferences.sortConfig);
      setGroupBy(savedPreferences.groupBy);
      setPageSize(savedPreferences.pageSize);

      // Densité
      if (savedPreferences.density === 'compact' ||
        savedPreferences.density === 'normal' ||
        savedPreferences.density === 'comfortable') {
        setDensity(savedPreferences.density);
      }
    }
  }, [disableMemorization, savedPreferences, storageKey]);

  // État pour la densité
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>(densiti);

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

  // Enregistrer les préférences
  const savePreferences = useCallback(() => {
    if (!disableMemorization && storageKey) {
      setSavedPreferences({
        visibleColumns,
        sortConfig,
        groupBy,
        pageSize,
        density,
      });
    }
  }, [disableMemorization, storageKey, visibleColumns, sortConfig, groupBy, pageSize, density, setSavedPreferences]);

  // Réinitialiser les préférences
  const resetPreferences = useCallback(() => {
    setVisibleColumns(columns.map(column => column.key));
    setSortConfig(initialSort);
    setGroupBy(initialGroupBy);
    setPageSize(pagination.defaultPageSize || 10);
    setDensity('normal');

    if (!disableMemorization && storageKey) {
      setSavedPreferences(null);
    }
  }, [columns, initialSort, initialGroupBy, pagination.defaultPageSize, disableMemorization, storageKey, setSavedPreferences]);

  // Initialiser les données
  useEffect(() => {
    setTableData(data);
  }, [data]);

  // Fonction de filtrage
  const applyFilters = useCallback((items: T[], filters: FilterConfig[]): T[] => {
    if (filters.length === 0) return items;

    return items.filter(item => {
      return filters.every(filter => {
        const value = item[filter.key];

        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return typeof value === 'string' &&
              value.toLowerCase().includes(String(filter.value).toLowerCase());
          case 'startsWith':
            return typeof value === 'string' &&
              value.toLowerCase().startsWith(String(filter.value).toLowerCase());
          case 'endsWith':
            return typeof value === 'string' &&
              value.toLowerCase().endsWith(String(filter.value).toLowerCase());
          case 'greaterThan':
            return Number(value) > Number(filter.value);
          case 'lessThan':
            return Number(value) < Number(filter.value);
          case 'between': {
            const numValue = Number(value);
            return numValue >= Number(filter.value) && numValue <= Number(filter.secondValue);
          }
          case 'in':
            return filter.values?.includes(value as string | number | boolean | null);
          default:
            return true;
        }
      });
    });
  }, []);

  // Filtrer et trier les données
  const processedData = useMemo(() => {
    let result = [...tableData];

    // Appliquer la recherche globale
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(item => {
        return columns.some(column => {
          if (!visibleColumns.includes(column.key)) return false;

          const value = item[column.key];
          return value !== undefined && value !== null &&
            String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Appliquer les filtres
    result = applyFilters(result, activeFilters);

    // Appliquer le tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        // Gestion des valeurs nulles/undefined
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;

        // Tri numérique si les deux valeurs sont des nombres
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // Tri de dates (détection basique de formats de date)
        const aDate = new Date(aValue as string);
        const bDate = new Date(bValue as string);
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortConfig.direction === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
        }

        // Tri alphabétique par défaut
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (sortConfig.direction === 'asc') {
          return aString.localeCompare(bString);
        }
        return bString.localeCompare(aString);
      });
    }

    return result;
  }, [tableData, search, activeFilters, sortConfig, columns, visibleColumns, applyFilters]);

  // Mettre à jour les données filtrées quand le traitement change
  useEffect(() => {
    setFilteredData(processedData);
    setCurrentPage(1); // Réinitialiser la pagination quand les filtres changent
  }, [processedData]);

  // Calculer le nombre total de pages
  const totalPages = pagination.serverSidePagination
    ? Math.ceil((pagination.totalItems || 0) / pageSize)
    : Math.ceil(filteredData.length / pageSize);

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

  // Gérer le rafraîchissement
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    if (refreshData) {
      refreshData();
    }

    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [refreshData]);

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

  // Grouper les données paginées
  const getPagedData = useCallback(() => {
    if (pagination.serverSidePagination) {
      return filteredData;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, pageSize, pagination.serverSidePagination]);

  // Grouper les données
  const groupData = useCallback(() => {
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
  }, [getPagedData, groupBy]);

  // Navigation de pagination
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);

    if (pagination.serverSidePagination && pagination.onPaginationChange) {
      pagination.onPaginationChange(page, pageSize);
    }
  };

  // Changer la taille de page
  const changePageSize = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);

    if (pagination.serverSidePagination && pagination.onPaginationChange) {
      pagination.onPaginationChange(1, size);
    }
  };

  // Générer la liste des pages à afficher
  const getPageNumbers = useCallback(() => {
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
  }, [totalPages, currentPage]);

  // Gérer la sélection de lignes
  const toggleRowSelection = (rowId: string | number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  // Mettre à jour le callback avec les lignes sélectionnées
  useEffect(() => {
    if (onSelectionChange) {
      const selectedItems = tableData.filter(item => selectedRows.has(item.id));
      onSelectionChange(selectedItems);
    }
  }, [selectedRows, tableData, onSelectionChange]);

  // Sélectionner/désélectionner toutes les lignes
  const toggleSelectAll = () => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      const newSelected = new Set<string | number>();
      filteredData.forEach(item => {
        newSelected.add(item.id);
      });
      setSelectedRows(newSelected);
    }
  };

  // Format du message pagination
  const formatPaginationMessage = useCallback(() => {
    const start = Math.min((currentPage - 1) * pageSize + 1, filteredData.length);
    const end = Math.min(currentPage * pageSize, filteredData.length);
    const total = filteredData.length;

    if (pagination.serverSidePagination) {
      return t.filteredItems
        .replace('{start}', String(start))
        .replace('{end}', String(end))
        .replace('{total}', String(pagination.totalItems || 0));
    }

    return t.filteredItems
      .replace('{start}', String(start))
      .replace('{end}', String(end))
      .replace('{total}', String(total));
  }, [currentPage, pageSize, filteredData.length, pagination.serverSidePagination, pagination.totalItems, t.filteredItems]);

  // Préparation des données pour l'export
  const exportData = useMemo(() => {
    return prepareDataForExport(
      filteredData,
      columns.filter(col => visibleColumns.includes(col.key))
    );
  }, [filteredData, columns, visibleColumns]);

  // Rendu mobile sous forme de cartes
  const renderMobileCard = (row: T) => {
    if (mobileCardRenderer) {
      return mobileCardRenderer(row);
    }

    return (
      <div className="p-4 border rounded-md mb-2 bg-card">
        {visibleColumns.map(columnKey => {
          const column = columns.find(col => col.key === columnKey);
          if (!column) return null;

          return (
            <div key={columnKey} className="flex justify-between py-1 border-b last:border-0">
              <span className="font-medium text-muted-foreground">{column.label}:</span>
              <div className={column.cellClassName}>
                <TableCellContent column={column} value={row[columnKey]} row={row} />
              </div>
            </div>
          );
        })}

        <div className="mt-2 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRowClick?.(row)}
          >
            <Eye className="mr-1 h-4 w-4" />
            {t.showDetails}
          </Button>
        </div>
      </div>
    );
  };

  // Composant vide
  const renderEmptyState = () => {
    if (emptyStateComponent) {
      return emptyStateComponent;
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted w-20 h-20 flex items-center justify-center mb-4">
          <Search className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">{t.noResults}</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setSearch('');
            setActiveFilters([]);
          }}
        >
          Effacer les filtres
        </Button>
      </div>
    );
  };

  // Rendu du tableau complet
  return (
    <div
      ref={tableRef}
      className={`${className} transition-all duration-300 ${isFullscreen ? 'bg-white p-4 flex flex-col h-screen' : ''}`}
      role="region"
      aria-label={title || "Tableau de données"}
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
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t.search}
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Search size={16} strokeWidth={2} />
              </div>
              {search && (
                <button
                  className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Effacer la recherche"
                  onClick={() => setSearch('')}
                >
                  <X size={16} strokeWidth={2} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {headerActions}

            {/* Filtre actif badges */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-1 mr-2">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <span>{columns.find(c => c.key === filter.key)?.label}: {String(filter.value)}</span>
                    <button
                      onClick={() => {
                        setActiveFilters(prev => prev.filter((_, i) => i !== index));
                      }}
                      className="ml-1 rounded-full hover:bg-muted p-0.5"
                      aria-label="Supprimer le filtre"
                    >
                      <X size={12} />
                    </button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setActiveFilters([])}
                >
                  Tout effacer
                </Button>
              </div>
            )}

            {/* Boutons d'actions */}
            <div className="flex flex-wrap items-center gap-2">
              {showRefreshButton && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={handleRefresh}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rafraîchir les données</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Menu d'options */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-1">
                    <MoreHorizontal size={16} />
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={toggleFullscreen}>
                    {isFullscreen ? (
                      <><Minimize2 className="mr-2 h-4 w-4" /> {t.exitFullscreen}</>
                    ) : (
                      <><Maximize2 className="mr-2 h-4 w-4" /> {t.fullscreen}</>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Densité</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuRadioGroup value={density} onValueChange={(value) => setDensity(value as "compact" | "normal" | "comfortable")}>
                          <DropdownMenuRadioItem value="compact">Compact</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="normal">Normal</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="comfortable">Confortable</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  {showColumnVisibilityControl && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>{t.visibleColumns}</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {columns.map((column) => (
                            <DropdownMenuCheckboxItem
                              key={column.key}
                              checked={visibleColumns.includes(column.key)}
                              onCheckedChange={(checked) => {
                                setVisibleColumns(
                                  checked
                                    ? [...visibleColumns, column.key]
                                    : visibleColumns.filter((key) => key !== column.key)
                                );
                              }}
                            >
                              {column.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setVisibleColumns(columns.map((col) => col.key))}
                          >
                            Afficher toutes les colonnes
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}

                  <DropdownMenuSeparator />

                  <CSVLink
                    data={exportData.data}
                    headers={exportData.headers}
                    filename={`${exportFileName}-${new Date().toISOString().slice(0, 10)}.csv`}
                    className="flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>{t.exportData}</span>
                  </CSVLink>

                  {!disableMemorization && storageKey && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={savePreferences}>
                        <Save className="mr-2 h-4 w-4" />
                        <span>{t.savePreferences}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={resetPreferences}>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        <span>{t.resetToDefault}</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9"
                      onClick={toggleFullscreen}
                    >
                      {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isFullscreen ? t.exitFullscreen : t.fullscreen}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
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
                {t.noGroup}
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
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t.loading}</p>
              </div>
            </div>
          ) : filteredData.length === 0 ? (
            renderEmptyState()
          ) : isMobile ? (
            <div className="p-4 space-y-2">
              {getPagedData().map(row => (
                <div key={row.id}>
                  {renderMobileCard(row)}
                </div>
              ))}
            </div>
          ) : (
            <div className={`${bordered ? 'rounded-md border' : ''} overflow-hidden`}>
              <div className={`${isFullscreen ? 'h-full' : ''} overflow-auto`}>
                <Table className={densityStyles[density].table}>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10">
                    <TableRow className="hover:bg-muted/20">
                      {selectable && (
                        <TableHead className="w-[40px]">
                          <Checkbox
                            checked={
                              filteredData.length > 0 &&
                              filteredData.every(row => selectedRows.has(row.id))
                            }
                            onCheckedChange={toggleSelectAll}
                            aria-label={t.selectAll}
                          />
                        </TableHead>
                      )}

                      {columns
                        .filter(column => visibleColumns.includes(column.key))
                        .map(column => (
                          <TableHead
                            key={column.key}
                            className={cn(
                              `${column.sortable === false ? '' : 'cursor-pointer'}`,
                              column.columnClassName
                            )}
                            style={{
                              width: column.width,
                              textAlign: column.align || 'left'
                            }}
                          >
                            <div className="flex items-center gap-1 justify-between">
                              <button
                                className={`flex items-center gap-1 ${column.sortable === false ? 'cursor-default' : 'cursor-pointer'}`}
                                onClick={() => handleSort(column.key)}
                                disabled={column.sortable === false}
                                style={{ justifyContent: column.align === 'center' ? 'center' : column.align === 'right' ? 'flex-end' : 'flex-start' }}
                                aria-label={`Trier par ${column.label}`}
                                aria-sort={
                                  sortConfig.key === column.key
                                    ? sortConfig.direction === 'asc'
                                      ? 'ascending'
                                      : 'descending'
                                    : 'none'
                                }
                              >
                                {column.label}
                                {getSortIcon(column.key)}
                              </button>

                              {column.filterable !== false && (
                                <Sheet>
                                  <SheetTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 rounded-full opacity-70 hover:opacity-100"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Filter size={14} />
                                    </Button>
                                  </SheetTrigger>
                                  <SheetContent>
                                    <SheetHeader>
                                      <SheetTitle>Filtrer par {column.label}</SheetTitle>
                                      <SheetDescription>
                                        Définissez les critères de filtre pour cette colonne.
                                      </SheetDescription>
                                    </SheetHeader>

                                    <div className="space-y-4 py-4">
                                      <div className="grid gap-2">
                                        <label
                                          htmlFor="filter-operator"
                                          className="text-sm font-medium"
                                        >
                                          Opérateur
                                        </label>
                                        <Select
                                          defaultValue="contains"
                                          onValueChange={(value) => {
                                            console.log(value);
                                          }}
                                        >
                                          <SelectTrigger id="filter-operator">
                                            <SelectValue placeholder="Sélectionner un opérateur" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="equals">{t.equals}</SelectItem>
                                            <SelectItem value="contains">{t.contains}</SelectItem>
                                            <SelectItem value="startsWith">{t.startsWith}</SelectItem>
                                            <SelectItem value="endsWith">{t.endsWith}</SelectItem>
                                            <SelectItem value="greaterThan">{t.greaterThan}</SelectItem>
                                            <SelectItem value="lessThan">{t.lessThan}</SelectItem>
                                            <SelectItem value="between">{t.between}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="grid gap-2">
                                        <label
                                          htmlFor="filter-value"
                                          className="text-sm font-medium"
                                        >
                                          Valeur
                                        </label>
                                        <Input
                                          id="filter-value"
                                          placeholder="Valeur à filtrer"
                                          className="col-span-2 h-8"
                                        />
                                      </div>
                                    </div>

                                    <SheetFooter>
                                      <SheetClose asChild>
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            // Effacer le filtre
                                          }}
                                        >
                                          Annuler
                                        </Button>
                                      </SheetClose>
                                      <SheetClose asChild>
                                        <Button
                                          onClick={() => {
                                            // Appliquer le filtre
                                            const newFilter: FilterConfig = {
                                              key: column.key,
                                              operator: 'contains',
                                              value: 'test' // À remplacer par la valeur réelle
                                            };
                                            setActiveFilters([...activeFilters, newFilter]);
                                          }}
                                        >
                                          Appliquer
                                        </Button>
                                      </SheetClose>
                                    </SheetFooter>
                                  </SheetContent>
                                </Sheet>
                              )}
                            </div>
                          </TableHead>
                        ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupData().map(({ group, data: groupData }) => (
                      <React.Fragment key={group}>
                        {groupBy !== 'none' && (
                          <TableRow
                            className="bg-muted/30 hover:bg-muted/50 border-t border-b"
                            data-state="group-header"
                          >
                            <TableCell
                              colSpan={visibleColumns.length + (selectable ? 1 : 0)}
                              className={densityStyles[density].cell}
                            >
                              <button
                                className="flex items-center w-full"
                                onClick={() => toggleGroup(group)}
                                aria-expanded={expandedGroups.has(group)}
                                aria-controls={`group-${group}`}
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
                              id={groupBy !== 'none' ? `group-${group}` : undefined}
                              className={`
                                ${onRowClick ? "cursor-pointer" : ""}
                                ${alternateRowColors && rowIndex % 2 === 1 ? 'bg-muted/20' : ''}
                                hover:bg-muted/40 transition-colors
                              `}
                              onClick={onRowClick ? () => onRowClick(row) : undefined}
                              data-selected={selectedRows.has(row.id)}
                              aria-selected={selectedRows.has(row.id)}
                            >
                              {selectable && (
                                <TableCell className={densityStyles[density].cell} onClick={(e) => e.stopPropagation()}>
                                  <Checkbox
                                    checked={selectedRows.has(row.id)}
                                    onCheckedChange={() => toggleRowSelection(row.id)}
                                    aria-label={`Sélectionner la ligne ${row.id}`}
                                  />
                                </TableCell>
                              )}

                              {columns
                                .filter(column => visibleColumns.includes(column.key))
                                .map(column => (
                                  <TableCell
                                    key={`${row.id}-${column.key}`}
                                    className={cn(densityStyles[density].cell, column.cellClassName)}
                                    style={{ textAlign: column.align || 'left' }}
                                  >
                                    <TableCellContent column={column} value={row[column.key]} row={row} />
                                  </TableCell>
                                ))}
                            </TableRow>
                          ))}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>

        {filteredData.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 border-t gap-4">
            <div className="text-sm text-muted-foreground">
              {formatPaginationMessage()}
            </div>

            <div className="flex items-center flex-wrap gap-4">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">{t.itemsPerPage}</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => changePageSize(Number(value))}
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.firstPage}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 ml-1"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeftCircle size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.previousPage}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

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

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 mr-1"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRightCircle size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.nextPage}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronsRight size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t.lastPage}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default KDTable;