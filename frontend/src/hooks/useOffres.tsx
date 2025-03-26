import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/AppHooks';
import { CategoryBase, ClientBase, EntityBase, OffreBase, OffreEdit, ProductBase, SiteDetail } from '@/interfaces';
import { categoryService } from '@/services';
import { OffreDetail } from '@/types/offre';
import { OffreFormData } from '@/views/offres/types';

export const useOffres = () => {
  const { offreService, clientService, productService, siteService, entityService } = useServices();
  const [offres, setOffres] = useState<OffreDetail[]>([]);
  const [clients, setClients] = useState<ClientBase[]>([]);
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [categories, setCategories] = useState<CategoryBase[]>([]);
  const [sites, setSites] = useState<SiteDetail[]>([]);
  const [entities, setEntities] = useState<EntityBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOffre, setCurrentOffre] = useState<OffreDetail | null>(null);
  const [selectedOffre, setSelectedOffre] = useState<OffreDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<OffreEdit>({
    client: 0,
    entity: 0,
    doc_type: 'OFF',
    produit_principal: 0,
    produits: [],
    // sites: [],
    statut: 'BROUILLON',
    contact: 0, // Ajout du champ contact obligatoire
  });

  const loadData = useCallback(async () => {
    console.log('Loading data');
    setIsLoading(true);
    try {
      const [offresData, clientsData, productsData, sitesData, entitiesData, categoriesData] = await Promise.all([
        offreService.getAll(),
        clientService.getAll(),
        productService.getAll(),
        siteService.getAll(),
        entityService.getAll(),
        categoryService.getAll(),
      ]);
      setOffres(offresData);
      setClients(clientsData);
      setProducts(productsData);
      setSites(sitesData);
      setEntities(entitiesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [offreService, clientService, productService, siteService, entityService]);

    useEffect(() => {
      loadData();
    }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Submitting form', formData);
    try {
      if (currentOffre) {
        const updateData: Partial<OffreFormData> = {
          client: formData.client,
          entity: formData.entity,
          doc_type: formData.doc_type,
          produit_principal: formData.produit_principal,
          produits: formData.produits,
          statut: formData.statut as "BROUILLON" | "ENVOYE" | "GAGNE" | "PERDU",
          contact: formData.contact,
        };
        await offreService.update(currentOffre.id, updateData);
      } else {
        const createData: OffreFormData = {
          ...formData,
          reference: '',
          notes: '',
          montant: 0,
          produit_principal: formData.produit_principal || null,
        };
        await offreService.create(createData);
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

  const handleViewDetails = async (offre: OffreBase) => {
    setIsLoading(true);
    try {
      const details = await offreService.getById(offre.id);
      setSelectedOffre(details);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des détails');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (offre: OffreDetail) => {
    setIsLoading(true);
    try {
      const detailedOffre = await offreService.getById(offre.id);
      setCurrentOffre(detailedOffre);
      setFormData({
        client: detailedOffre.client.id,
        entity: detailedOffre.entity.id,
        produit_principal: detailedOffre.produit_principal.id,
        produits: detailedOffre.produits.map((p) => p.id),
        // sites: detailedOffre.sites.map((s) => s.id),
        statut: detailedOffre.statut as "BROUILLON" | "ENVOYE" | "GAGNE" | "PERDU",
        doc_type: detailedOffre.doc_type,
        contact: detailedOffre.contact?.id || 0, // Correction: suppression des crochets pour éviter l'erreur de type
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement de l'offre");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await offreService.delete(id);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentOffre(null);
    setFormData({
      client: 0,
      entity: 0,
      produit_principal: 0,
      contact: 0,
      produits: [],
      // sites: [],
      statut: 'BROUILLON',
      doc_type: 'OFF',
    });
    setError(null);
  };

  const handleNewOffre = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredOffres = offres.filter((offre) =>
    offre.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    offres: filteredOffres,
    isLoading,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    selectedOffre,
    setSelectedOffre,
    handleViewDetails,
    handleEdit,
    handleDelete,
    isDeleting,
    isModalOpen,
    setIsModalOpen,
    handleNewOffre,
    handleSubmit,
    formData,
    setFormData,
    currentOffre,
    clients,
    products,
    categories,
    sites,
    entities,
  };
};