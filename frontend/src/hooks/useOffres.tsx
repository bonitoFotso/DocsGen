import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/AppHooks';
import { CategoryBase, ClientBase, EntityBase, OffreBase, OffreDetail, OffreEdit, ProductBase, SiteDetail } from '@/interfaces';
import { categoryService } from '@/services';

export const useOffres = () => {
  const { offreService, clientService, productService, siteService, entityService } = useServices();
  const [offres, setOffres] = useState<OffreBase[]>([]);
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
    produit: [],
    sites: [],
    statut: 'BROUILLON',
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
        await offreService.update(currentOffre.id, { ...formData, doc_type: 'OFF' });
      } else {
        await offreService.create({ ...formData, doc_type: 'OFF' });
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

  const handleEdit = async (offre: OffreBase) => {
    setIsLoading(true);
    try {
      const detailedOffre = await offreService.getById(offre.id);
      setCurrentOffre(detailedOffre);
      setFormData({
        client: detailedOffre.client.id,
        entity: detailedOffre.entity.id,
        produit: detailedOffre.produit.map((p) => p.id),
        sites: detailedOffre.sites.map((s) => s.id),
        statut: detailedOffre.statut,
        doc_type: detailedOffre.doc_type,
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
      produit: [],
      sites: [],
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