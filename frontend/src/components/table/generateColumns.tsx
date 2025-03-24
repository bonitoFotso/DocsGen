import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Edit, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ColumnDefinition } from '@/components/table/KDTable';

// Fonction d'aide pour formater les montants en devise
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

// Fonction d'aide pour formater les dates
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return dateString;
  }
};

/**
 * Génère automatiquement les colonnes pour KDTable en fonction d'un exemple d'objet
 * 
 * @template T - Type de données pour lequel générer les colonnes
 * @param sampleObject - Un objet exemple du type T pour extraire les clés (obligatoire)
 * @param config - Configuration pour la génération des colonnes
 * @returns Array<ColumnDefinition<T>> - Les colonnes générées
 */
export function autoGenerateColumns<T extends object>(
  sampleObject: T,
  config: {
    // Fonction pour voir les détails (sera attachée à un clic sur l'icône Eye)
    onView?: (id: number | string) => void;
    
    // Fonction pour éditer (sera attachée à un clic sur l'icône Edit)
    onEdit?: (id: number | string, e: React.MouseEvent) => void;
    
    // Fonction pour supprimer (sera attachée à un clic sur l'icône Trash)
    onDelete?: (id: number | string, e: React.MouseEvent) => void;
    
    // Actions personnalisées supplémentaires
    customActions?: Array<{
      icon: React.ReactNode;
      tooltip: string;
      onClick: (row: T, e: React.MouseEvent) => void;
    }>;
    
    // Colonnes à exclure du tableau
    excludeColumns?: string[];
    
    // Définitions personnalisées pour certaines colonnes
    columnOverrides?: Partial<Record<keyof T, Partial<ColumnDefinition<T>>>>;
    
    // Si vrai, inclut une colonne "Actions" avec les boutons d'action
    includeActionsColumn?: boolean;
    
    // Callback pour obtenir l'ID d'une ligne (par défaut, utilise row.id)
    getRowId?: (row: T) => number | string;
  } = {}
): ColumnDefinition<T>[] {
  const {
    onView,
    onEdit,
    onDelete,
    customActions = [],
    excludeColumns = [],
    columnOverrides = {},
    includeActionsColumn = true,
    getRowId = (row: T) => ('id' in row ? row.id : undefined)
  } = config;

  // Fonction pour déterminer le type de colonne en fonction du nom
  function guessColumnType(key: string): 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'progress' {
    const keyLower = key.toLowerCase();
    
    // Colonnes spécifiques pour les progressions
    if (keyLower.includes('progress') || keyLower.includes('progression')) {
      return 'progress';
    }
    
    // Colonnes de type date
    if (
      keyLower.includes('date') || 
      keyLower.includes('debut') || 
      keyLower.includes('fin') || 
      keyLower.includes('creation')
    ) {
      return 'date';
    }
    
    // Colonnes de type nombre
    if (
      keyLower.includes('montant') || 
      keyLower.includes('prix') || 
      keyLower.includes('cout') || 
      keyLower === 'id' || 
      keyLower.endsWith('id')
    ) {
      return 'number';
    }
    
    // Colonnes de type badge/statut
    if (
      keyLower.includes('statut') || 
      keyLower.includes('status') || 
      keyLower.includes('etat') || 
      keyLower.includes('priorite')
    ) {
      return 'badge';
    }
    
    // Colonnes de type booléen
    if (
      keyLower.startsWith('is_') || 
      keyLower.startsWith('has_') || 
      keyLower.includes('actif') || 
      keyLower.includes('active') || 
      keyLower.includes('valide') || 
      keyLower.includes('termine') || 
      keyLower.includes('retard')
    ) {
      return 'boolean';
    }
    
    // Par défaut, texte
    return 'text';
  }

  // Fonction pour générer le libellé à partir du nom de la colonne
  function generateLabel(key: string): string {
    // Traiter les cas spéciaux
    if (key === 'id') return 'ID';
    if (key.endsWith('_id')) return key.replace(/_id$/, ' ID');
    
    // Convertir snake_case ou camelCase en texte lisible
    return key
      .replace(/_/g, ' ')                // Remplacer les underscores par des espaces
      .replace(/([A-Z])/g, ' $1')        // Insérer des espaces avant les majuscules
      .replace(/^\w/, c => c.toUpperCase()) // Première lettre en majuscule
      .trim();
  }

  // Générer les colonnes en fonction des propriétés de l'objet exemple
  const columns: ColumnDefinition<T>[] = [];
  
  // Obtenir les clés de l'objet exemple
  const propertyNames = Object.keys(sampleObject);
  
  // Pour chaque propriété de l'objet, créer une colonne
  propertyNames.forEach((key) => {
    // Ignorer les colonnes exclues
    if (excludeColumns.includes(key)) {
      return;
    }
    
    // Déterminer le type de colonne
    const columnType = guessColumnType(key);
    
    // Créer la définition de base de la colonne
    const column: ColumnDefinition<T> = {
      key: key,
      label: generateLabel(key),
      type: columnType === 'progress' ? 'number' : columnType,
    };
    
    // Ajouter des renderers spécifiques selon le type de colonne
    switch (columnType) {
      case 'date':
        column.render = (row: T) => {
          const value = row[key as keyof T];
          return formatDate(value as string | undefined);
        };
        break;
      case 'number':
        if (key.includes('montant') || key.includes('prix') || key.includes('cout')) {
          column.render = (row: T) => {
            const value = row[key as keyof T];
            return typeof value === 'number' ? formatCurrency(value) : String(value);
          };
        }
        break;
        
      case 'badge':
        column.render = (row: T) => {
          const value = row[key as keyof T];
          return <Badge>{String(value)}</Badge>;
        };
        break;
      case 'boolean':
        column.render = (row: T) => {
          const value = row[key as keyof T];
          return value ? 'Oui' : 'Non';
        };
        break;
      case 'progress':
        column.render = (row: T) => {
          const value = row[key as keyof T] as number;
          const enRetard = (row['en_retard' as keyof T] as boolean) || false;
          const termine = value >= 100;
          
          return (
            <div className="flex items-center gap-2">
              <Progress 
                value={value} 
                className={cn(
                  "h-2 w-20",
                  termine ? "bg-green-200 dark:bg-green-950" : "",
                  enRetard ? "bg-red-200 dark:bg-red-950" : ""
                )}
              />
              <span className="text-xs">{value}%</span>
            </div>
          );
        };
        break;
    }
    
    // Appliquer les surcharges personnalisées si définies
    if (columnOverrides && typeof columnOverrides === 'object' && key in columnOverrides) {
      const override = columnOverrides[key as keyof typeof columnOverrides];
      if (override && typeof override === 'object') {
        Object.assign(column, override);
      }
    }
    
    columns.push(column);
  });
  
  // Ajouter une colonne d'actions si demandé
  if (includeActionsColumn && (onView || onEdit || onDelete || customActions.length > 0)) {
    columns.push({
      key: "actions",
      label: "Actions",
      sortable: false,
      filterable: false,
      className: "text-right",
      cellClassName: "text-right",
      render: (row: T) => (
        <div className="flex justify-end gap-2">
          {onView && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(String(getRowId(row)));
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Eye size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voir les détails</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(String(getRowId(row)), e);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <Edit size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Modifier</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {onDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(String(getRowId(row)), e);
                    }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Supprimer</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {customActions.map((action, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(row, e);
                    }}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    {action.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{action.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )
    });
  }
  
  return columns;
}