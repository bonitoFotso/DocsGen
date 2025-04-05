import { 
  BarChart3, Users, TrendingUp, Wallet, 
  Building, Briefcase, 
  CheckSquare, Clock, Map 
} from 'lucide-react';
  import { StatData } from '@/components/stat/KDStats2';
import { AllKPIs } from '@/config/pro/extractKPIs';

/**
 * Fonction utilitaire pour formatter les nombres en notation compacte
 * @param value Le nombre à formatter
 * @param currency Symbole de la devise (optionnel)
 * @returns Chaîne formatée
 */
export const formatNumber = (value: number, currency?: string): string => {
  if (value === 0) return '0';
  
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M${currency ? ` ${currency}` : ''}`;
  } else if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k${currency ? ` ${currency}` : ''}`;
  } else {
    return `${value.toFixed(0)}${currency ? ` ${currency}` : ''}`;
  }
};

/**
 * Fonction pour calculer la tendance entre deux valeurs
 * @param current Valeur actuelle
 * @param previous Valeur précédente
 * @returns Pourcentage de changement
 */
export const calculateTrend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Fonctions pour transformer les données KPI en StatData pour les composants KTCardStat et KDStats
 */

// Transforme les KPI financiers en format StatData
export const financialKpiToStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs,
  currency: string = 'FCFA'
): StatData[] => {
  const currentFinancial = kpi.financial;
  const previousFinancial = previousPeriodKpi?.financial;
  
  return [
    {
      id: 'total-revenue',
      title: 'Montant total HT',
      value: currentFinancial.montantTotalHT,
      formattedValue: formatNumber(currentFinancial.montantTotalHT, currency),
      icon: <Wallet className="w-4 h-4" />,
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      trend: previousFinancial ? {
        value: calculateTrend(currentFinancial.montantTotalHT, previousFinancial.montantTotalHT),
        period: 'vs période précédente'
      } : undefined,
      footerText: `${kpi.dataMining.nombreTotal} proformas`
    },
    {
      id: 'avg-value',
      title: 'Montant moyen HT',
      value: currentFinancial.montantMoyenHT,
      formattedValue: formatNumber(currentFinancial.montantMoyenHT, currency),
      icon: <BarChart3 className="w-4 h-4" />,
      iconBgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      trend: previousFinancial ? {
        value: calculateTrend(currentFinancial.montantMoyenHT, previousFinancial.montantMoyenHT),
        period: 'vs période précédente'
      } : undefined
    }
  ];
};

// Transforme les KPI clients en format StatData
export const clientKpiToStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs
): StatData[] => {
  // Nombre de clients uniques
  const uniqueClientCount = Object.keys(kpi.client.nombreProformasParClient).length;
  const previousUniqueClientCount = previousPeriodKpi 
    ? Object.keys(previousPeriodKpi.client.nombreProformasParClient).length
    : 0;
  
  // Top client
  const topClient = kpi.client.topClients[0] || { nom: 'N/A', montant: 0 };
  
  return [
    {
      id: 'unique-clients',
      title: 'Clients uniques',
      value: uniqueClientCount,
      icon: <Users className="w-4 h-4" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: previousPeriodKpi ? {
        value: calculateTrend(uniqueClientCount, previousUniqueClientCount),
        period: 'vs période précédente'
      } : undefined
    },
    {
      id: 'top-client',
      title: 'Client principal',
      value: topClient.nom,
      icon: <Building className="w-4 h-4" />,
      iconBgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      footerText: `${formatNumber(topClient.montant, 'FCFA')}`
    }
  ];
};

// Transforme les KPI produits en format StatData
export const productKpiToStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs
): StatData[] => {
  // Produit principal (le plus fréquent)
  const topProduct = Object.entries(kpi.product.produitsPrincipaux)
    .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  
  // Catégorie principale
  const topCategory = Object.entries(kpi.product.repartitionParCategorie)
    .sort((a, b) => b[1].montant - a[1].montant)[0] || ['N/A', { count: 0, montant: 0 }];
  
  return [
    {
      id: 'top-product',
      title: 'Produit principal',
      value: topProduct[0],
      icon: <Briefcase className="w-4 h-4" />,
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      footerText: `${topProduct[1]} occurrence${topProduct[1] > 1 ? 's' : ''}`
    },
    {
      id: 'top-category',
      title: 'Catégorie principale',
      value: topCategory[0],
      icon: <TrendingUp className="w-4 h-4" />,
      iconBgColor: 'bg-pink-100',
      iconColor: 'text-pink-600',
      footerText: `${formatNumber(topCategory[1].montant, 'FCFA')}`
    }
  ];
};

// Transforme les KPI temporels en format StatData
export const temporalKpiToStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs
): StatData[] => {
  return [
    {
      id: 'conversion-rate',
      title: 'Taux de conversion',
      value: kpi.temporal.tauxConversion,
      formattedValue: `${kpi.temporal.tauxConversion.toFixed(1)}%`,
      icon: <CheckSquare className="w-4 h-4" />,
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      trend: previousPeriodKpi ? {
        value: calculateTrend(kpi.temporal.tauxConversion, previousPeriodKpi.temporal.tauxConversion),
        period: 'vs période précédente'
      } : undefined
    },
    {
      id: 'avg-delay',
      title: 'Délai moyen création',
      value: kpi.temporal.delaiMoyenCreationOffreProforma,
      formattedValue: `${Math.round(kpi.temporal.delaiMoyenCreationOffreProforma)} jours`,
      icon: <Clock className="w-4 h-4" />,
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      trend: previousPeriodKpi ? {
        value: -1 * calculateTrend(kpi.temporal.delaiMoyenCreationOffreProforma, previousPeriodKpi.temporal.delaiMoyenCreationOffreProforma), // Inversé car un délai plus court est meilleur
        period: 'vs période précédente'
      } : undefined
    }
  ];
};

// Transforme les KPI géographiques en format StatData
export const geoKpiToStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs
): StatData[] => {
  // Région principale
  const topRegion = Object.entries(kpi.geo.distributionParRegion)
    .sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  
  return [
    {
      id: 'top-region',
      title: 'Région principale',
      value: topRegion[0],
      icon: <Map className="w-4 h-4" />,
      iconBgColor: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      footerText: `${topRegion[1]} proforma${topRegion[1] > 1 ? 's' : ''}`
    }
  ];
};

// Fonction pour générer un tableau complet de KPI
export const generateKpiDashboardStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs
): StatData[] => {
  return [
    ...financialKpiToStats(kpi, previousPeriodKpi),
    ...clientKpiToStats(kpi, previousPeriodKpi),
    ...productKpiToStats(kpi, previousPeriodKpi),
    ...temporalKpiToStats(kpi, previousPeriodKpi)
  ];
};

// Fonction pour générer un tableau personnalisé de KPI selon les catégories demandées
export const generateCustomKpiStats = (
  kpi: AllKPIs,
  previousPeriodKpi?: AllKPIs,
  categories: ('financial' | 'client' | 'product' | 'temporal' | 'geo')[] = ['financial', 'client', 'product', 'temporal']
): StatData[] => {
  let stats: StatData[] = [];
  
  if (categories.includes('financial')) {
    stats = [...stats, ...financialKpiToStats(kpi, previousPeriodKpi)];
  }
  
  if (categories.includes('client')) {
    stats = [...stats, ...clientKpiToStats(kpi, previousPeriodKpi)];
  }
  
  if (categories.includes('product')) {
    stats = [...stats, ...productKpiToStats(kpi, previousPeriodKpi)];
  }
  
  if (categories.includes('temporal')) {
    stats = [...stats, ...temporalKpiToStats(kpi, previousPeriodKpi)];
  }
  
  if (categories.includes('geo')) {
    stats = [...stats, ...geoKpiToStats(kpi, previousPeriodKpi)];
  }
  
  return stats;
};