import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { linearizeProformaData, LinearProforma } from '@/config/linearizeProformaData';
import { AllKPIs, extractKPIs } from '@/config/pro/extractKPIs';
import { Proforma } from '@/types/Proforma';

interface UseProformasAnalyticsReturn {
  linearProformas: LinearProforma[];
  kpi: AllKPIs | null;
  isProcessing: boolean;
  error: string | null;
  processProformas: (proformas: Proforma[]) => Promise<void>;
  fetchLinearProformas: (proformas?: Proforma[]) => Promise<LinearProforma[]>;
  fetchKpi: () => Promise<void>;
}

export const useProformasAnalytics = (initialProformas: Proforma[] = []): UseProformasAnalyticsReturn => {
  const [linearProformas, setLinearProformas] = useState<LinearProforma[]>([]);
  const [kpi, setKpi] = useState<AllKPIs | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [proformas, setProformas] = useState<Proforma[]>(initialProformas);

  // Fonction pour linéariser les proformas
  const fetchLinearProformas = useCallback(async (inputProformas?: Proforma[]): Promise<LinearProforma[]> => {
    const dataToProcess = inputProformas || proformas;
    
    if (dataToProcess && dataToProcess.length > 0) {
      try {
        setIsProcessing(true);
        const linearData = linearizeProformaData(JSON.stringify(dataToProcess));
        setLinearProformas(linearData);
        setError(null);
        return linearData;
      } catch (err) {
        console.error("Erreur lors de la linéarisation des proformas:", err);
        setError("Impossible de traiter les données des proformas.");
        toast.error("Impossible de traiter les données des proformas.");
        return [];
      } finally {
        setIsProcessing(false);
      }
    }
    return [];
  }, [proformas]);

  // Fonction pour calculer les KPI
  const fetchKpi = useCallback(async (): Promise<void> => {
    try {
      setIsProcessing(true);
      // Utiliser les données linéarisées existantes ou en obtenir de nouvelles
      const dataToUse = linearProformas.length > 0 
        ? linearProformas 
        : await fetchLinearProformas();
      
      if (dataToUse && dataToUse.length > 0) {
        const kpiData = extractKPIs(dataToUse);
        setKpi(kpiData);
        setError(null);
      }
    } catch (err) {
      console.error("Erreur lors du calcul des KPI:", err);
      setError("Impossible de calculer les indicateurs de performance.");
      toast.error("Impossible de calculer les indicateurs de performance.");
    } finally {
      setIsProcessing(false);
    }
  }, [linearProformas, fetchLinearProformas]);

  // Fonction pour traiter un nouvel ensemble de proformas
  const processProformas = useCallback(async (newProformas: Proforma[]): Promise<void> => {
    setProformas(newProformas);
    // Le reste du traitement se fera via les effets ci-dessous
  }, []);

  // Effet pour traiter les données lorsque les proformas changent
  useEffect(() => {
    const processData = async () => {
      if (proformas.length > 0) {
        await fetchLinearProformas();
      }
    };
    
    processData();
  }, [proformas, fetchLinearProformas]);

  // Effet pour calculer les KPI lorsque les données linéarisées changent
  useEffect(() => {
    if (linearProformas.length > 0) {
      fetchKpi();
    }
  }, [linearProformas, fetchKpi]);

  return {
    linearProformas,
    kpi,
    isProcessing,
    error,
    processProformas,
    fetchLinearProformas,
    fetchKpi
  };
};