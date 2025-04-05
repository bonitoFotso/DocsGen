import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { proformaService, IProformaFilters, IProformaStats } from '@/services/proformaService';
import { toast } from 'sonner';
import { LinearProforma } from '@/config/linearizeProformaData';
import { AllKPIs } from '@/config/pro/extractKPIs';
import { useProformasAnalytics } from '@/hooks/useProformasAnalitics';
import { Proforma } from '@/types/Proforma';

interface ProformaContextType {
  proformas: Proforma[];
  isLoading: boolean;
  error: string | null;
  stats: IProformaStats | null;
  filters: IProformaFilters;
  totalItems: number;
  linearProformas: LinearProforma[]; // Utiliser le type depuis useProformasAnalytics
  kpi: AllKPIs | null; // Utiliser le type depuis useProformasAnalytics
  fetchProformas: (newFilters?: Partial<IProformaFilters>) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (newFilters: Partial<IProformaFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: IProformaFilters = {
  page: 1,
  page_size: 10,
  ordering: '-date_creation'
};

export const ProformaContext = createContext<ProformaContextType | undefined>(undefined);

export const ProformaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [proformas, setProformas] = useState<Proforma[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IProformaStats | null>(null);
  const [filters, setFilters] = useState<IProformaFilters>(defaultFilters);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Utiliser le hook pour la partie analyse
  const {
    linearProformas,
    kpi,
    processProformas,
    isProcessing
  } = useProformasAnalytics(proformas);

  // Fonction pour récupérer les proformas
  const fetchProformas = useCallback(async (newFilters?: Partial<IProformaFilters>) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedFilters = newFilters ? { ...filters, ...newFilters } : filters;

      const response = await proformaService.getProformas(updatedFilters);
      
      // Vérification que response.data existe et est un tableau
      if (response && response.data && Array.isArray(response.data)) {
        setProformas(response.data);
        // Traiter les nouvelles proformas avec notre hook d'analyse
        await processProformas(response.data);
        setTotalItems(response.data.length);
      } else {
        throw new Error('Format de réponse invalide');
      }

      if (newFilters) {
        setFilters(updatedFilters);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des proformas:", err);
      setError("Impossible de charger les proformas. Veuillez réessayer plus tard.");
      toast.error("Impossible de charger les proformas.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, processProformas]);

  // Fonction pour récupérer les statistiques
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await proformaService.getStats();
      if (response && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
      toast.error("Impossible de charger les statistiques.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour les filtres
  const updateFilters = useCallback((newFilters: Partial<IProformaFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Si on change de filtre, on revient à la première page sauf si la page est explicitement définie
      page: Object.prototype.hasOwnProperty.call(newFilters, 'page') ? newFilters.page! : 1
    }));
  }, []);

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Effet pour charger les proformas lors des changements de filtres
  useEffect(() => {
    fetchProformas();
  }, [filters.page, filters.page_size, filters.ordering, fetchProformas]);

  // Valeur du contexte
  const value = {
    proformas,
    isLoading: isLoading || isProcessing,
    error,
    stats,
    filters,
    totalItems,
    linearProformas,
    kpi,
    fetchProformas,
    fetchStats,
    setFilters: updateFilters,
    resetFilters
  };

  return <ProformaContext.Provider value={value}>{children}</ProformaContext.Provider>;
};