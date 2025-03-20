import { useState, useEffect, useCallback } from 'react';
import { factureService, IFactureDetail, IFactureCreate } from '@/services/factureService';
import { toast } from 'sonner';

interface UseFactureProps {
  factureId?: number;
}

export const useFacture = ({ factureId }: UseFactureProps = {}) => {
  const [facture, setFacture] = useState<IFactureDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Récupérer les détails d'une facture
  const fetchFacture = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await factureService.getFactureById(id);
      setFacture(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement de la facture:", err);
      setError("Impossible de charger les détails de la facture.");
      toast("Erreur", {
        description: "Impossible de charger les détails de la facture."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer une nouvelle facture
  const createFacture = async (data: IFactureCreate) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await factureService.createFacture(data);
      const factureDetail = response.data as IFactureDetail;
      setFacture(factureDetail);
      toast("Succès", {
        description: "Facture créée avec succès"
      });
      return factureDetail;
    } catch (err) {
      console.error("Erreur lors de la création de la facture:", err);
      setError("Impossible de créer la facture.");
      toast("Erreur", {
        description: "Impossible de créer la facture."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Mettre à jour une facture existante
  const updateFacture = async (id: number, data: Partial<IFactureCreate>) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await factureService.updateFacture(id, data);
      setFacture(prev => prev && ({ ...prev, ...response.data }));
      toast("Succès", {
        description: "Facture mise à jour avec succès"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la facture:", err);
      setError("Impossible de mettre à jour la facture.");
      toast("Erreur", {
        description: "Impossible de mettre à jour la facture."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer une facture
  const deleteFacture = async (id: number) => {
    try {
      setIsDeleting(true);
      setError(null);
      await factureService.deleteFacture(id);
      setFacture(null);
      toast("Succès", {
        description: "Facture supprimée avec succès"
      });
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de la facture:", err);
      setError("Impossible de supprimer la facture.");
      toast("Erreur", {
        description: "Impossible de supprimer la facture."
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Marquer une facture comme payée
  const markAsPaid = async (id: number, amount?: number) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await factureService.markAsPaid(id, amount);
      await fetchFacture(id);
      toast("Succès", {
        description: "Facture marquée comme payée"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors du marquage de la facture comme payée:", err);
      setError("Impossible de marquer la facture comme payée.");
      toast("Erreur", {
        description: "Impossible de marquer la facture comme payée."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Marquer une facture comme émise
  const markAsIssued = async (id: number) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await factureService.markAsIssued(id);
      await fetchFacture(id);
      toast("Succès", {
        description: "Facture marquée comme émise"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors du marquage de la facture comme émise:", err);
      setError("Impossible de marquer la facture comme émise.");
      toast("Erreur", {
        description: "Impossible de marquer la facture comme émise."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Annuler une facture
  const cancelFacture = async (id: number) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await factureService.cancelFacture(id);
      await fetchFacture(id);
      toast("Succès", {
        description: "Facture annulée avec succès"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors de l'annulation de la facture:", err);
      setError("Impossible d'annuler la facture.");
      toast("Erreur", {
        description: "Impossible d'annuler la facture."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Télécharger un fichier pour une facture
  const uploadFile = async (id: number, file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      const response = await factureService.uploadFile(id, file);
      // Mettre à jour les données locales avec le nouveau fichier
      setFacture(prev => prev && ({ ...prev, fichier: response.data.file_url }));
      toast("Succès", {
        description: "Fichier téléchargé avec succès"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors du téléchargement du fichier:", err);
      setError("Impossible de télécharger le fichier.");
      toast("Erreur", {
        description: "Impossible de télécharger le fichier."
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Télécharger le fichier d'une facture
  const downloadFile = async (id: number) => {
    try {
      if (!facture?.fichier) {
        toast("Erreur", {
          description: "Aucun fichier disponible pour cette facture."
        });
        return;
      }
      
      const response = await factureService.getFileUrl(id);
      const fileUrl = response.data.fichier_url;
      const fileName = fileUrl.split('/').pop() || `facture_${id}.pdf`;
      
      factureService.downloadFile(fileUrl, fileName);
    } catch (err) {
      console.error("Erreur lors du téléchargement du fichier:", err);
      toast("Erreur", {
        description: "Impossible de télécharger le fichier."
      });
    }
  };

  // Exporter la facture en PDF
  const exportPdf = async (id: number) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  // Charger les détails de la facture lors du montage du composant
  useEffect(() => {
    if (factureId) {
      console.log("montage")
      fetchFacture(factureId);
    }
  }, [factureId, fetchFacture]);

  return {
    facture,
    isLoading,
    error,
    isSaving,
    isDeleting,
    isUploading,
    fetchFacture,
    createFacture,
    updateFacture,
    deleteFacture,
    markAsPaid,
    markAsIssued,
    cancelFacture,
    uploadFile,
    downloadFile,
    exportPdf
  };
};