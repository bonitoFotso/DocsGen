import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { factureService, IFacture, IFactureFilters, IFactureStats } from '@/services/factureService';
import { toast } from 'sonner';

interface FactureContextType {
  factures: IFacture[];
  isLoading: boolean;
  error: string | null;
  stats: IFactureStats | null;
  filters: IFactureFilters;
  totalItems: number;
  fetchFactures: (newFilters?: Partial<IFactureFilters>) => Promise<void>;
  fetchStats: () => Promise<void>;
  setFilters: (newFilters: Partial<IFactureFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: IFactureFilters = {
  page: 1,
  page_size: 10,
  ordering: '-date_creation'
};

const FactureContext = createContext<FactureContextType | undefined>(undefined);

export const FactureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [factures, setFactures] = useState<IFacture[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<IFactureStats | null>(null);
  const [filters, setFilters] = useState<IFactureFilters>(defaultFilters);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchFactures = useCallback(async (newFilters?: Partial<IFactureFilters>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedFilters = newFilters ? { ...filters, ...newFilters } : filters;
      
      const response = await factureService.getFactures(updatedFilters);
      setFactures(response.data);
      
      setTotalItems(response.data.length);
      
      if (newFilters) {
        setFilters(updatedFilters);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des factures:", err);
      setError("Impossible de charger les factures. Veuillez réessayer plus tard.");
      toast("Erreur", {
        description: "Impossible de charger les factures."
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await factureService.getStats();
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

  const updateFilters = useCallback((newFilters: Partial<IFactureFilters>) => {
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

  // Charger les factures lors du montage du composant ou du changement de filtres
  useEffect(() => {
    fetchFactures();
  }, [filters.page, filters.page_size, filters.ordering, fetchFactures]);

  const value = {
    factures,
    isLoading,
    error,
    stats,
    filters,
    totalItems,
    fetchFactures,
    fetchStats,
    setFilters: updateFilters,
    resetFilters
  };

  return <FactureContext.Provider value={value}>{children}</FactureContext.Provider>;
};

export const useFactures = () => {
  const context = useContext(FactureContext);
  if (context === undefined) {
    throw new Error('useFactures must be used within a FactureProvider');
  }
  return context;
};