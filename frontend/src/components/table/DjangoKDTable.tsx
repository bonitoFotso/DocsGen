import { useState, useEffect, ReactNode, useMemo } from 'react';
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
import { ArrowDown, ArrowUp, Search, X } from "lucide-react";
import { format } from 'date-fns';
import { cn } from "@/lib/utils";

// Définition des types
export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

// Type de champ Django
export type FieldType = 
  | 'CharField' 
  | 'TextField' 
  | 'IntegerField' 
  | 'BooleanField' 
  | 'DateField' 
  | 'DateTimeField' 
  | 'DecimalField'
  | 'EmailField'
  | 'ForeignKey'
  | 'ManyToManyField'
  | 'OneToOneField'
  | 'FileField';

// Définition d'un champ Django
export interface DjangoField {
  name: string;
  verbose_name?: string;
  type: FieldType;
  related_model?: string;
  choices?: [string, string][];
  blank?: boolean;
  null?: boolean;
  display_fn?: (value: unknown) => ReactNode;
}

// Définition d'un modèle Django
export interface DjangoModel {
  name: string;
  verbose_name?: string;
  fields: DjangoField[];
  str_method?: (item: unknown) => string;
}

export interface ColumnDefinition<T> {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'boolean' | 'badge' | 'foreign' | 'file' | 'email' | 'currency';
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  cellClassName?: string;
  defaultValue?: string | number | boolean;
  render?: (row: T) => ReactNode;
  sortFn?: (a: T, b: T) => number;
  filterFn?: (row: T, filterValue: string) => boolean;
}

export interface DjangoKDTableProps<T> {
  data: T[];
  model: DjangoModel;
  excludeFields?: string[];
  includeFields?: string[];
  extraColumns?: ColumnDefinition<T>[];
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  keyField?: string;
  enableFiltering?: boolean;
  enableSorting?: boolean;
  formatters?: Record<string, (value: unknown) => ReactNode>;
  actionsColumn?: (row: T) => ReactNode;
}
// Fonction pour formater les valeurs selon leur type
const formatValue = (value: unknown, type: string): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  switch (type) {
    case 'date':
      try {
        return format(value instanceof Date ? value : new Date(String(value)), 'dd/MM/yyyy');
      } catch (e) {
        return String(value);
      }
    case 'datetime':
      try {
        return format(value instanceof Date ? value : new Date(String(value)), 'dd/MM/yyyy HH:mm');
      } catch (e) {
        return String(value);
      }
    case 'boolean':
      return value ? 'Oui' : 'Non';
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
      }).format(value as number);
    default:
      return String(value);
  }

// Fonction pour convertir un type de champ Django en type de colonne
const mapDjangoFieldToColumnType = (fieldType: FieldType): string => {
  const typeMap: Record<FieldType, string> = {
    'CharField': 'text',
    'TextField': 'text',
    'IntegerField': 'number',
    'BooleanField': 'boolean',
    'DateField': 'date',
    'DateTimeField': 'datetime',
    'DecimalField': 'currency',
    'EmailField': 'email',
    'ForeignKey': 'foreign',
    'ManyToManyField': 'foreign',
    'OneToOneField': 'foreign',
    'FileField': 'file'
  };

  return typeMap[fieldType] || 'text';
};

/**
 * DjangoKDTable - Composant de tableau avec tri et filtrage dynamique pour les modèles Django
 */
function DjangoKDTable<T extends Record<string, any>>({
  data = [],
  model,
  excludeFields = [],
  includeFields = [],
  extraColumns = [],
  onRowClick,
  rowClassName,
  keyField = "id",
  enableFiltering = true,
  enableSorting = true,
  formatters = {},
  actionsColumn
}: DjangoKDTableProps<T>) {
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: null,
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Générer les colonnes à partir des champs du modèle
  const columns = useMemo(() => {
    let modelColumns: ColumnDefinition<T>[] = [];

    // Filtrer les champs selon includeFields et excludeFields
    const fieldsToUse = model.fields.filter(field => {
      if (includeFields.length > 0) {
        return includeFields.includes(field.name);
      }
      return !excludeFields.includes(field.name);
    });

    // Convertir les champs Django en définitions de colonnes
    modelColumns = fieldsToUse.map(field => {
      const columnType = mapDjangoFieldToColumnType(field.type);
      
      return {
        key: field.name,
        label: field.verbose_name || field.name,
        type: columnType as any,
        render: (row: T) => {
          // Utiliser un formatter personnalisé si fourni
          if (formatters[field.name]) {
            return formatters[field.name](getNestedValue(row, field.name));
          }
          
          // Utiliser la fonction d'affichage personnalisée du champ si disponible
          if (field.display_fn) {
            return field.display_fn(getNestedValue(row, field.name));
          }
          
          const value = getNestedValue(row, field.name);
          
          // Gérer les choix (enum)
          if (field.choices && value) {
            const choice = field.choices.find(c => c[0] === value);
            return choice ? (
              <Badge variant="outline">{choice[1]}</Badge>
            ) : formatValue(value, columnType);
          }
          
          // Gérer les relations (ForeignKey, etc.)
          if (field.type === 'ForeignKey' || field.type === 'OneToOneField') {
            if (value && typeof value === 'object') {
              // Si l'objet entier est disponible
              return value.__str__ || value.name || value.toString();
            } else if (value) {
              // Si on n'a que l'ID
              return `${field.related_model || ''} #${value}`;
            }
            return '-';
          }
          
          // Gérer les fichiers
          if (field.type === 'FileField' && value) {
            return (
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
              >
                Voir le fichier
              </a>
            );
          }
          
          // Gérer les emails
          if (field.type === 'EmailField' && value) {
            return (
              <a 
                href={`mailto:${value}`} 
                className="text-blue-600 hover:underline"
              >
                {value}
              </a>
            );
          }
          
          // Formater selon le type
          return formatValue(value, columnType);
        }
      };
    });

    // Ajouter les colonnes supplémentaires
    if (extraColumns.length > 0) {
      modelColumns = [...modelColumns, ...extraColumns];
    }

    // Ajouter la colonne d'actions si fournie
    if (actionsColumn) {
      modelColumns.push({
        key: 'actions',
        label: 'Actions',
        sortable: false,
        filterable: false,
        className: 'text-right',
        cellClassName: 'text-right',
        render: actionsColumn
      });
    }

    return modelColumns;
  }, [model, excludeFields, includeFields, extraColumns, formatters, actionsColumn]);

  // Mettre à jour les données filtrées lorsque les données d'entrée changent
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Fonction pour obtenir la valeur depuis un chemin en notation dot
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((prev, curr) => {
      return prev && prev[curr] !== undefined ? prev[curr] : null;
    }, obj);
  };

  // Fonction pour gérer le filtrage
  const handleFilter = (column: ColumnDefinition<T>, value: string) => {
    const newFilters = { ...filters, [column.key]: value };
    if (value === "") {
      delete newFilters[column.key];
    }
    setFilters(newFilters);

    // Appliquer les filtres
    let result = [...data];
    
    Object.keys(newFilters).forEach((filterKey) => {
      const filterValue = newFilters[filterKey].toLowerCase();
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
        
        if (typeof itemValue === 'object') {
          // Pour les objets liés (ForeignKey, etc.)
          const stringValue = itemValue.toString();
          return stringValue.toLowerCase().includes(filterValue);
        }
        
        return itemValue.toString().toLowerCase().includes(filterValue);
      });
    });

    // Appliquer le tri actuel aux données filtrées
    if (sortConfig.key) {
      result = sortData(result, sortConfig.key, sortConfig.direction);
    }

    setFilteredData(result);
  };

  // Fonction pour gérer le tri
  const handleSort = (key: string) => {
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

    if (!direction) {
      // Si le tri est réinitialisé, retourner aux données filtrées sans tri
      let result = [...data];
      
      // Réappliquer les filtres
      Object.keys(filters).forEach((filterKey) => {
        const filterValue = filters[filterKey].toLowerCase();
        const col = columns.find(c => c.key === filterKey);
        
        if (!col) return;
        
        result = result.filter(item => {
          const itemValue = getNestedValue(item, filterKey);
          
          if (col.filterFn) {
            return col.filterFn(item, filterValue);
          }
          
          if (itemValue === null || itemValue === undefined) return false;
          return itemValue.toString().toLowerCase().includes(filterValue);
        });
      });
      
      setFilteredData(result);
    } else {
      // Trier les données filtrées
      setFilteredData(sortData([...filteredData], key, direction));
    }
  };

  // Fonction pour trier les données
  const sortData = (dataToSort: T[], key: string, direction: SortDirection): T[] => {
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
      
      let aValue: any = getNestedValue(a, key);
      let bValue: any = getNestedValue(b, key);
      
      // Gérer les valeurs nulles ou undefined
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';
      
      // Gérer les objets (comme les ForeignKey)
      if (typeof aValue === 'object' && aValue !== null) {
        aValue = aValue.toString();
      }
      if (typeof bValue === 'object' && bValue !== null) {
        bValue = bValue.toString();
      }
      
      // Convertir en minuscules pour les chaînes
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();
      
      // Tri par date
      if (column.type === 'date' || column.type === 'datetime') {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      
      // Tri numérique
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Tri alphabétique par défaut
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Fonction pour réinitialiser tous les filtres
  const resetFilters = () => {
    setFilters({});
    setFilteredData(sortConfig.key ? sortData([...data], sortConfig.key, sortConfig.direction) : data);
  };

  return (
    <div className="space-y-2">
      {enableFiltering && (
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Search size={16} />
            {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
          </Button>
          
          {Object.keys(filters).length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="flex items-center gap-2 text-gray-500"
            >
              <X size={16} />
              Réinitialiser les filtres
            </Button>
          )}
        </div>
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  className={cn(
                    column.className,
                    enableSorting && column.sortable !== false ? "cursor-pointer" : "",
                  )}
                  onClick={() => {
                    if (enableSorting && column.sortable !== false) {
                      handleSort(column.key);
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>{column.label}</span>
                    {enableSorting && column.sortable !== false && (
                      <div className="flex flex-col">
                        <ArrowUp 
                          size={12} 
                          className={cn(
                            "text-gray-400",
                            sortConfig.key === column.key && sortConfig.direction === 'asc' 
                              ? "text-primary" 
                              : "text-gray-400"
                          )} 
                        />
                        <ArrowDown 
                          size={12} 
                          className={cn(
                            "text-gray-400 -mt-1",
                            sortConfig.key === column.key && sortConfig.direction === 'desc' 
                              ? "text-primary" 
                              : "text-gray-400"
                          )} 
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
            
            {enableFiltering && showFilters && (
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={`filter-${column.key}`}>
                    {column.filterable !== false ? (
                      <Input
                        placeholder={`Filtrer ${column.label.toLowerCase()}`}
                        value={filters[column.key] || ''}
                        onChange={(e) => handleFilter(column, e.target.value)}
                        className="max-w-full text-xs"
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
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center text-gray-500"
                >
                  Aucune donnée disponible
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <TableRow
                  key={row[keyField] as string | number}
                  className={cn(
                    "transition-colors",
                    onRowClick ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50" : "",
                    rowClassName ? rowClassName(row) : ""
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={`${row[keyField]}-${column.key}`}
                      className={column.cellClassName}
                    >
                      {column.render ? column.render(row) : getNestedValue(row, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-sm text-gray-500 mt-2">
        Affichage de {filteredData.length} sur {data.length} éléments
      </div>
    </div>
  );
}

export default DjangoKDTable;