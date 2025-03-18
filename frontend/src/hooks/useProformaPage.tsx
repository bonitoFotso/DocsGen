// src/hooks/useProformaPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProforma } from '@/hooks/useProforma';
import { useExportProforma } from '@/hooks/useExportProforma';

export interface EditedProformaData {
  notes: string;
  montant_ht: number;
  taux_tva: number;
  date_expiration: string;
}

export const useProformaPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    proforma,
    isLoading,
    error,
    isSaving,
    isUploading,
    fetchProforma,
    updateProforma,
    deleteProforma,
    validateProforma,
    changeStatus,
    uploadFile,
    downloadFile
  } = useProforma({ proformaId: id ? parseInt(id) : undefined });
  const { isExporting, exportToPdf } = useExportProforma();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<EditedProformaData>({
    notes: '',
    montant_ht: 0,
    taux_tva: 19.25,
    date_expiration: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Mettre à jour les données d'édition lorsque la proforma est chargée
  useEffect(() => {
    if (proforma) {
      setEditedData({
        notes: proforma.notes || '',
        montant_ht: proforma.montant_ht,
        taux_tva: proforma.taux_tva,
        date_expiration: proforma.date_expiration ? new Date(proforma.date_expiration).toISOString().split('T')[0] : ''
      });
    }
  }, [proforma]);

  // Navigation vers la liste
  const handleBackToList = () => {
    navigate('/proformas');
  };

  // Modification des champs d'édition
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enregistrer les modifications
  const handleSaveChanges = async () => {
    if (!id) return;

    try {
      await updateProforma(parseInt(id), {
        notes: editedData.notes,
        montant_ht: Number(editedData.montant_ht),
        taux_tva: Number(editedData.taux_tva),
        date_expiration: editedData.date_expiration || undefined
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
    }
  };

  // Annuler les modifications
  const handleCancelEdit = () => {
    if (proforma) {
      setEditedData({
        notes: proforma.notes || '',
        montant_ht: proforma.montant_ht,
        taux_tva: proforma.taux_tva,
        date_expiration: proforma.date_expiration ? new Date(proforma.date_expiration).toISOString().split('T')[0] : ''
      });
    }
    setIsEditing(false);
  };

  // Supprimer la proforma
  const handleDelete = async () => {
    if (!id) return;

    const success = await deleteProforma(parseInt(id));
    if (success) {
      navigate('/proformas');
    }
    setIsDeleteDialogOpen(false);
  };

  // Valider la proforma
  const handleValidate = async () => {
    if (!id) return;

    await validateProforma(parseInt(id));
  };

  // Changer le statut
  const handleStatusChange = async () => {
    if (!id || !selectedStatus) return;

    await changeStatus(parseInt(id), selectedStatus);
    setIsStatusDialogOpen(false);
  };

  // Télécharger le fichier
  const handleDownloadFile = () => {
    if (!proforma?.fichier) return;

    const fileName = proforma.fichier.split('/').pop() || `proforma_${id}.pdf`;
    downloadFile(proforma.fichier, fileName);
  };

  // Gérer le fichier sélectionné
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Uploader le fichier
  const handleFileUpload = async () => {
    if (!id || !selectedFile) return;

    await uploadFile(parseInt(id), selectedFile);
    setSelectedFile(null);

    // Réinitialiser l'input file
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Exporter en PDF
  const handleExportPdf = async () => {
    if (!id) return;

    await exportToPdf(parseInt(id));
  };

  return {
    id,
    proforma,
    isLoading,
    error,
    isSaving,
    isUploading,
    isExporting,
    isEditing,
    setIsEditing,
    editedData,
    selectedFile,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    selectedStatus,
    setSelectedStatus,
    handleBackToList,
    handleInputChange,
    handleSaveChanges,
    handleCancelEdit,
    handleDelete,
    handleValidate,
    handleStatusChange,
    handleDownloadFile,
    handleFileChange,
    handleFileUpload,
    handleExportPdf,
    fetchProforma,
    navigate
  };
};