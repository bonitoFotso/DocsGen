import { useState, useEffect, useCallback, useRef } from 'react';
import {
  KDTableContext,
  SortConfig,
  AdvancedFilter,
  TableDensity,
  TableVariant,
  ExportOption} from './types';
import { KDTableProps } from './types';

export function useKDTableState<T>(props: KDTableProps<T>): KDTableContext<T> {
  const {
    data = [],
    columns: initialColumns = [], 
    enablePagination = true,
    pageSize = 10,
    storageKey,
    compact = false,
    enableGrouping = false,
    groupBy,
    groupingFn,
    defaultGroupsCollapsed = false,
    enableAdvancedSearch = false,
    infiniteScroll = false,
    variant = "default",
  } = props;

  // Références

  // État du composant
  const [columns, setColumns] = useState(initialColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [displayData, setDisplayData] = useState<T[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});
  const [allSelected, setAllSelected] = useState(false);
  const [currentGroupBy, setCurrentGroupBy] = useState<string | string[] | null>(groupBy || null);
  const [groupedData, setGroupedData] = useState<Record<string, T[]>>({});
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [isAllExpanded, setIsAllExpanded] = useState(!defaultGroupsCollapsed);
  const [density, setDensity] = useState<TableDensity>(
    compact ? 'compact' : 'default'
  );
  const [tableVariant, setTableVariant] = useState<TableVariant>(variant);
  const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilter[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [activeViewId, setActiveViewId] = useState<string | null>(null);
  const [exportSelection, setExportSelection] = useState<ExportOption>('filtered');
  const [tempColumns, setTempColumns] = useState(initialColumns);
  const [isColumnSettingsOpen, setIsColumnSettingsOpen] = useState(false);
  
  // Utilité pour obtenir une valeur imbriquée à partir d'un chemin (ex: "user.name")
  const getNestedValue = useCallback((obj: T, path: string): unknown => {
    return path.split('.').reduce((prev, curr) => {
      return prev && typeof prev === 'object' && curr in (prev as Record<string, unknown>)
        ? (prev as Record<string, unknown>)[curr]
        : null;
    }, obj as unknown);
  }, []);

  // Fonction pour grouper les données
  const groupData = useCallback((dataToGroup: T[], groupByKey: string | string[] | null) => {
    if (!groupByKey || !enableGrouping) {
      return {};
    }

    // Utiliser la fonction de groupement personnalisée si fournie
    if (groupingFn) {
      return groupingFn(dataToGroup);
    }

    // Implémentation de groupement par défaut
    const result: Record<string, T[]> = {};

    if (Array.isArray(groupByKey)) {
      // Groupement multi-niveaux
      dataToGroup.forEach(item => {
        const groupValues = groupByKey.map(key => {
          const value = getNestedValue(item, key);
          return value !== null && value !== undefined ? String(value) : 'N/A';
        });

        const groupKey = groupValues.join(' / ');

        if (!result[groupKey]) {
          result[groupKey] = [];
        }

        result[groupKey].push(item);
      });
    } else {
      // Groupement simple niveau
      dataToGroup.forEach(item => {
        const value = getNestedValue(item, groupByKey);
        const groupKey = value !== null && value !== undefined ? String(value) : 'N/A';

        if (!result[groupKey]) {
          result[groupKey] = [];
        }

        result[groupKey].push(item);
      });
    }

    return result;
  }, [enableGrouping, getNestedValue, groupingFn]);

  // Initialiser l'état des groupes repliés/déployés
  useEffect(() => {
    if (enableGrouping && currentGroupBy) {
      const groups = groupData(filteredData, currentGroupBy);
      const initialCollapsedState: Record<string, boolean> = {};

      Object.keys(groups).forEach(groupKey => {
        initialCollapsedState[groupKey] = defaultGroupsCollapsed;
      });

      setCollapsedGroups(initialCollapsedState);
      setGroupedData(groups);
    }
  }, [enableGrouping, currentGroupBy, filteredData, groupData, defaultGroupsCollapsed]);

  // Charger les préférences depuis localStorage si storageKey est fourni
  useEffect(() => {
    if (storageKey) {
      try {
        const savedState = localStorage.getItem(`kdtable-${storageKey}`);
        if (savedState) {
          const {
            filters: savedFilters,
            sortConfig: savedSortConfig,
            columnsState,
            itemsPerPage: savedItemsPerPage,
            globalFilter: savedGlobalFilter,
            groupBy: savedGroupBy,
            collapsedGroups: savedCollapsedGroups,
            density: savedDensity,
            tableVariant: savedTableVariant,
            activeViewId: savedActiveViewId,
            advancedFilters: savedAdvancedFilters
          } = JSON.parse(savedState);

          if (savedFilters) setFilters(savedFilters);
          if (savedSortConfig) setSortConfig(savedSortConfig);
          if (savedItemsPerPage) setItemsPerPage(savedItemsPerPage);
          if (savedGlobalFilter) setGlobalFilter(savedGlobalFilter);
          if (savedGroupBy) setCurrentGroupBy(savedGroupBy);
          if (savedCollapsedGroups) setCollapsedGroups(savedCollapsedGroups);
          if (savedDensity) setDensity(savedDensity);
          if (savedTableVariant) setTableVariant(savedTableVariant);
          if (savedActiveViewId) setActiveViewId(savedActiveViewId);
          if (savedAdvancedFilters) setAdvancedFilters(savedAdvancedFilters);

          if (columnsState) {
            setColumns(initialColumns.map(col => {
              const savedCol = columnsState.find((c: { key: string }) => c.key === col.key);
              return savedCol
                ? { ...col, hidden: savedCol.hidden, width: savedCol.width }
                : col;
            }));
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
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
          globalFilter,
          sortConfig,
          columnsState,
          itemsPerPage,
          groupBy: currentGroupBy,
          collapsedGroups,
          density,
          tableVariant,
          activeViewId,
          advancedFilters
        }));
      } catch (error) {
        console.error("Error saving preferences:", error);
      }
    }
  }, [
    filters, 
    globalFilter, 
    sortConfig, 
    columns, 
    itemsPerPage, 
    storageKey, 
    currentGroupBy, 
    collapsedGroups,
    density,
    tableVariant,
    activeViewId,
    advancedFilters
  ]);

  // Mettre à jour les données filtrées quand les données d'entrée changent
  useEffect(() => {
    const newFilteredData = applyFiltersAndSort(
      data, 
      filters, 
      globalFilter, 
      sortConfig,
      columns,
      getNestedValue,
      enableAdvancedSearch ? advancedFilters : []
    );
    setFilteredData(newFilteredData);

    // Réinitialiser la page si nécessaire
    if (enablePagination && !infiniteScroll) {
      setCurrentPage(1);
    }

    // Réinitialiser la sélection
    setSelectedRows({});
    setAllSelected(false);
  }, [
    applyFiltersAndSort, 
    data, 
    enablePagination, 
    filters, 
    globalFilter, 
    sortConfig, 
    infiniteScroll,
    columns,
    getNestedValue,
    enableAdvancedSearch,
    advancedFilters
  ]);

  // Mettre à jour les données affichées quand les données filtrées ou la pagination changent
  useEffect(() => {
    // Si le groupement est activé et qu'on a une clé de groupement
    if (enableGrouping && currentGroupBy) {
      const groups = groupData(filteredData, currentGroupBy);
      
      if (Object.keys(groups).length === 0) {
        setGroupedData({});
      } else {
        setGroupedData(groups);
      }

      // Créer un tableau de données à afficher basé sur les groupes déployés/repliés

      Object.keys