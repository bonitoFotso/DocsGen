import React from 'react';
import { StatsConfig } from '@/components/KDcart/types';
import { 
  CreditCard, 
  Activity, 
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Percent,
  AlertCircle,
  FileText,
  Calendar,
  CircleDashed
} from 'lucide-react';
import { IDashboardData } from '@/services/AffaireService';

// Mapping des statuts pour l'affichage
export const statusDisplayMap = {
  "BROUILLON": "Brouillon",
  "EN_COURS": "En cours",
  "VALIDE": "Validé",
  "REFUSE": "Refusé",
  "EXPIRE": "Expiré",
  "ANNULE": "Annulé"
};

// Récupérer une couleur d'icône basée sur le statut
const getStatusIconColor = (statut: string): string => {
  switch (statut) {
    case 'BROUILLON': return 'text-gray-500';
    case 'EN_COURS': return 'text-blue-500';
    case 'VALIDE': return 'text-green-500';
    case 'REFUSE': return 'text-red-500';
    case 'EXPIRE': return 'text-amber-500';
    case 'ANNULE': return 'text-purple-500';
    default: return 'text-gray-500';
  }
};

// Récupérer une icône basée sur le statut
const getStatusIcon = (statut: string): React.ReactNode => {
  const color = getStatusIconColor(statut);
  
  switch (statut) {
    case 'BROUILLON':
      return <CircleDashed className={`h-4 w-4 ${color}`} />;
    case 'EN_COURS':
      return <Clock className={`h-4 w-4 ${color}`} />;
    case 'VALIDE':
      return <CheckCircle className={`h-4 w-4 ${color}`} />;
    case 'REFUSE':
      return <XCircle className={`h-4 w-4 ${color}`} />;
    case 'EXPIRE':
      return <Calendar className={`h-4 w-4 ${color}`} />;
    case 'ANNULE':
      return <XCircle className={`h-4 w-4 ${color}`} />;
    default:
      return <FileText className={`h-4 w-4 ${color}`} />;
  }
};

/**
 * Génère la configuration des statistiques pour les proformas
 * @param dashboardData Les données du tableau de bord
 * @returns La configuration des statistiques
 */
export const getProformaStatsConfig = (dashboardData: IDashboardData | null): StatsConfig => {
  if (!dashboardData) {
    return baseProformaStatsConfig;
  }

  // Calcule le nombre total de proformas en additionnant les compteurs par statut
  const totalProformas = dashboardData.compteurs_statut?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  
  // Calcule le nombre de proformas à expiration à partir de la liste fournie
  const proformasExpirant = dashboardData.proformas_expirant?.length || 0;

  return {
    cards: [
      // Nombre total de proformas
      {
        id: "total-proformas",
        title: "Total Proformas",
        type: "count" as const,
        calculation: () => totalProformas,
        icon: <FileText className="h-4 w-4 text-blue-500" />,
        tooltipText: "Nombre total de proformas",
        colorClass: "bg-white text-black",
      },
      
      // Statuts en compteurs
      ...(dashboardData.compteurs_statut || []).map((item) => ({
        id: `status-${item.statut}`,
        title: statusDisplayMap[item.statut] || item.statut,
        type: "count" as const,
        calculation: () => item.count,
        icon: getStatusIcon(item.statut),
        tooltipText: `Nombre de proformas en statut ${statusDisplayMap[item.statut] || item.statut}`,
        colorClass: "bg-white text-black",
      })),
      
      // Montant total
      {
        id: "total-amount",
        title: "Montant Total",
        type: "amount" as const,
        calculation: () => dashboardData.resume_financier.montant_total,
        icon: <CreditCard className="h-4 w-4 text-purple-500" />,
        prefix: "XAF ",
        tooltipText: "Montant total de toutes les proformas",
        colorClass: "bg-white text-black",
      },
      
      // Proformas expirant bientôt
      {
        id: "expiring-proformas",
        title: "Expiration proche",
        type: "count" as const,
        calculation: () => proformasExpirant,
        icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
        tooltipText: "Nombre de proformas proches de l'expiration",
        colorClass: "bg-white text-black",
        trend: proformasExpirant > 0 ? {
          type: "up",
          value: proformasExpirant,
          period: "total",
        } : undefined,
      },
      
      // Si le montant validé existe et est non nul
      ...(dashboardData.resume_financier.montant_valide > 0 ? [
        // Montant validé
        {
          id: "validated-amount",
          title: "Montant Validé",
          type: "amount" as const,
          calculation: () => dashboardData.resume_financier.montant_valide,
          icon: <DollarSign className="h-4 w-4 text-green-500" />,
          prefix: "XAF ",
          tooltipText: "Montant total des proformas validées",
          colorClass: "bg-white text-black",
        },
        
        // Taux de validation
        {
          id: "validation-rate",
          title: "Taux de validation",
          type: "percentage" as const,
          calculation: () => {
            const { montant_total, montant_valide } = dashboardData.resume_financier;
            return montant_total > 0 
              ? Math.round((montant_valide / montant_total) * 100) 
              : 0;
          },
          icon: <Percent className="h-4 w-4 text-green-500" />,
          suffix: "%",
          tooltipText: "Pourcentage du montant total qui a été validé",
          colorClass: "bg-white text-black",
        }
      ] : []),
      
      // Taux de conversion (si disponible)
      ...(dashboardData.taux_conversion !== undefined ? [
        {
          id: "conversion-rate",
          title: "Taux de conversion",
          type: "percentage" as const,
          calculation: () => dashboardData.taux_conversion || 0,
          icon: <Activity className="h-4 w-4 text-blue-500" />,
          suffix: "%",
          tooltipText: "Pourcentage de proformas converties en commandes",
          colorClass: "bg-white text-black",
          trend: dashboardData.evolution_conversion ? {
            type: dashboardData.evolution_conversion > 0 ? "up" : "down",
            value: Math.abs(dashboardData.evolution_conversion),
            period: "vs précédent"
          } : undefined
        }
      ] : [])
    ],
  };
};

/**
 * Configuration de base pour les statistiques de proformas (sans données)
 */
export const baseProformaStatsConfig: StatsConfig = {
  cards: [
    {
      id: "total-count",
      title: "Total Proformas",
      type: "count" as const,
      calculation: () => 0,
      icon: <FileText className="h-4 w-4 text-blue-500" />,
      tooltipText: "Nombre total de proformas",
      colorClass: "bg-white text-black",
    },
    {
      id: "total-amount",
      title: "Montant Total",
      type: "amount" as const,
      calculation: () => 0,
      icon: <CreditCard className="h-4 w-4 text-purple-500" />,
      prefix: "XAF ",
      tooltipText: "Montant total de toutes les proformas",
      colorClass: "bg-white text-black",
    }
  ]
};