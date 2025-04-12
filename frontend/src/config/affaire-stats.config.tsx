import React from 'react';
import { StatsConfig } from '@/components/KDcart/types';
import { IDashboardData } from '@/types/affaire';
import { 
  CreditCard, 
  Activity, 
  Users, 
  CheckCircle,
  Clock,
  PauseCircle,
  XCircle,
  DollarSign,
  Percent,
  AlertCircle
} from 'lucide-react';
import { statusDisplayMap } from './affaire-table.config';

// Récupérer une couleur d'icône basée sur le statut
const getStatusIconColor = (statut: string): string => {
  switch (statut) {
    case 'EN_COURS': return 'text-green-500';
    case 'VALIDE': return 'text-blue-500';
    case 'EN_PAUSE': return 'text-yellow-500';
    case 'TERMINEE': return 'text-purple-500';
    case 'ANNULEE': return 'text-red-500';
    default: return 'text-gray-500';
  }
};

// Récupérer une icône basée sur le statut
const getStatusIcon = (statut: string): React.ReactNode => {
  const color = getStatusIconColor(statut);
  
  switch (statut) {
    case 'BROUILLON':
      return <Clock className={`h-4 w-4 ${color}`} />;
    case 'VALIDE':
      return <CheckCircle className={`h-4 w-4 ${color}`} />;
    case 'EN_COURS':
      return <Activity className={`h-4 w-4 ${color}`} />;
    case 'EN_PAUSE':
      return <PauseCircle className={`h-4 w-4 ${color}`} />;
    case 'TERMINEE':
      return <CheckCircle className={`h-4 w-4 ${color}`} />;
    case 'ANNULEE':
      return <XCircle className={`h-4 w-4 ${color}`} />;
    default:
      return <Users className={`h-4 w-4 ${color}`} />;
  }
};


/**
 * Génère la configuration des statistiques pour les affaires
 * @param dashboardData Les données du tableau de bord
 * @returns La configuration des statistiques
 */
export const getAffaireStatsConfig = (dashboardData: IDashboardData | null): StatsConfig => {
  if (!dashboardData) {
    return baseAffaireStatsConfig;
  }

  // Calcule le nombre total d'affaires en additionnant les compteurs par statut
  const totalAffaires = dashboardData.compteurs_statut.reduce((acc, curr) => acc + curr.count, 0);
  
  // Calcule le nombre d'affaires en retard à partir de la liste fournie
  const affairesEnRetard = dashboardData.affaires_en_retard?.length || 0;

  return {
    cards: [
      // Nombre total d'affaires
      {
        id: "total-affaires",
        title: "Total Affaires",
        type: "count" as const,
        calculation: () => totalAffaires,
        icon: <Users className="h-4 w-4 text-blue-500" />,
        tooltipText: "Nombre total d'affaires",
        colorClass: "bg-white text-black",
      },
      
      // Statuts en compteurs
      ...(dashboardData.compteurs_statut || []).map((item) => ({
        id: `status-${item.statut}`,
        title: statusDisplayMap[item.statut] || item.statut,
        type: "count" as const,
        calculation: () => item.count,
        icon: getStatusIcon(item.statut),
        tooltipText: `Nombre d'affaires en statut ${statusDisplayMap[item.statut] || item.statut}`,
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
        tooltipText: "Montant total de toutes les affaires",
        colorClass: "bg-white text-black",
      },
      
      // Affaires en retard
      {
        id: "late-affaires",
        title: "En retard",
        type: "count" as const,
        calculation: () => affairesEnRetard,
        icon: <AlertCircle className="h-4 w-4 text-red-500" />,
        tooltipText: "Nombre d'affaires en retard",
        colorClass: "bg-white text-black",
        trend: affairesEnRetard > 0 ? {
          type: "up",
          value: affairesEnRetard,
          period: "total",
        } : undefined,
      },
      
      // Si le montant facturé existe et est non nul
      ...(dashboardData.resume_financier.montant_facture > 0 ? [
        // Montant facturé
        {
          id: "invoiced-amount",
          title: "Montant Facturé",
          type: "amount" as const,
          calculation: () => dashboardData.resume_financier.montant_facture,
          icon: <DollarSign className="h-4 w-4 text-blue-500" />,
          prefix: "€ ",
          tooltipText: "Montant total facturé",
          colorClass: "bg-white text-black",
        },
        
        // Taux de facturation
        {
          id: "invoice-rate",
          title: "Taux de facturation",
          type: "percentage" as const,
          calculation: () => {
            const { montant_total, montant_facture } = dashboardData.resume_financier;
            return montant_total > 0 
              ? Math.round((montant_facture / montant_total) * 100) 
              : 0;
          },
          icon: <Percent className="h-4 w-4 text-green-500" />,
          suffix: "%",
          tooltipText: "Pourcentage du montant total qui a été facturé",
          colorClass: "bg-white text-black",
        }
      ] : [])
    ],
  };
};

/**
 * Configuration de base pour les statistiques d'affaires (sans données)
 */
export const baseAffaireStatsConfig: StatsConfig = {
  cards: [
    {
      id: "total-count",
      title: "Total Affaires",
      type: "count" as const,
      calculation: () => 0,
      icon: <Users className="h-4 w-4 text-blue-500" />,
      tooltipText: "Nombre total d'affaires",
      colorClass: "bg-white text-black",
    },
    {
      id: "total-amount",
      title: "Montant Total",
      type: "amount" as const,
      calculation: () => 0,
      icon: <CreditCard className="h-4 w-4 text-purple-500" />,
      prefix: "€ ",
      tooltipText: "Montant total de toutes les affaires",
      colorClass: "bg-white text-black",
    }
  ]
};