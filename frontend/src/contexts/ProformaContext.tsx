import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { proformaService, IProforma, IProformaFilters, IProformaStats } from '@/services/proformaService';
import { toast } from 'sonner';

interface ProformaContextType {
  proformas: IProforma[];
  isLoading: boolean;
  error: string | null;
  stats: IProformaStats | null;
  filters: IProformaFilters;
  totalItems: number;
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
  const [proformas, setProformas] = useState<IProforma[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IProformaStats | null>(null);
  const [filters, setFilters] = useState<IProformaFilters>(defaultFilters);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchProformas = useCallback(async (newFilters?: Partial<IProformaFilters>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedFilters = newFilters ? { ...filters, ...newFilters } : filters;
      
      const response = await proformaService.getProformas(updatedFilters);
      setProformas(response.data || response.data);
      
      setTotalItems(response.data.length);
      
      if (newFilters) {
        setFilters(updatedFilters);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des proformas:", err);
      setError("Impossible de charger les proformas. Veuillez réessayer plus tard.");
      toast("Erreur", {
        description: "Impossible de charger les proformas."
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await proformaService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
      toast("Erreur", {
        description: "Impossible de charger les statistiques."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateFilters = useCallback((newFilters: Partial<IProformaFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Si on change de filtre, on revient à la première page
      page: newFilters.page || 1
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Charger les proformas lors du montage du composant ou du changement de filtres
  useEffect(() => {
    fetchProformas();
  }, [filters.page, filters.page_size, filters.ordering, fetchProformas]);

  const value = {
    proformas,
    isLoading,
    error,
    stats,
    filters,
    totalItems,
    fetchProformas,
    fetchStats,
    setFilters: updateFilters,
    resetFilters
  };

  return <ProformaContext.Provider value={value}>{children}</ProformaContext.Provider>;
};
