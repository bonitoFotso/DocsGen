import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Eye,
  Edit,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Building,
  DollarSign,
  CalendarCheck,
  CalendarX,
  MapPin
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { LinearProforma } from './linearizeProformaData';

// Types des statuts pour un affichage cohérent
export const statusDisplayMap: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validée",
  EMISE: "Émise",
  ACCEPTEE: "Acceptée",
  REJETEE: "Rejetée",
  EXPIREE: "Expirée",
};

// Couleurs des statuts pour les badges
const statusColorMap: Record<string, string> = {
  BROUILLON: "bg-gray-100 text-gray-800",
  VALIDE: "bg-blue-100 text-blue-800",
  EMISE: "bg-green-100 text-green-800",
  ACCEPTEE: "bg-purple-100 text-purple-800",
  REJETEE: "bg-red-100 text-red-800",
  EXPIREE: "bg-amber-100 text-amber-800",
};

// Icônes des statuts
export const statusIconMap: Record<string, React.ReactNode> = {
  BROUILLON: <Clock className="w-4 h-4 mr-1" />,
  VALIDE: <CheckCircle className="w-4 h-4 mr-1" />,
  EMISE: <Calendar className="w-4 h-4 mr-1" />,
  ACCEPTEE: <CalendarCheck className="w-4 h-4 mr-1" />,
  REJETEE: <XCircle className="w-4 h-4 mr-1" />,
  EXPIREE: <CalendarX className="w-4 h-4 mr-1" />,
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

export const getProformaColumns = ({ navigate, handleViewDetails, handleEdit }: GetColumnsProps) => [
  {
    key: 'localisation',
    label: 'Localisation',
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-gray-500" />
          <div>{row.client_pays}</div>
        </div>
        <div className="text-xs text-gray-500 pl-6">{row.client_region}, {row.client_ville}</div>
      </div>
    )
  },
  {
    key: 'reference',
    label: 'Référence',
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-primary" />
        <div className="font-medium">{row.reference}</div>
      </div>
    )
  },
  {
    key: 'statut',
    label: 'Statut',
    render: (_: unknown, row: LinearProforma) => (
      <Badge className={cn(statusColorMap[row.statut] || "bg-gray-100 text-gray-800")}>
        {statusDisplayMap[row.statut] || row.statut}
      </Badge>
    )
  },
  {
    key: 'dates',
    label: 'Dates',
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-gray-500" />
          <span>Création: {row.date_creation}</span>
        </div>
        {row.date_validation && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarCheck size={14} className="text-green-500" />
            <span>Validation: {row.date_validation}</span>
          </div>
        )}
        {row.date_expiration && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarX size={14} className="text-amber-500" />
            <span>Expiration: {row.date_expiration}</span>
          </div>
        )}
      </div>
    )
  },
  {
    key: 'client',
    label: 'Client',
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Building size={14} className="text-gray-500" />
          <div className="font-medium">{row.client_nom}</div>
        </div>
        {/* Nous affichons uniquement le nom du client car secteur_activite n'est pas disponible dans l'interface IClient */}
      </div>
    )
  },
  {
    key: 'offre',
    label: 'Offre',
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex items-center gap-2">
        <FileText size={14} className="text-blue-500" />
        <div className="flex flex-col">
          <div className="font-medium">Ref: {row.offre_reference}</div>
          <div className="text-xs text-gray-500">Statut: {row.offre_statut}</div>
        </div>
      </div>
    )
  },
  {
    key: 'entity',
    label: 'Entité',
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex items-center gap-2">
        <Building size={14} className="text-gray-500" />
        <div className="flex flex-col">
          <div>{row.entity_code}</div>
              <div className="text-xs text-gray-500">{row.entity_name}</div>
        </div>
      </div>
    )
  },
  {
    key: 'montants',
    label: 'Montants',
    align: 'right' as const,
    render: (_: unknown, row: LinearProforma) => (
      <div className="flex flex-col gap-1 items-end">
        <div className="flex items-center gap-2">
          <DollarSign size={14} className="text-gray-500" />
          <div className="font-medium">HT: {formatCurrency(row.montant_ht)}</div>
        </div>
        <div className="text-xs text-gray-500">
          TVA ({row.taux_tva}%): {formatCurrency(row.montant_tva)}
        </div>
        <div className="text-xs font-medium text-blue-600">
          TTC: {formatCurrency(row.montant_ttc)}
        </div>
      </div>
    )
  },
  {
    key: 'actions',
    label: 'Actions',
    align: 'right' as const,
    sortable: false,
    render: (_: unknown, row: LinearProforma) => (
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
                    navigate(`/proformas/${row.id}`);
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
                    navigate(`/proformas/${row.id}/edit`);
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
export const proformaGroupByOptions = [
  { key: 'statut', label: 'Par Statut' },
  { key: 'client_nom', label: 'Par Client' },
  { key: 'entity_code', label: 'Par Entité' },
  { key: 'offre.statut', label: 'Par Statut Offre' },
];

// Configuration de filtre pour différents champs
export const proformaFilterFields = [
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
    key: 'client_nom',
    label: 'Client',
    type: 'text',
    placeholder: 'Nom du client'
  },
  {
    key: 'entity_code',
    label: 'Entité',
    type: 'text',
    placeholder: 'Code entité'
  },
  {
    key: 'montant_ttc_min',
    label: 'Montant min (XAF)',
    type: 'number',
    placeholder: 'Min'
  },
  {
    key: 'montant_ttc_max',
    label: 'Montant max (XAF)',
    type: 'number',
    placeholder: 'Max'
  },
  {
    key: 'date_creation_range',
    label: 'Période de création',
    type: 'dateRange',
    placeholder: 'Sélectionner une période'
  },
  {
    key: 'date_expiration_range',
    label: 'Période d\'expiration',
    type: 'dateRange',
    placeholder: 'Sélectionner une période'
  }
]; 