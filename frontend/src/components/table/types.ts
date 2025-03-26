import { ReactNode } from 'react';

// Type pour la direction de tri
export type SortDirection = 'asc' | 'desc' | null;

// Configuration de tri
export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

// Définition d'une colonne
export interface ColumnDefinition<T> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'currency' | 'percentage' | 'progress' | 'status' | 'actions' | 'avatar' | 'image' | 'tags' | 'chip';
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  cellClassName?: string;
  defaultValue?: string | number | boolean;
  render?: (row: T) => ReactNode;
  sortFn?: (a: T, b: T) => number;
  filterFn?: (row: T, filterValue: string) => boolean;
  filterOptions?: { value: string; label: string }[];
  width?: string;
  hidden?: boolean;
  align?: 'left' | 'center' | 'right';
  formatOptions?: Intl.DateTimeFormatOptions | Intl.NumberFormatOptions;
  helpText?: string;
  fixed?: 'left' | 'right';
  group?: string;
  actions?: {
    icon: ReactNode;
    label: string;
    onClick: (row: T) => void;
    color?: string;
    disabled?: (row: T) => boolean;
  }[];
  statusColors?: Record<string, { bg: string; text: string }>;
  resizable?: boolean;
  minWidth?: string;
  priority?: number;
  tooltip?: string;
}

// Définition d'un filtre avancé
export interface AdvancedFilter {
  column: string;
  operator: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

// Configuration d'une vue sauvegardée
export interface SavedView {
  id: string;
  name: string;
  config: {
    filters: Record<string, string>;
    globalFilter: string;
    sortConfig: SortConfig;
    itemsPerPage: number;
    visibleColumns: string[];
    groupBy: string | string[] | null;
  };
}

// Types d'action en bloc
export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: T[]) => void;
  color?: string;
  variant?: 'default' | 'outline' | 'destructive';
}

// Densité de la table
export type TableDensity = 'compact' | 'default' | 'comfortable';

// Variante de la table
export type TableVariant = 'default' | 'minimal' | 'striped' | 'bordered';

// Format d'exportation
export type ExportFormat = 'csv' | 'json' | 'excel';

// Option d'exportation
export type ExportOption = 'all' | 'filtered' | 'selected';

// Traductions personnalisées
export interface TableTranslations {
  search?: string;
  filter?: string;
  export?: string;
  columns?: string;
  showFilters?: string;
  hideFilters?: string;
  clearFilters?: string;
  clearSelection?: string;
  itemsSelected?: string;
  itemsPerPage?: string;
  refresh?: string;
  page?: string;
  of?: string;
  globalSearch?: string;
  noData?: string;
  loading?: string;
  yes?: string;
  no?: string;
  expandAll?: string;
  collapseAll?: string;
  group?: string;
  groupBy?: string;
  ungrouped?: string;
  savePreferences?: string;
  resetPreferences?: string;
  columnSettings?: string;
  rowsPerPage?: string;
  showColumns?: string;
  hideColumns?: string;
  apply?: string;
  cancel?: string;
  columnVisibility?: string;
  columnOrder?: string;
  noResults?: string;
  searchPlaceholder?: string;
  filterPlaceholder?: string;
  exportTitle?: string;
  exportDescription?: string;
  exportFormat?: string;
  exportSuccess?: string;
  exportError?: string;
  rowActions?: string;
  bulkActions?: string;
  selectAll?: string;
  deselectAll?: string;
}

// Props pour le composant principal
export interface KDTableProps<T> {
  /**
   * Array of data objects to display in the table
   */
  data: T[];
  /**
   * Column definitions for the table
   */
  columns: ColumnDefinition<T>[];
  /**
   * Function to call when a row is clicked
   */
  onRowClick?: (row: T) => void;
  /**
   * Function to determine a custom class name for each row
   */
  rowClassName?: (row: T) => string;
  /**
   * Field to use as the unique key for each row
   * @default "id"
   */
  keyField?: string;
  /**
   * Enable filtering functionality
   * @default true
   */
  enableFiltering?: boolean;
  /**
   * Enable sorting functionality
   * @default true
   */
  enableSorting?: boolean;
  /**
   * Enable pagination functionality
   * @default true
   */
  enablePagination?: boolean;
  /**
   * Number of items to display per page
   * @default 10
   */
  pageSize?: number;
  /**
   * Enable row selection functionality
   * @default false
   */
  enableSelection?: boolean;
  /**
   * Function to call when selection changes
   */
  onSelectionChange?: (selectedRows: T[]) => void;
  /**
   * Component to display when there is no data
   */
  emptyStateComponent?: ReactNode;
  /**
   * Enable column resizing functionality
   * @default true
   */
  enableColumnResize?: boolean;
  /**
   * Enable data export functionality
   * @default true
   */
  enableExport?: boolean;
  /**
   * Display table in compact mode
   * @default false
   */
  compact?: boolean;
  /**
   * Key to use for storing table preferences in localStorage
   */
  storageKey?: string;
  /**
   * Use dark mode styling
   * @default false
   */
  darkMode?: boolean;
  /**
   * Disable row hover effect
   * @default false
   */
  disableHover?: boolean;
  /**
   * Enable sticky header
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * Maximum height of the table with scrolling
   */
  maxHeight?: string;
  /**
   * Table caption/title
   */
  caption?: string;
  /**
   * Description of the table for accessibility
   */
  description?: string;
  /**
   * CSS class name to apply to the table container
   */
  className?: string;
  /**
   * Available export formats
   * @default ['csv']
   */
  exportFormats?: Array<ExportFormat>;
  /**
   * Filename to use when exporting data
   * @default "table-export"
   */
  exportFilename?: string;
  /**
   * Loading state of the table
   * @default false
   */
  isLoading?: boolean;
  /**
   * Enable searching across all columns
   * @default false
   */
  enableGlobalSearch?: boolean;
  /**
   * Show/hide table toolbar
   * @default true
   */
  showToolbar?: boolean;
  /**
   * Text for loading state
   * @default "Loading data..."
   */
  loadingText?: string;
  /**
   * Text for empty state
   * @default "No data available"
   */
  emptyText?: string;
  /**
   * Enable row highlighting
   * @default false
   */
  enableRowHighlight?: boolean;
  /**
   * Function to determine if a row should be highlighted
   */
  highlightRow?: (row: T) => boolean;
  /**
   * Color scheme for row highlighting
   * @default "blue"
   */
  highlightColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  /**
   * Allow reordering of columns by drag and drop
   * @default false
   */
  enableColumnReorder?: boolean;
  /**
   * Static row to display at the top of the table (e.g., for totals)
   */
  pinnedRow?: T;
  /**
   * Event handler for refreshing data
   */
  onRefresh?: () => void;
  /**
   * Enable row grouping functionality
   * @default false
   */
  enableGrouping?: boolean;
  /**
   * Key to group rows by
   */
  groupBy?: string | string[];
  /**
   * Custom grouping function
   */
  groupingFn?: (data: T[]) => Record<string, T[]>;
  /**
   * Function to render the group header
   */
  renderGroupHeader?: (groupKey: string, groupData: T[]) => ReactNode;
  /**
   * Default collapsed state for groups
   * @default false
   */
  defaultGroupsCollapsed?: boolean;
  /**
   * Allow expanding/collapsing all groups at once
   * @default true
   */
  allowExpandCollapseAll?: boolean;
  /**
   * Override text for table actions and components
   */
  i18n?: TableTranslations;
  /**
   * Show a density selector in toolbar
   * @default false
   */
  showDensitySelector?: boolean;
  /**
   * Default variant for the table
   * @default "default"
   */
  variant?: TableVariant;
  /**
   * Bulk actions to be performed on selected rows
   */
  bulkActions?: BulkAction<T>[];
  /**
   * Enable advanced search and filtering panel
   * @default false
   */
  enableAdvancedSearch?: boolean;
  /**
   * Show row numbers
   * @default false
   */
  showRowNumbers?: boolean;
  /**
   * Enable infinite scrolling (disables pagination)
   * @default false
   */
  infiniteScroll?: boolean;
  /**
   * Function to load more data for infinite scrolling
   */
  onLoadMore?: () => void;
  /**
   * Whether there is more data to load
   * @default false
   */
  hasMore?: boolean;
  /**
   * Enable or disable table filtering based on URL parameters
   * @default false
   */
  urlFiltering?: boolean;
  /**
   * Allow users to save and load view configurations
   * @default false
   */
  enableViewManagement?: boolean;
  /**
   * Saved views for view management
   */
  savedViews?: SavedView[];
  /**
   * Function called when a view is saved
   */
  onSaveView?: (viewName: string, config: any) => void;
  /**
   * Function called when a view is loaded
   */
  onLoadView?: (viewId: string) => void;
  /**
   * Function called when a view is deleted
   */
  onDeleteView?: (viewId: string) => void;
}

// État interne du tableau
export interface KDTableState<T> {
  columns: ColumnDefinition<T>[];
  currentPage: number;
  itemsPerPage: number;
  filteredData: T[];
  displayData: T[];
  filters: Record<string, string>;
  globalFilter: string;
  sortConfig: SortConfig;
  showFilters: boolean;
  selectedRows: Record<string, boolean>;
  allSelected: boolean;
  currentGroupBy: string | string[] | null;
  groupedData: Record<string, T[]>;
  collapsedGroups: Record<string, boolean>;
  isAllExpanded: boolean;
  density: TableDensity;
  tableVariant: TableVariant;
  advancedFilters: AdvancedFilter[];
  activeViewId: string | null;
  exportSelection: ExportOption;
}

// Contexte du tableau
export interface KDTableContext<T> extends KDTableState<T> {
  // Fonctions pour modifier l'état
  handleFilter: (column: ColumnDefinition<T>, value: string) => void;
  handleGlobalSearch: (value: string) => void;
  handleSort: (key: string) => void;
  resetFilters: () => void;
  removeFilter: (key: string) => void;
  addAdvancedFilter: (filter: AdvancedFilter) => void;
  removeAdvancedFilter: (index: number) => void;
  clearAdvancedFilters: () => void;
  toggleRowSelection: (rowId: string) => void;
  toggleSelectAll: () => void;
  selectAllPages: () => void;
  clearAllSelections: () => void;
  changeGroupBy: (key: string | null) => void;
  toggleGroup: (groupKey: string) => void;
  toggleAllGroups: (collapse: boolean) => void;
  goToPage: (page: number) => void;
  exportData: (format: ExportFormat, exportOption: ExportOption) => boolean;
  handleDensityChange: (newDensity: TableDensity) => void;
  handleVariantChange: (newVariant: TableVariant) => void;
  toggleColumnVisibility: (columnKey: string) => void;
  resetColumnSettings: () => void;
  resetPreferences: () => void;
  saveCurrentView: () => void;
  loadView: (viewId: string) => void;
  deleteView: (viewId: string) => void;
  executeBulkAction: (action: BulkAction<T>) => void;
}