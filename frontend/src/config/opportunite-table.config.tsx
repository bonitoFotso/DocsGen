import { KDTableColumn, FilterConfig } from '@/components/ui/kdtable';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/utils/formatters';

// Interface pour les opportunités
export interface Opportunity {
  id: number;
  reference: string;
  client_nom: string;
  contact_nom: string;
  entity_name: string;
  produit_principal_name: string;
  statut: string;
  montant_estime: string;
  probabilite: number;
  valeur_ponderee: string;
  date_creation: string;
  date_modification: string;
  date_detection: string;
}

// Fonction de troncage de texte
const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '-';

  return text.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;
};

// Configuration des colonnes pour le tableau d'opportunités
export const opportunityColumns: KDTableColumn<Opportunity>[] = [
  {
    key: 'reference',
    label: 'Référence',
    sortable: true,
    filterable: true,
    width: '150px',
    render: (value) => truncateText(value as string, 20)
  },
  {
    key: 'client_nom',
    label: 'Client',
    sortable: true,
    filterable: true,
    width: '200px',
    render: (value) => truncateText(value as string, 30)
  },
  {
    key: 'contact_nom',
    label: 'Contact',
    sortable: true,
    filterable: true,
    width: '150px',
    render: (value) => truncateText(value as string, 25)
  },
  {
    key: 'entity_name',
    label: 'Entité',
    sortable: true,
    filterable: true,
    width: '150px',
    render: (value) => truncateText(value as string, 25)
  },
  {
    key: 'produit_principal_name',
    label: 'Produit Principal',
    sortable: true,
    filterable: true,
    width: '200px',
    render: (value) => truncateText(value as string, 30)
  },
  {
    key: 'statut',
    label: 'Statut',
    sortable: true,
    filterable: true,
    width: '120px',
    render: (value) => {
      const statusColors: Record<string, string> = {
        'QUALIFICATION': 'blue',
        'PROSPECT': 'gray',
        'EN_COURS': 'yellow',
        'GAGNE': 'green',
        'PERDU': 'red'
      };
      
      return (
        <Badge 
          variant="outline" 
          color={statusColors[value as string] || 'gray'}
        >
          {value}
        </Badge>
      );
    }
  },
  {
    key: 'montant_estime',
    label: 'Montant Estimé',
    sortable: true,
    filterable: true,
    align: 'right',
    render: (value) => formatCurrency(value),
    formatForExport: (value) => formatCurrency(value)
  },
  {
    key: 'probabilite',
    label: 'Probabilité (%)',
    sortable: true,
    filterable: true,
    align: 'right',
    render: (value) => `${value} %`
  },
  {
    key: 'valeur_ponderee',
    label: 'Valeur Pondérée',
    sortable: true,
    filterable: true,
    align: 'right',
    render: (value) => formatCurrency(value),
    formatForExport: (value) => formatCurrency(value)
  },
  {
    key: 'date_creation',
    label: 'Date Création',
    sortable: true,
    filterable: true,
    render: (value: unknown) => formatDate(value),
    formatForExport: (value) => formatDate(value)
  }
];

// Options de regroupement
export const opportunityGroupOptions = [
  { key: 'statut', label: 'Par Statut' },
  { key: 'entity_name', label: 'Par Entité' },
  { key: 'client_nom', label: 'Par Client' },
  { key: 'produit_principal_name', label: 'Par Produit' }
];

// Filtres initiaux (optionnel)
export const initialOpportunityFilters: FilterConfig[] = [
  {
    key: 'statut',
    operator: 'equals',
    value: 'QUALIFICATION'
  }
];

// Composant de tableau d'opportunités
export const OpportunitiesTable = ({ 
  opportunities, 
  onRowClick 
}: { 
  opportunities: Opportunity[], 
  onRowClick?: (opportunity: Opportunity) => void 
}) => {
  return (
    <KDTable
      data={opportunities}
      columns={opportunityColumns}
      groupByOptions={opportunityGroupOptions}
      initialFilters={initialOpportunityFilters}
      title="Liste des Opportunités"
      onRowClick={onRowClick}
      selectable
      showColumnVisibilityControl
      pagination={{
        pageSizes: [10, 25, 50, 100],
        defaultPageSize: 25
      }}
      exportFileName="opportunities"
    />
  );
};

export default OpportunitiesTable;
