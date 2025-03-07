// hooks/useCourriers.ts
import { useState, useCallback, useEffect } from 'react';
import CourrierService, { Courrier, CourrierFilter, CourrierHistory, CourrierStats } from '@/services/CourrierService';
import { toast } from 'sonner';

// Hook pour récupérer la liste des courriers
export const useCourriers = (initialFilters: CourrierFilter = {}) => {
  const [courriers, setCourriers] = useState<Courrier[]>([]);
  const [filters, setFilters] = useState<CourrierFilter>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fonction pour charger les courriers
  const fetchCourriers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const data = await CourrierService.getCourriers(filters);
      setCourriers(data);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Erreur lors du chargement des courriers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Charger les courriers au montage et lorsque les filtres changent
  useEffect(() => {
    fetchCourriers();
  }, [fetchCourriers]);
  
  // Mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<CourrierFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  return {
    courriers,
    filters,
    updateFilters,
    resetFilters,
    isLoading,
    isError,
    error,
    refetch: fetchCourriers
  };
};

// Hook pour un courrier spécifique
export const useCourrier = (id?: number) => {
  const [courrier, setCourrier] = useState<Courrier | null>(null);
  const [history, setHistory] = useState<CourrierHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // États pour les opérations
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  
  // Charger les détails du courrier
  const fetchCourrier = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const data = await CourrierService.getCourrier(id);
      setCourrier(data);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Erreur lors du chargement du courrier:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  // Charger l'historique du courrier
  const fetchHistory = useCallback(async () => {
    if (!id) return;
    
    setIsHistoryLoading(true);
    
    try {
      const data = await CourrierService.getCourrierHistory(id);
      setHistory(data);
    } catch (err) {
      console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [id]);
  
  // Charger les données au changement d'ID
  useEffect(() => {
    if (id) {
      fetchCourrier();
      fetchHistory();
    } else {
      setCourrier(null);
      setHistory([]);
    }
  }, [id, fetchCourrier, fetchHistory]);
  
  // Fonction pour créer un courrier
  const createCourrier = async (data: Partial<Courrier>) => {
    setIsCreating(true);
    
    try {
      const createdCourrier = await CourrierService.createCourrier(data);
      toast("Courrier créé", {
        description: "Le courrier a été créé avec succès."
      });
      return createdCourrier;
    } catch (err) {
      toast("Erreur", {
        description: `Échec de la création du courrier : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsCreating(false);
    }
  };
  
  // Fonction pour mettre à jour un courrier
  const updateCourrier = async ({ id, data }: { id: number; data: Partial<Courrier> }) => {
    setIsUpdating(true);
    
    try {
      const updatedCourrier = await CourrierService.updateCourrier(id, data);
      setCourrier(updatedCourrier);
      toast("Courrier mis à jour", {
        description: "Le courrier a été mis à jour avec succès."
      });
      return updatedCourrier;
    } catch (err) {
      toast("Erreur", {
        description: `Échec de la mise à jour du courrier : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };
  
  // Fonction pour supprimer un courrier
  const deleteCourrier = async (id: number) => {
    setIsDeleting(true);
    
    try {
      await CourrierService.deleteCourrier(id);
      toast("Courrier supprimé", {
        description: "Le courrier a été supprimé avec succès."
      });
    } catch (err) {
      toast("Erreur", {
        description: `Échec de la suppression du courrier : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Fonction pour marquer un courrier comme envoyé
  const markAsSent = async ({ id, date }: { id: number; date?: string }) => {
    setIsSending(true);
    
    try {
      await CourrierService.markAsSent(id, date);
      toast("Courrier envoyé", {
        description: "Le courrier a été marqué comme envoyé."
      });
      await fetchCourrier();
      await fetchHistory();
    } catch (err) {
      toast("Erreur", {
        description: `Échec du marquage comme envoyé : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsSending(false);
    }
  };
  
  // Fonction pour marquer un courrier comme reçu
  const markAsReceived = async ({ id, date }: { id: number; date?: string }) => {
    setIsReceiving(true);
    
    try {
      await CourrierService.markAsReceived(id, date);
      toast("Courrier reçu", {
        description: "Le courrier a été marqué comme reçu."
      });
      await fetchCourrier();
      await fetchHistory();
    } catch (err) {
      toast("Erreur", {
        description: `Échec du marquage comme reçu : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsReceiving(false);
    }
  };
  
  // Fonction pour marquer un courrier comme traité
  const markAsProcessed = async (id: number) => {
    setIsProcessing(true);
    
    try {
      await CourrierService.markAsProcessed(id);
      toast("Courrier traité", {
        description: "Le courrier a été marqué comme traité."
      });
      await fetchCourrier();
      await fetchHistory();
    } catch (err) {
      toast("Erreur", {
        description: `Échec du marquage comme traité : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fonction pour archiver un courrier
  const archiveCourrier = async (id: number) => {
    setIsArchiving(true);
    
    try {
      await CourrierService.archiveCourrier(id);
      toast("Courrier archivé", {
        description: "Le courrier a été archivé avec succès."
      });
      await fetchCourrier();
      await fetchHistory();
    } catch (err) {
      toast("Erreur", {
        description: `Échec de l'archivage : ${err instanceof Error ? err.message : 'Erreur inconnue'}`
      });
      throw err;
    } finally {
      setIsArchiving(false);
    }
  };
  
  return {
    courrier,
    history,
    isLoading,
    isHistoryLoading,
    isError,
    error,
    refetch: fetchCourrier,
    refetchHistory: fetchHistory,
    createCourrier,
    isCreating,
    updateCourrier,
    isUpdating,
    deleteCourrier,
    isDeleting,
    markAsSent,
    isSending,
    markAsReceived,
    isReceiving,
    markAsProcessed,
    isProcessing,
    archiveCourrier,
    isArchiving
  };
};

// Hook pour les statistiques des courriers
export const useCourrierStats = () => {
  const [stats, setStats] = useState<CourrierStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Fonction pour charger les statistiques
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const data = await CourrierService.getCourrierStats();
      setStats(data);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Erreur lors du chargement des statistiques:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Charger les statistiques au montage
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return {
    stats,
    isLoading,
    isError,
    error,
    refetch: fetchStats
  };
};