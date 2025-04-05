import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

/**
 * Hook générique pour récupérer et gérer les données d'un tableau de bord
 * @param {Object} options - Options de configuration
 * @param {Function} options.fetchData - Fonction pour récupérer les données principales
 * @param {Function} options.fetchAnalytics - Fonction pour récupérer les données d'analyse
 * @param {Function} options.exportData - Fonction pour exporter les données
 * @param {Object} options.initialFilters - Filtres initiaux
 * @param {Function} options.processData - Fonction de traitement des données (facultatif)
 * @param {Function} options.generateChartData - Fonction pour générer les données des graphiques
 * @returns {Object} Données et fonctions pour le tableau de bord
 */
export const useDashboardData = ({
  fetchData,
  fetchAnalytics,
  exportData,
  initialFilters = { page: 1, page_size: 10 },
  processData = (data: unknown) => data,
  generateChartData,
}: { fetchData: Function; fetchAnalytics: Function; exportData: Function; initialFilters: object; processData: Function; generateChartData: Function; }): object => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [analytics, setAnalytics] = useState({});
  const [dashboardData, setDashboardData] = useState({});
  const [chartData, setChartData] = useState({});

  // Fonction pour charger les données
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Récupérer les données principales
      const response = await fetchData(filters);
      const processedData = processData(response.data || []);
      setData(processedData);
      setTotalCount(response.totalCount || processedData.length);

      // Récupérer les données d'analyse
      const analyticsData = await fetchAnalytics(filters);
      setAnalytics(analyticsData);

      // Générer les données pour les statistiques et graphiques
      if (generateChartData) {
        const chartDataResult = generateChartData(processedData, analyticsData);
        setChartData(chartDataResult.chartData || {});
        setDashboardData(chartDataResult.dashboardData || {});
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue lors du chargement des données");
      toast("Erreur",{
        description: "Impossible de charger les données",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchData, fetchAnalytics, filters, processData, generateChartData]);

  // Charger les données au démarrage et lors des changements de filtres
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fonction pour la recherche
  const handleSearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1, // Retour à la première page lors d'une recherche
    }));
  }, [searchTerm]);

  // Fonction pour filtrer par statut
  const filterByStatus = useCallback((status: string) => {
    setFilters(prev => ({
      ...prev,
      statut: status ? [status] : undefined,
      page: 1,
    }));
  }, []);

  // Fonction pour filtrer par client
  const filterByClient = useCallback((client: string) => {
    setFilters(prev => ({
      ...prev,
      client: client || undefined,
      page: 1,
    }));
  }, []);

  // Fonction pour filtrer par date
  const filterByDateRange = useCallback((dateFrom: Date | undefined, dateTo: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      date_debut: dateFrom ? dateFrom.toISOString().split('T')[0] : undefined,
      date_fin: dateTo ? dateTo.toISOString().split('T')[0] : undefined,
      page: 1,
    }));
  }, []);

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchTerm("");
  }, [initialFilters]);

  // Fonction pour exporter les statistiques
  const handleExport = useCallback(async () => {
    try {
      setLoading(true);
      await exportData(filters);
      toast("Export réussi",{
        description: "Les données ont été exportées avec succès",
      });
    } catch (err) {
      toast("Erreur d'export",{
        description: err.message || "Une erreur est survenue lors de l'export",
      });
    } finally {
      setLoading(false);
    }
  }, [exportData, filters]);

  // Retourner toutes les données et fonctions nécessaires
  return {
    data,
    totalCount,
    loading,
    error,
    filters,
    analytics,
    dashboardData,
    chartData,
    searchTerm,
    setSearchTerm,
    handleSearch,
    resetFilters,
    filterByStatus,
    filterByClient,
    filterByDateRange,
    exportStatistics: handleExport,
    refresh: loadData,
  };
};

export default useDashboardData;