// hooks/useOffreDetails.ts
import { useState, useEffect, useCallback } from 'react';
import { OffreDetail } from '@/types/offre';

interface HistoriqueEntry {
  id: number;
  date: string;
  action: string;
  commentaire: string;
}

interface UseOffreDetailsProps {
  id: number;
  offreService: {
    getById: (id: number) => Promise<OffreDetail>;
    getHistorique?: (id: number) => Promise<HistoriqueEntry[]>;
  };
}

export const useOffreDetails = ({ id, offreService }: UseOffreDetailsProps) => {
  const [loading, setLoading] = useState(true);
  const [offre, setOffre] = useState<OffreDetail | null>(null);
  const [historique, setHistorique] = useState<HistoriqueEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchOffre = useCallback(async () => {
    try {
      setLoading(true);
      const response = await offreService.getById(Number(id));
      setOffre(response);
      
      // Récupérer l'historique si disponible
      if (offreService.getHistorique) {
        const historiqueData = await offreService.getHistorique(Number(id));
        setHistorique(historiqueData);
      }
      
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur lors du chargement de l\'offre:', err);
    } finally {
      setLoading(false);
    }
  }, [id, offreService]);

  useEffect(() => {
    fetchOffre();
  }, [fetchOffre]);

  return { offre, loading, historique, error, fetchOffre };
};