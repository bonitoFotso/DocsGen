// useOpportuniteEdit.ts
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useServices } from '@/AppHooks';
import { Client } from '@/types/client';
import { Contact, Opportunite, OpportuniteEdition } from '@/types/contact';
import { Entity, Product } from '@/affaireType';

export const useOpportuniteEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportuniteService, clientService, productService, contactService, entityService } = useServices();
  
  // État pour l'opportunité complète
  const [opportunite, setOpportunite] = useState<Opportunite | null>(null);
  
  // État pour les données du formulaire
  const [formData, setFormData] = useState<OpportuniteEdition>({
    produits: [],
    produit_principal: 0,
    client: 0,
    contact: 0,
    montant_estime: 0,
    description: '',
    besoins_client: '',
    entity: 0,
  });
  
  // États pour les données de référence
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  
  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // État pour les erreurs de formulaire
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // État pour le dialogue de confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: '',
    confirmAction: () => {}
  });

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les données de référence
        const [clientsData, contactsData, productsData, entitiesData, opportuniteData] = await Promise.all([
          clientService.getAll(),
          contactService.getAll(),
          productService.getAll(),
          entityService.getAll(),
          opportuniteService.getById(Number(id))
        ]);
        
        setClients(clientsData);
        setContacts(contactsData);
        setProducts(productsData);
        setEntities(entitiesData);
        
        setOpportunite(opportuniteData);
        
        // Initialiser le formulaire avec les données de l'opportunité
        setFormData({
          produits: opportuniteData.produits,
          produit_principal: opportuniteData.produit_principal,
          client: opportuniteData.client,
          contact: opportuniteData.contact,
          montant_estime: opportuniteData.montant_estime,
          description: opportuniteData.description || '',
          besoins_client: opportuniteData.besoins_client || '',
          entity: opportuniteData.entity,
        });
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast("Erreur", {
          description: error instanceof Error ? error.message : 'Erreur lors du chargement des données',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, clientService, contactService, entityService, opportuniteService, productService]);
  
  // Filtrer les contacts par client sélectionné
  useEffect(() => {
    if (formData.client) {
      const clientContacts = contacts.filter(contact => Number(contact.client_id) === formData.client);
      setAvailableContacts(clientContacts);
      
      // Réinitialiser le contact si le client change et que le contact actuel n'appartient pas au nouveau client
      if (formData.contact && !clientContacts.some(c => c.id === formData.contact)) {
        setFormData(prev => ({ ...prev, contact: 0 }));
      }
    } else {
      setAvailableContacts([]);
    }
  }, [formData.client, contacts, formData.contact]);
  
  // Gérer les changements dans le formulaire pour les champs texte et nombre
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (e.target.type === 'number') {
      processedValue = (parseFloat(value) || 0).toString();
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gérer les changements dans les sélecteurs
  const handleSelectChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gérer la sélection multiple de produits
  const handleProductsChange = (productId: number) => {
    setFormData(prev => {
      // Vérifier si le produit est déjà sélectionné
      const isSelected = prev.produits.includes(productId);
      
      // Si sélectionné, le retirer, sinon l'ajouter
      const updatedProduits = isSelected
        ? prev.produits.filter(id => id !== productId)
        : [...prev.produits, productId];
      
      return { ...prev, produits: updatedProduits };
    });
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors.produits) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.produits;
        return newErrors;
      });
    }
  };
  
  
  
  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.entity) newErrors.entity = 'Veuillez sélectionner une entité';
    if (!formData.client) newErrors.client = 'Veuillez sélectionner un client';
    if (!formData.contact) newErrors.contact = 'Veuillez sélectionner un contact';
    if (!formData.produit_principal) newErrors.produit_principal = 'Veuillez sélectionner un produit principal';
    if (formData.produits.length === 0) newErrors.produits = 'Veuillez sélectionner au moins un produit';
    if (formData.montant_estime <= 0) newErrors.montant_estime = 'Le montant estimé doit être supérieur à 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const updatedOpportunite = await opportuniteService.update(Number(id), formData);
      setOpportunite(updatedOpportunite);
      
      toast("Succès", {
        description: "Opportunité mise à jour avec succès",
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'opportunité:', error);
      toast("Erreur", {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Fonction pour avancer l'opportunité dans le processus de vente
  const handleAdvanceStatus = (newStatus: string) => {
    if (!opportunite) return;
    
    const statusTransitionMap: Record<string, { action: string, title: string }> = {
      'PROSPECT': { action: 'qualifier', title: 'Qualifier' },
      'QUALIFICATION': { action: 'proposer', title: 'Proposer' },
      'PROPOSITION': { action: 'negocier', title: 'Négocier' },
      'NEGOCIATION': { action: 'gagner', title: 'Gagner' }
    };
    
    const transition = statusTransitionMap[opportunite.statut];
    if (!transition) return;
    
    setConfirmDialog({
      open: true,
      title: `${transition.title} cette opportunité ?`,
      message: `Souhaitez-vous faire passer cette opportunité au statut "${newStatus}" ?`,
      action: 'advance',
      confirmAction: async () => {
        try {
          setSubmitting(true);
          const updatedOpportunite = await opportuniteService.qualifier(Number(id));
          setOpportunite(updatedOpportunite);
          
          toast("Succès", {
            description: `Statut mis à jour avec succès`,
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut:', error);
          toast("Erreur", {
            description: error instanceof Error ? error.message : 'Une erreur est survenue',
          });
        } finally {
          setSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  // Fonction pour marquer l'opportunité comme perdue
  const handleMarkAsLost = () => {
    if (!opportunite) return;
    
    setConfirmDialog({
      open: true,
      title: "Marquer comme perdue ?",
      message: "Souhaitez-vous marquer cette opportunité comme perdue ? Cette action est irréversible.",
      action: 'lose',
      confirmAction: async () => {
        try {
          setSubmitting(true);
          const updatedOpportunite = await opportuniteService.perdre(Number(id));
          setOpportunite(updatedOpportunite);
          
          toast("Succès", {
            description: "Opportunité marquée comme perdue",
          });
        } catch (error) {
          console.error('Erreur lors du marquage comme perdue:', error);
          toast("Erreur", {
            description: error instanceof Error ? error.message : 'Une erreur est survenue',
          });
        } finally {
          setSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  // Fonction pour créer une offre à partir de l'opportunité
  const handleCreateOffer = () => {
    if (!opportunite) return;
    
    setConfirmDialog({
      open: true,
      title: "Créer une offre ?",
      message: "Souhaitez-vous créer une offre à partir de cette opportunité ?",
      action: 'createOffer',
      confirmAction: async () => {
        try {
          setSubmitting(true);
          const newOffer = await opportuniteService.creerOffre(Number(id));
          
          toast("Succès", {
            description: `Offre créée avec succès`,
          });
          
          // Optionnel : rediriger vers la page de l'offre
          setTimeout(() => {
            navigate(`/offres/${newOffer.id}`);
          }, 1500);
        } catch (error) {
          console.error('Erreur lors de la création de l\'offre:', error);
          toast("Erreur", {
            description: error instanceof Error ? error.message : 'Une erreur est survenue',
          });
        } finally {
          setSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  const handleCancel = () => {
    navigate('/opportunites');
  };
  
  // Déterminer si l'opportunité est modifiable (statut différent de GAGNEE ou PERDUE)
  const isEditable = opportunite && !['GAGNEE', 'PERDUE'].includes(opportunite.statut);
  
  return {
    opportunite,
    formData,
    clients,
    contacts: availableContacts,
    products,
    entities,
    loading,
    submitting,
    errors,
    confirmDialog,
    isEditable,
    handleInputChange,
    handleSelectChange,
    handleProductsChange,
    handleSubmit,
    handleCancel,
    handleAdvanceStatus,
    handleMarkAsLost,
    handleCreateOffer,
      setConfirmDialog
    };
  };