import { useState, useCallback } from 'react';
import { factureService, IFactureFilters } from '@/services/factureService';
import { toast } from 'sonner';

export const useExportFacture = () => {
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Télécharger un CSV des factures
  const exportToCsv = useCallback(async (filters: IFactureFilters = {
    page: 0,
    page_size: 0
  }) => {
    try {
      setIsExporting(true);
      const blob = await factureService.exportCsv(filters);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factures_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast("Succès", {
        description: "Export CSV téléchargé avec succès"
      });
    } catch (err) {
      console.error("Erreur lors de l'export CSV:", err);
      toast("Erreur", {
        description: "Impossible d'exporter les données en CSV."
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Télécharger un PDF d'une facture
  const exportToPdf = useCallback(async (id: number) => {
    try {
      setIsExporting(true);
      const blob = await factureService.exportPdf(id);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${id}_${new Date().toISOString().slice(0, 10)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast("Succès", {
        description: "Export PDF téléchargé avec succès"
      });
    } catch (err) {
      console.error("Erreur lors de l'export PDF:", err);
      toast("Erreur", {
        description: "Impossible d'exporter la facture en PDF."
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    exportToCsv,
    exportToPdf
  };
};