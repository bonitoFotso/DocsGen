import { useState, useEffect, useCallback } from 'react';
import { 
  Opportunite, 
  OpportuniteDetail, 
  CreateOpportuniteDto, 
  UpdateOpportuniteDto,
  OpportuniteFilter,
  OpportuniteTransitionResult,
  StatutStat,
  Totaux,
  OpportuniteStatistics
} from '@/types/opportunite.types';
import { opportuniteApi } from '@/services/opportunite.services';

/**
 * Hook pour obtenir une liste d'opportunités avec filtrage et pagination
 */
export function useOpportunites(initialFilter?: OpportuniteFilter) {
  const [opportunites, setOpportunites] = useState<Opportunite[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<OpportuniteFilter | undefined>(initialFilter);
  const [totalCount, setTotalCount] = useState<number | undefined>(undefined);
  
  const fetchOpportunites = useCallback(async (currentFilter?: OpportuniteFilter) => {
    try {
      setLoading(true);
      setError(null);
      const filterToUse = currentFilter || filter;
      
      // Supposant que l'API retourne { results: Opportunite[], count: number }
      const data = await opportuniteApi.getOpportunites(filterToUse);
      setOpportunites(data);
      setTotalCount(data.length);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  }, [filter]);
  
  useEffect(() => {
    fetchOpportunites();
  }, [fetchOpportunites]);
  
  const updateFilter = useCallback((newFilter: OpportuniteFilter) => {
    setFilter(newFilter);
  }, []);
  
  return { 
    opportunites, 
    loading, 
    error, 
    filter,
    totalCount,
    updateFilter,
    refetch: fetchOpportunites
  };
}

/**
 * Hook pour manipuler une opportunité spécifique
 */
export function useOpportuniteDetail(id?: number) {
  const [opportunite, setOpportunite] = useState<OpportuniteDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchOpportunite = useCallback(async (opportuniteId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await opportuniteApi.getOpportuniteDetail(opportuniteId);
      setOpportunite(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (id) {
      fetchOpportunite(id);
    }
  }, [id, fetchOpportunite]);
  
  const update = useCallback(async (data: UpdateOpportuniteDto) => {
    if (!id) return null;
    
    try {
      setLoading(true);
      setError(null);
      const updated = await opportuniteApi.updateOpportunite(id, data);
      setOpportunite(prev => {
        if (!prev) return null;
        return {
          ...prev,
          ...updated as unknown as OpportuniteDetail // Cast to ensure type compatibility
        };
      });
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  const remove = useCallback(async () => {
    if (!id) return false;
    
    try {
      setLoading(true);
      setError(null);
      await opportuniteApi.deleteOpportunite(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression'));
      return false;
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  // Méthodes pour les transitions d'état
  const qualifier = useCallback(async (): Promise<OpportuniteTransitionResult | null> => {
    if (!id) return null;
    
    try {
      setLoading(true);
      const result = await opportuniteApi.qualifierOpportunite(id);
      if (result.success && opportunite) {
        setOpportunite({ ...opportunite, statut: 'QUALIFICATION' });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la qualification'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, opportunite]);
  
  const proposer = useCallback(async (): Promise<OpportuniteTransitionResult | null> => {
    if (!id) return null;
    
    try {
      setLoading(true);
      const result = await opportuniteApi.proposerOpportunite(id);
      if (result.success && opportunite) {
        setOpportunite({ ...opportunite, statut: 'PROPOSITION' });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du passage en proposition'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, opportunite]);
  
  const negocier = useCallback(async (): Promise<OpportuniteTransitionResult | null> => {
    if (!id) return null;
    
    try {
      setLoading(true);
      const result = await opportuniteApi.negocierOpportunite(id);
      if (result.success && opportunite) {
        setOpportunite({ ...opportunite, statut: 'NEGOCIATION' });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du passage en négociation'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, opportunite]);
  
  const gagner = useCallback(async (): Promise<OpportuniteTransitionResult | null> => {
    if (!id) return null;
    
    try {
      setLoading(true);
      const result = await opportuniteApi.gagnerOpportunite(id);
      if (result.success && opportunite) {
        setOpportunite({ 
          ...opportunite, 
          statut: 'GAGNEE',
          date_cloture: new Date().toISOString()
        });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du passage à gagnée'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, opportunite]);
  
  const perdre = useCallback(async (raison?: string): Promise<OpportuniteTransitionResult | null> => {
    if (!id) return null;
    
    try {
      setLoading(true);
      const result = await opportuniteApi.perdreOpportunite(id, raison);
      if (result.success && opportunite) {
        setOpportunite({ 
          ...opportunite, 
          statut: 'PERDUE',
          date_cloture: new Date().toISOString()
        });
      }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors du passage à perdue'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id, opportunite]);
  
  const creerOffre = useCallback(async () => {
    if (!id) return null;
    
    try {
      setLoading(true);
      const result = await opportuniteApi.creerOffre(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Erreur lors de la création de l'offre"));
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);
  
  return {
    opportunite,
    loading,
    error,
    refetch: id ? () => fetchOpportunite(id) : undefined,
    update,
    remove,
    qualifier,
    proposer,
    negocier,
    gagner,
    perdre,
    creerOffre
  };
}

/**
 * Hook pour créer une nouvelle opportunité
 */
export function useCreateOpportunite() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const create = useCallback(async (data: CreateOpportuniteDto) => {
    try {
      setLoading(true);
      setError(null);
      const opportunite = await opportuniteApi.createOpportunite(data);
      return opportunite;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la création'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { create, loading, error };
}

/**
 * Hook pour les statistiques d'opportunités
 */
export function useOpportuniteStatistics() {
  const [stats, setStats] = useState<OpportuniteStatistics>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [par_statut, setParStatut] = useState<StatutStat[]>();
  const [totaux, setTotaux] = useState<Totaux>();
  
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await opportuniteApi.getStatistics();
      
      setParStatut(data.par_statut);
      setTotaux(data.totaux);
      setStats(data);
      // const ss
      // setStats(
        
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la récupération des statistiques'));
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  return { stats, loading, error, refetch: fetchStats, par_statut, totaux };
}

/**
 * Hook pour les opérations groupées sur les opportunités
 */
export function useOpportunitesBulkOperations() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  const gagnerMultiple = useCallback(async (ids: number[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportuniteApi.gagnerMultiple(ids);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour groupée'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const perdreMultiple = useCallback(async (ids: number[], raison?: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportuniteApi.perdreMultiple(ids, raison);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour groupée'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const updateRelanceMultiple = useCallback(async (ids: number[]) => {
    try {
      setLoading(true);
      setError(null);
      const result = await opportuniteApi.updateRelanceMultiple(ids);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la mise à jour des relances'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMultiple = useCallback(async (ids: number[]) => {
    try {
      setLoading(true);
      setError(null);
      let successCount = 0;
      const errors: string[] = [];

      // Exécution séquentielle des suppressions
      for (const id of ids) {
        try {
          await opportuniteApi.deleteOpportunite(id);
          successCount++;
        } catch (err) {
          errors.push(`Erreur lors de la suppression de l'opportunité ${id}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      return {
        success: successCount > 0,
        success_count: successCount,
        error_count: ids.length - successCount,
        errors
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erreur lors de la suppression groupée'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    gagnerMultiple,
    perdreMultiple,
    updateRelanceMultiple,
    deleteMultiple,
    loading,
    error
  };
}