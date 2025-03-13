import { useState, useEffect, useCallback } from 'react';
import { affaireService, IAffaire, IAffaireDetail, IAffaireCreate, IStatutChange, IAffaireFilters, IDashboardData, IAffaireInitData } from '@/services/AffaireService';
import { AxiosError } from 'axios';

// Hook pour récupérer la liste des affaires
export const useAffaires = (initialFilters: IAffaireFilters = {}) => {
  const [affaires, setAffaires] = useState<IAffaire[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IAffaireFilters>(initialFilters);

  const fetchAffaires = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await affaireService.getAffaires(filters);
      setAffaires(response.data);
      setTotalCount(response.data.length);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Une erreur est survenue lors de la récupération des affaires');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAffaires();
  }, [fetchAffaires]);
  const updateFilters = useCallback((newFilters: IAffaireFilters) => {
    setFilters((prevFilters: IAffaireFilters) => ({
      ...prevFilters,
      ...newFilters,
      // Remettre à la première page si les filtres changent (sauf si la page est explicitement fournie)
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  const refresh = useCallback(() => {
    fetchAffaires();
  }, [fetchAffaires]);

  return {
    affaires,
    totalCount,
    loading,
    error,
    filters,
    updateFilters,
    refresh
  };
};

// Hook pour récupérer une affaire spécifique
export const useAffaire = (id: number | null) => {
  const [affaire, setAffaire] = useState<IAffaireDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [initData, setInitData] = useState<IAffaireInitData | null>(null);

  const getInitData = useCallback(async (id: number) => {
    const response = await affaireService.getInitData(id);
    setInitData(response.data);
  }, []);
  

  const fetchAffaire = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await affaireService.getAffaireById(id);
      setAffaire(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Une erreur est survenue lors de la récupération de l\'affaire');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAffaire();
  }, [fetchAffaire]);

  const refresh = useCallback(() => {
    fetchAffaire();
  }, [fetchAffaire]);

  // Fonction pour changer le statut
  const changeStatut = useCallback(async (statutData: IStatutChange) => {
    if (!id || !affaire) return null;
    
    setLoading(true);
    try {
      const response = await affaireService.changeStatut(id, statutData);
      await fetchAffaire(); // Rafraîchir les données après le changement
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Erreur lors du changement de statut');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, affaire, fetchAffaire]);

  // Fonction pour générer une facture
  const genererFacture = useCallback(async () => {
    if (!id || !affaire) return null;
    
    setLoading(true);
    try {
      const response = await affaireService.genererFacture(id);
      await fetchAffaire(); // Rafraîchir les données après la génération
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Erreur lors de la génération de la facture');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, affaire, fetchAffaire]);

  // Fonction pour marquer un rapport comme terminé
  const marquerRapportTermine = useCallback(async (rapportId: number) => {
    if (!id || !affaire) return null;
    
    setLoading(true);
    try {
      const response = await affaireService.marquerRapportTermine(id, rapportId);
      await fetchAffaire(); // Rafraîchir les données après la mise à jour
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Erreur lors de la mise à jour du rapport');
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, affaire, fetchAffaire]);

  // Fonction pour exporter en PDF
  const exportPdf = useCallback(async () => {
    if (!id) return;
    
    try {
      const blob = await affaireService.exportPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affaire_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Erreur lors de l\'export PDF');
    }
  }, [id]);

  return {
    affaire,
    loading,
    error,
    refresh,
    changeStatut,
    genererFacture,
    marquerRapportTermine,
    exportPdf,
    initData,
    getInitData
  };
};

// Hook pour créer une nouvelle affaire
export const useCreateAffaire = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [newAffaire, setNewAffaire] = useState<IAffaire | null>(null);

  const createAffaire = async (affaireData: IAffaireCreate) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await affaireService.createAffaire(affaireData);
      setNewAffaire(response.data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.message || 'Erreur lors de la création de l\'affaire';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createAffaire,
    loading,
    error,
    success,
    newAffaire
  };
};

// Hook pour mettre à jour une affaire
export const useUpdateAffaire = (id: number | null) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const updateAffaire = async (affaireData: Partial<IAffaireCreate>) => {
    if (!id) return null;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await affaireService.updateAffaire(id, affaireData);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.message || 'Erreur lors de la mise à jour de l\'affaire';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateAffaire,
    loading,
    error,
    success
  };
};

// Hook pour utiliser le tableau de bord
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState<IDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await affaireService.getDashboard();
      setDashboardData(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Une erreur est survenue lors de la récupération des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    dashboardData,
    loading,
    error,
    refresh: fetchDashboard
  };
};

// Hook pour exporter la liste des affaires en CSV
export const useExportCsv = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const exportCsv = async (filters: IAffaireFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const blob = await affaireService.exportCsv(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'affaires.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.message || 'Erreur lors de l\'export CSV');
    } finally {
      setLoading(false);
    }
  };

  return {
    exportCsv,
    loading,
    error
  };
};