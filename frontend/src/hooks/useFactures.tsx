// src/hooks/useFactures.tsx
import { useState, useCallback, useEffect } from 'react';
import { factureService, IFacture, IFactureDetail, IFactureCreate, IFactureFilters, IFactureStats } from '@/services/factureService';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface ApiErrorResponse {
  message?: string;
}

export interface UseFacturesProps {
  factureId?: number;
  initialFilters?: IFactureFilters;
}

export const useFactures = (props?: UseFacturesProps) => {
  const { factureId, initialFilters } = props || {};

  // États pour la gestion des factures
  const [facture, setFacture] = useState<IFactureDetail | null>(null);
  const [factures, setFactures] = useState<IFacture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    page_size: 10,
    total_pages: 1
  });
  const [filters, setFilters] = useState<IFactureFilters>(initialFilters || {
    page: 1,
    page_size: 10,
    ordering: '-date_creation'
  });
  const [stats, setStats] = useState<IFactureStats | null>(null);

  /**
   * Récupère une liste paginée de factures
   */
  const fetchFactures = useCallback(async (newFilters?: IFactureFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const mergedFilters = { ...filters, ...newFilters };
      setFilters(mergedFilters);

      const response = await factureService.getFactures(mergedFilters);
      const data = response.data;

      setFactures(data);

      // Mettre à jour la pagination si disponible dans les en-têtes ou la réponse
      // Note: Ajustez en fonction de la structure réelle de votre API
      if (response.headers['x-total-count']) {
        const total = parseInt(response.headers['x-total-count']);
        const page = mergedFilters.page || 1;
        const pageSize = mergedFilters.page_size || 10;

        setPagination({
          total,
          page,
          page_size: pageSize,
          total_pages: Math.ceil(total / pageSize)
        });
      }

      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des factures';
      setError(errorMessage);
      toast("Erreur", {
        description: errorMessage
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  /**
   * Récupère les détails d'une facture spécifique
   */
  const fetchFacture = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await factureService.getFactureById(id);
      const factureData = response.data;

      setFacture(factureData);
      return factureData;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors du chargement de la facture #${id}`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crée une nouvelle facture
   */
  const createFacture = useCallback(async (data: IFactureCreate) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await factureService.createFacture(data);
      const newFacture = response.data;

      toast.success("Succès", {
        description: "Facture créée avec succès"
      });

      return newFacture;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la facture';
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, []);

  /**
   * Met à jour une facture existante
   */
  const updateFacture = useCallback(async (id: number, data: Partial<IFactureCreate>) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await factureService.updateFacture(id, data);
      const updatedFacture = response.data;

      // Mettre à jour l'état local si la facture en cours est celle mise à jour
      if (facture && facture.id === id) {
        setFacture({
          ...facture,
          ...updatedFacture
        } as IFactureDetail);
      }

      toast.success("Succès", {
        description: "Facture mise à jour avec succès"
      });

      return updatedFacture;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors de la mise à jour de la facture #${id}`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [facture]);

  /**
   * Supprime une facture
   */
  const deleteFacture = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      await factureService.deleteFacture(id);

      // Si c'est la facture actuelle, réinitialiser l'état
      if (facture && facture.id === id) {
        setFacture(null);
      }

      // Mettre à jour la liste si nécessaire
      setFactures(prevFactures => prevFactures.filter(f => f.id !== id));

      toast.success("Succès", {
        description: "Facture supprimée avec succès"
      });

      return true;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors de la suppression de la facture #${id}`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [facture]);

  /**
   * Marque une facture comme payée
   */
  const markAsPaid = useCallback(async (id: number, amount?: number) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await factureService.markAsPaid(id, amount);

      // Mettre à jour l'état de la facture si c'est la facture actuelle
      if (facture && facture.id === id) {
        // Rechargement complet de la facture pour avoir toutes les informations à jour
        fetchFacture(id);
      }

      toast.success("Succès", {
        description: "Paiement enregistré avec succès"
      });

      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors de l'enregistrement du paiement pour la facture #${id}`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [facture, fetchFacture]);

  /**
   * Marque une facture comme émise
   */
  const markAsIssued = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await factureService.markAsIssued(id);

      // Mettre à jour l'état de la facture si c'est la facture actuelle
      if (facture && facture.id === id) {
        // Rechargement complet de la facture pour avoir toutes les informations à jour
        fetchFacture(id);
      }

      toast.success("Succès", {
        description: "Facture marquée comme émise avec succès"
      });

      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors du marquage de la facture #${id} comme émise`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [facture, fetchFacture]);

  /**
   * Annule une facture
   */
  const cancelFacture = useCallback(async (id: number) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await factureService.cancelFacture(id);

      // Mettre à jour l'état de la facture si c'est la facture actuelle
      if (facture && facture.id === id) {
        // Rechargement complet de la facture pour avoir toutes les informations à jour
        fetchFacture(id);
      }

      toast.success("Succès", {
        description: "Facture annulée avec succès"
      });

      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors de l'annulation de la facture #${id}`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [facture, fetchFacture]);

  /**
   * Télécharge un fichier pour une facture
   */
  const uploadFile = useCallback(async (id: number, file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const response = await factureService.uploadFile(id, file);

      // Mettre à jour l'état de la facture si c'est la facture actuelle
      if (facture && facture.id === id) {
        setFacture({
          ...facture,
          fichier: response.data.file_url
        });
      }

      toast.success("Succès", {
        description: "Fichier téléchargé avec succès"
      });

      return response.data;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Erreur lors du téléchargement du fichier';
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [facture]);

  /**
   * Récupère l'URL du fichier d'une facture
   */
  const getFileUrl = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await factureService.getFileUrl(id);
      return response.data.fichier_url;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || `Erreur lors de la récupération du fichier de la facture #${id}`;
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Télécharge le fichier d'une facture
   */
  const downloadFile = useCallback((url: string, fileName: string) => {
    try {
      factureService.downloadFile(url, fileName);
      return true;
    } catch (err) {
      console.log(err)

      const errorMessage = 'Erreur lors du téléchargement du fichier';
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return false;
    }
  }, []);

  /**
   * Récupère les statistiques des factures
   */
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await factureService.getStats();
      const statsData = response.data;

      setStats(statsData);
      return statsData;
    } catch (err) {
      const error = err as AxiosError<ApiErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Erreur lors de la récupération des statistiques';
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Exporte une facture en PDF
   */
  const exportToPdf = useCallback(async (id: number) => {
    setIsExporting(true);
    setError(null);

    try {
      const blob = await factureService.exportPdf(id);

      // Créer un URL pour le blob et télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `facture-${id}.pdf`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Succès", {
        description: "Facture exportée en PDF avec succès"
      });

      return true;
    } catch (err) {
      console.log(err)
      const errorMessage = 'Erreur lors de l\'export de la facture en PDF';
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  }, []);

  /**
   * Exporte la liste des factures en CSV
   */
  const exportToCsv = useCallback(async (exportFilters?: IFactureFilters) => {
    setIsExporting(true);
    setError(null);

    try {
      const mergedFilters = { ...filters, ...exportFilters };
      const blob = await factureService.exportCsv(mergedFilters);

      // Créer un URL pour le blob et télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const fileName = `factures-${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Succès", {
        description: "Liste des factures exportée en CSV avec succès"
      });

      return true;
    } catch (err) {
      const errorMessage = 'Erreur lors de l\'export des factures en CSV';
      console.log(err)
      setError(errorMessage);
      toast.error("Erreur", {
        description: errorMessage
      });
      return false;
    } finally {
      setIsExporting(false);
    }
  }, [filters]);

  // Effet pour charger la facture si factureId est fourni
  useEffect(() => {
    if (factureId) {
      fetchFacture(factureId);
    }
  }, [factureId, fetchFacture]);

  return {
    // États
    facture,
    factures,
    isLoading,
    isSaving,
    isExporting,
    isUploading,
    error,
    pagination,
    filters,
    stats,

    // Fonctions
    setFilters,
    fetchFactures,
    fetchFacture,
    createFacture,
    updateFacture,
    deleteFacture,
    markAsPaid,
    markAsIssued,
    cancelFacture,
    uploadFile,
    getFileUrl,
    downloadFile,
    fetchStats,
    exportToPdf,
    exportToCsv
  };
};

export default useFactures;