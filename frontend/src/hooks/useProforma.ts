import { useState, useEffect, useCallback } from 'react';
import { proformaService, IProformaDetail, IProformaCreate } from '@/services/proformaService';
import { toast } from 'sonner';

interface UseProformaProps {
  proformaId?: number;
}

export const useProforma = ({ proformaId }: UseProformaProps = {}) => {
  const [proforma, setProforma] = useState<IProformaDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Récupérer les détails d'une proforma
  const fetchProforma = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await proformaService.getProformaById(id);
      setProforma(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement de la proforma:", err);
      setError("Impossible de charger les détails de la proforma.");
      toast("Erreur",{
        description: "Impossible de charger les détails de la proforma."
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer une nouvelle proforma
  const createProforma = async (data: IProformaCreate) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await proformaService.createProforma(data);
      const proformaDetail = response.data as IProformaDetail;
      setProforma(proformaDetail);
      toast("Succès",{
        description: "Proforma créée avec succès"
      });
      return proformaDetail;
    } catch (err) {
      console.error("Erreur lors de la création de la proforma:", err);
      setError("Impossible de créer la proforma.");
      toast("Erreur",{
        description: "Impossible de créer la proforma."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Mettre à jour une proforma existante
  const updateProforma = async (id: number, data: Partial<IProformaCreate>) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await proformaService.updateProforma(id, data);
      setProforma(prev => {
        if (!prev) return null;
        const updatedData = response.data as IProformaDetail;
        return { ...prev, ...updatedData };
      });
      toast("Succès",{
        description: "Proforma mise à jour avec succès"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la proforma:", err);
      setError("Impossible de mettre à jour la proforma.");
      toast("Erreur",{
        description: "Impossible de mettre à jour la proforma."
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Supprimer une proforma
  const deleteProforma = async (id: number) => {
    try {
      setIsDeleting(true);
      setError(null);
      await proformaService.deleteProforma(id);
      setProforma(null);
      toast("Succès",{
        description: "Proforma supprimée avec succès"
      });
      return true;
    } catch (err) {
      console.error("Erreur lors de la suppression de la proforma:", err);
      setError("Impossible de supprimer la proforma.");
      toast("Erreur",{
        description: "Impossible de supprimer la proforma."
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Valider une proforma
  const validateProforma = async (id: number) => {
    try {
      setIsSaving(true);
      setError(null);
      await proformaService.validateProforma(id);
      // Actualiser les données après validation
      await fetchProforma(id);
      toast("Succès",{
        description: "Proforma validée avec succès"
      });
      return true;
    } catch (err) {
      console.error("Erreur lors de la validation de la proforma:", err);
      setError("Impossible de valider la proforma.");
      toast("Erreur",{
        description: "Impossible de valider la proforma."
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Changer le statut d'une proforma
  const changeStatus = async (id: number, status: string) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await proformaService.changeStatus(id, status);
      // Mettre à jour les données locales
      setProforma(prev => {
        if (!prev) return null;
        const updatedProforma = response.data.proforma;
        return {
          ...prev,
          ...updatedProforma,
          offre: typeof updatedProforma.offre === 'number' ? prev.offre : updatedProforma.offre
        };
      });
      toast("Succès",{
        description: `Statut changé en "${status}" avec succès`
      });
      return true;
    } catch (err) {
      console.error("Erreur lors du changement de statut:", err);
      setError("Impossible de changer le statut.");
      toast("Erreur",{
        description: "Impossible de changer le statut."
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Télécharger un fichier pour une proforma
  const uploadFile = async (id: number, file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      const response = await proformaService.uploadFile(id, file);
      // Mettre à jour les données locales avec le nouveau fichier
      setProforma(prev => prev && ({ ...prev, fichier: response.data.file_url }));
      toast("Succès",{
        description: "Fichier téléchargé avec succès"
      });
      return response.data;
    } catch (err) {
      console.error("Erreur lors du téléchargement du fichier:", err);
      setError("Impossible de télécharger le fichier.");
      toast("Erreur",{
        description: "Impossible de télécharger le fichier."
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Télécharger le fichier d'une proforma
  const downloadFile = (fileUrl: string, fileName: string) => {
    proformaService.downloadFile(fileUrl, fileName);
  };

  // Charger les détails de la proforma lors du montage du composant
  useEffect(() => {
    if (proformaId) {
      fetchProforma(proformaId);
    }
  }, [proformaId, fetchProforma]);

  return {
    proforma,
    isLoading,
    error,
    isSaving,
    isDeleting,
    isUploading,
    fetchProforma,
    createProforma,
    updateProforma,
    deleteProforma,
    validateProforma,
    changeStatus,
    uploadFile,
    downloadFile
  };
};