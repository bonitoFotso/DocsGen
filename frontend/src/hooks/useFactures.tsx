import { useState, useCallback, useEffect, useContext } from 'react';
import type { FactureDetail, FactureEdit } from '../types';
import ServicesContext from '@/AppProviders';

export const useFactures = () => {
  const services = useContext(ServicesContext);
  if (!services) {
    throw new Error('useFactures must be used within a ServicesProvider');
  }

  const { factureService, affaireService, clientService } = services;

  const [factures, setFactures] = useState<FactureDetail[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFacture, setCurrentFacture] = useState<FactureDetail | null>(null);
  const [selectedFacture, setSelectedFacture] = useState<FactureDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<FactureEdit>({
    affaire: 0,
    client: 0,
    statut: 'BROUILLON',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const facturesData = await factureService.getAll();
      setFactures(facturesData);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [factureService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentFacture) {
        await factureService.update(currentFacture.id, formData);
      } else {
        await factureService.create({ ...formData, doc_type: 'FACTURE' });
      }
      setIsModalOpen(false);
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (facture: FactureDetail) => {
    setIsLoading(true);
    try {
      const details = await factureService.getById(facture.id);
      if (details) {
        setSelectedFacture(details);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des détails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (facture: FactureDetail) => {
    setIsLoading(true);
    try {
      const detailedFacture = await factureService.getById(facture.id);
      if (detailedFacture) {
        setCurrentFacture(detailedFacture);
        setFormData({
          affaire: detailedFacture.affaire.id,
          client: detailedFacture.client.id,
          statut: detailedFacture.statut,
        });
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de la facture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await factureService.delete(id);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentFacture(null);
    setFormData({
      affaire: 0,
      client: 0,
      statut: 'BROUILLON',
    });
    setError(null);
  };

  const handleNewFacture = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredFactures = factures.filter((facture) =>
    facture.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facture.affaire.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    factures: filteredFactures,
    isLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    selectedFacture,
    setSelectedFacture,
    handleViewDetails,
    handleEdit,
    handleDelete,
    isDeleting,
    isModalOpen,
    setIsModalOpen,
    handleNewFacture,
    handleSubmit,
    formData,
    setFormData,
    currentFacture,
  };
};