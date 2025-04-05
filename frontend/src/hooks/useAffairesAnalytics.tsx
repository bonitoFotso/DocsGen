import { useState, useMemo } from 'react';
import { useAffaires } from '@/hooks/affaire-hooks';
import { analyzeAffaires, convertToDashboardData, extractChartData } from '@/config/analyzeAffaires';
import { IAffaireFilters } from '@/services/AffaireService';
import { useEntityFromUrl } from './useEntityFromUrl';
import { IAffaire } from '@/types/affaire';

/**
 * Hook personnalisé qui fournit une analyse avancée des affaires
 * avec des fonctionnalités pour KDTable et KDStats
 */
export const useAffairesAnalytics = (initialFilters?: IAffaireFilters) => {
  // Utiliser le hook de base pour récupérer les affaires
  const {
    affaires,
    loading,
    error,
    filters,
    updateFilters,
    refresh,
  } = useAffaires(initialFilters);

  // État pour le filtre de recherche
  const [searchTerm, setSearchTerm] = useState('');

  const currentEntity = useEntityFromUrl();

  const filteredAffaires = currentEntity === "TOUTES"
    ? affaires
    : affaires.filter((affaire) => affaire.offre.entity.code === currentEntity);

  // Analyse avancée des affaires avec mémoïsation
  const analytics = useMemo(() => {
    return analyzeAffaires(filteredAffaires as unknown as IAffaire[]); // Double type assertion pour éviter l'erreur
  }, [filteredAffaires]);

  // Convertir en format tableau de bord pour KDStats
  const dashboardData = useMemo(() => {
    return convertToDashboardData(analytics);
  }, [analytics]);

  // Données pour graphiques et visualisations
  const chartData = useMemo(() => {
    return extractChartData(analytics);
  }, [analytics]);

  // Appliquer la recherche
  const handleSearch = () => {
    updateFilters({ ...filters, search: searchTerm, page: 1 });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    refresh();
    setSearchTerm('');
    // updateFilters({ page: 1, page_size: filters.page_size });
    updateFilters({ ...filters, search: searchTerm, page: 1 });
  };

  // Filtrer par statut
  const filterByStatus = (status: string | string[]) => {
    const statusArray = Array.isArray(status) ? status : [status];
    updateFilters({ ...filters, statut: statusArray, page: 1 });
  };

  // Filtrer par client
  const filterByClient = (client: string) => {
    updateFilters({ ...filters, client, page: 1 });
  };

  // Filtrer par entité
  const filterByEntity = (entityCode: string) => {
    updateFilters({ ...filters, entity_code: entityCode, page: 1 });
  };

  // Filtrer par plage de dates
  const filterByDateRange = (from?: Date, to?: Date) => {
    const newFilters = { ...filters };

    if (from) {
      newFilters.date_debut_min = from.toISOString().split('T')[0];
    } else {
      delete newFilters.date_debut_min;
    }

    if (to) {
      newFilters.date_debut_max = to.toISOString().split('T')[0];
    } else {
      delete newFilters.date_debut_max;
    }

    updateFilters({ ...newFilters, page: 1 });
  };

  // Exporter les statistiques au format CSV
  const exportStatistics = () => {
    try {
      // Construire les données CSV pour les statistiques
      const statsCsv = [
        // En-tête
        ['Type', 'Valeur'],
        ['Total affaires', analytics.totalCount],
        ['Montant total', analytics.global.montantTotal],
        ['Montant facturé', analytics.global.montantFacture],
        ['Montant payé', analytics.global.montantPaye],
        ['Taux de facturation', `${analytics.global.tauxFacturation.toFixed(2)}%`],
        ['Taux de paiement', `${analytics.global.tauxPaiement.toFixed(2)}%`],
        ['Affaires en retard', analytics.compteurs.affairesEnRetard],
        ['Pourcentage en retard', `${analytics.compteurs.pourcentageEnRetard.toFixed(2)}%`],
        ['Clients uniques', analytics.compteurs.clientsUniques],
        ['Entités uniques', analytics.compteurs.entitesUniques],
        ['Progression moyenne', `${analytics.global.progressionMoyenne.toFixed(2)}%`],
        // Ajouter une ligne vide
        [],
        // Statistiques par statut
        ['Statut', 'Nombre', 'Montant total', 'En retard'],
        ...Object.entries(analytics.statuts).map(([statut, data]) => [
          statut,
          data.count,
          data.montantTotal,
          data.enRetard
        ]),
        // Ajouter une ligne vide
        [],
        // Statistiques par client
        ['Client', 'Nombre', 'Montant total', 'En retard'],
        ...Object.entries(analytics.clients).map(([client, data]) => [
          client,
          data.count,
          data.montantTotal,
          data.enRetard
        ])
      ];

      // Convertir en CSV
      const csvContent = statsCsv.map(row => row.join(',')).join('\n');

      // Créer un blob et déclencher le téléchargement
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'statistiques_affaires.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'export des statistiques:', error);
      return false;
    }
  };

  return {
    // Données de base
    affaires: filteredAffaires,
    totalCount: filteredAffaires.length,
    loading,
    error,
    filters,
    updateFilters,

    // Données d'analyse
    analytics,
    dashboardData,
    chartData,

    // État de recherche
    searchTerm,
    setSearchTerm,

    // Fonctions utilitaires
    handleSearch,
    resetFilters,
    filterByStatus,
    filterByClient,
    filterByEntity,
    filterByDateRange,
    exportStatistics
  };
};