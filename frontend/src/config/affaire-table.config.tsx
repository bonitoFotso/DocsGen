import React from 'react';
import { format } from 'date-fns';
import { IAffaire } from '@/types/affaire';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Eye,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  PauseCircle,
  XCircle,
  FileText,
  Building,
  MapPin,
  User,
  DollarSign,
  Package,
  Notebook
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AffaireLine } from './affaires.line';

// Types des statuts pour un affichage cohérent
export const statusDisplayMap: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validée",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};
// Couleurs des statuts pour les badges
const statusColorMap: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-800",
  VALIDE: "bg-blue-100 text-blue-800",
  EN_COURS: "bg-green-100 text-green-800",
  EN_PAUSE: "bg-yellow-100 text-yellow-800",
  TERMINEE: "bg-purple-100 text-purple-800",
  ANNULEE: "bg-red-100 text-red-800",
};

// Icônes des statuts
export const statusIconMap: Record<string, React.ReactNode> = {
  BROUILLON: <Clock className="w-4 h-4 mr-1" />,
  VALIDE: <CheckCircle className="w-4 h-4 mr-1" />,
  EN_COURS: <Calendar className="w-4 h-4 mr-1" />,
  EN_PAUSE: <PauseCircle className="w-4 h-4 mr-1" />,
  TERMINEE: <CheckCircle className="w-4 h-4 mr-1" />,
  ANNULEE: <XCircle className="w-4 h-4 mr-1" />,
};


interface GetColumnsProps {
  navigate: (path: string) => void;
  handleViewDetails?: (id: number) => void;
  handleEdit?: (id: number, e: React.MouseEvent) => void;
}


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 2
  }).format(amount);
};

export const getAffaireColumns = ({ navigate, handleViewDetails, handleEdit }: GetColumnsProps) => [

  {
    key: 'localisation',
    label: 'Localisation',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-500" />
          <div>{row.clientPays}</div>
        </div>
        <div className="text-xs text-gray-500 pl-6">{row.clientRegion}, {row.clientVille}</div>
      </div>
    )
  },
  {
    key: 'reference',
    label: 'Référence',
    render: (_: unknown, row: IAffaire) => (
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-primary" />
        <div className="font-medium">{row.reference}</div>
      </div>
    )
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (_: unknown, row: IAffaire) => (
      <Badge className={cn(statusColorMap[row.statut] || "bg-gray-100 text-gray-800")}>
        {row.statut}
      </Badge>
    )
  },
  {
    key: 'dates',
    label: 'Dates',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-500" />
          <span>Début: {format(new Date(row.dateDebut), "dd/MM/yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-500" />
          <span>Fin prévue: {row.dateFinPrevue ? format(new Date(row.dateFinPrevue), "dd/MM/yyyy") : "-"}</span>
        </div>
        {row.dateFinReelle && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-gray-500" />
            <span>Fin réelle: {format(new Date(row.dateFinReelle), "dd/MM/yyyy")}</span>
          </div>
        )}
      </div>
    )
  },
  {
    key: 'client',
    label: 'Client',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Building size={14} className="text-gray-500" />
          <div className="font-medium">{row.clientNom}</div>
        </div>
        <div className="text-xs text-gray-500">{row.clientSecteur}</div>
      </div>
    )
  },
  
  {
    key: 'contact',
    label: 'Contact',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-500" />
          <div>{row.contactNom}</div>
        </div>
        <div className="text-xs text-gray-500 pl-6">{row.contactEmail}</div>
        <div className="text-xs text-gray-500 pl-6">{row.contactTelephone}</div>
      </div>
    )
  },
  {
    key: 'responsable',
    label: 'Responsable',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex items-center gap-2">
        <User size={14} className="text-primary" />
        <div>{row.responsable}</div>
      </div>
    )
  },
  {
    key: 'produit',
    label: 'Produit',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Package size={14} className="text-gray-500" />
          <div className="font-medium">{row.produitName}</div>
        </div>
        <div className="text-xs text-gray-500 pl-6">Code: {row.produitCode}</div>
        <div className="text-xs text-gray-500 pl-6">Catégorie: {row.produitCategory}</div>
        
      </div>
    )
  },
  {
    key: 'notes',
    label: 'Notes',
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex items-center gap-2">
        <Notebook size={14} className="text-gray-500" />
        <div className="flex flex-col">
          <div>{row.notes}</div>
          <div className="text-xs text-gray-500">{row.notes}</div>
        </div>
      </div>
    )
  },
  {
    key: 'montants',
    label: 'Montants',
    align: 'right' as const,
    render: (_: unknown, row: AffaireLine) => (
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-gray-500" />
          <div className="font-medium">{formatCurrency(parseInt(row.montant))}</div>
        </div>
        <div className="text-xs text-amber-600">
          À facturer: {formatCurrency(parseInt(row.montantRestantAFacturer))}
        </div>
        <div className="text-xs text-red-600">
          À payer: {formatCurrency(parseInt(row.montantRestantAPayer))}
        </div>
      </div>
    )
  },
  
  {
    key: 'actions',
    label: 'Actions',
    align: 'right' as const,
    sortable: false,
    render: (_: unknown, row: IAffaire) => (
      <div className="flex justify-end gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (handleViewDetails) {
                    handleViewDetails(row.id);
                  } else {
                    navigate(`/affaires/${row.id}`);
                  }
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

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  if (handleEdit) {
                    handleEdit(row.id, e);
                  } else {
                    navigate(`/affaires/${row.id}/edit`);
                  }
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
      </div>
    )
  }
];

// Options de groupement pour KDTable
export const affaireGroupByOptions = [
  { key: 'clientPays', label: 'Par pays' },
  { key: 'clientRegion', label: 'Par région' },
  { key: 'clientVille', label: 'Par ville' },
  { key: 'entityCode', label: 'Par Entity' },
  { key: 'produitName', label: 'Par Produit' },
  { key: 'produitCategory', label: 'Par Departement' },

  { key: 'statut', label: 'Par Statut' },
  { key: 'clientNom', label: 'Par Client' },
  { key: 'contactNom', label: 'Par Contact' },
  { key: 'produitCount', label: 'Par nombre de Produits' },
  { key: 'responsable', label: 'Par Responsable' },
  
];

// Configuration de filtre pour différents champs
export const affaireFilterFields = [
  {
    key: 'statut',
    label: 'Statut',
    type: 'select',
    options: Object.entries(statusDisplayMap).map(([value, label]) => ({
      value,
      label
    }))
  },
  {
    key: 'clientNom',
    label: 'Client',
    type: 'text',
    placeholder: 'Nom du client'
  },
  {
    key: 'montant_min',
    label: 'Montant min (€)',
    type: 'number',
    placeholder: 'Min'
  },
  {
    key: 'montant_max',
    label: 'Montant max (€)',
    type: 'number',
    placeholder: 'Max'
  },
  {
    key: 'date_range',
    label: 'Période de début',
    type: 'dateRange',
    placeholder: 'Sélectionner une période'
  }
];