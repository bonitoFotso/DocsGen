// useOpportunity.ts
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from "sonner";
import { useServices } from '@/AppHooks';
import { Client } from '@/types/client';
import { Contact, OpportuniteEdition } from '@/types/contact';
import { Entity, Product } from '@/affaireType';

export const useOpportunity = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get('client');
  
  // Services
  const { opportuniteService, clientService, productService, contactService, entityService } = useServices();
  
  // State
  const [formData, setFormData] = useState<OpportuniteEdition>({
    produits: [],
    produit_principal: 0,
    client: clientId ? parseInt(clientId) : 0,
    contact: 0,
    montant_estime: 0,
    description: '',
    besoins_client: '',
    entity: 0,
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsResponse = await clientService.getAll();
        setClients(clientsResponse);

        const entitiesResponse = await entityService.getAll();
        setEntities(entitiesResponse);
        
        const contactsResponse = await contactService.getAll();
        setContacts(contactsResponse);
        
        const productsResponse = await productService.getAll();
        setProducts(productsResponse);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast("Erreur", {
          description: "Impossible de charger les données nécessaires.",
        });
      }
    };
    
    fetchData();
  }, [clientService, contactService, entityService, productService]);
  
  // Filter contacts by selected client
  useEffect(() => {
    if (formData.client) {
      const clientContacts = contacts.filter(contact => Number(contact.client_id) === formData.client);
      setAvailableContacts(clientContacts);
      
      // Reset contact if client changes and current contact doesn't belong to new client
      if (formData.contact && !clientContacts.some(c => c.id === formData.contact)) {
        setFormData((prev: OpportuniteEdition) => ({ ...prev, contact: 0 }));
      }
    } else {
      setAvailableContacts([]);
    }
  }, [formData.client, contacts, formData.contact]);
  
  // Handle text and number input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (e.target.type === 'number') {
      processedValue = (parseFloat(value) || 0).toString();
    }
    
    setFormData((prev: OpportuniteEdition) => ({ ...prev, [name]: processedValue }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: number) => {
    setFormData((prev: OpportuniteEdition) => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle multiple product selection
  const handleProductsChange = (productId: number) => {
    setFormData((prev: OpportuniteEdition) => {
      // Check if product is already selected
      const isSelected = prev.produits.includes(productId);
      
      // If selected, remove it, otherwise add it
      const updatedProduits = isSelected
        ? prev.produits.filter(id => id !== productId)
        : [...prev.produits, productId];
      
      return { ...prev, produits: updatedProduits };
    });
    
    // Clear error for this field if it exists
    if (errors.produits) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.produits;
        return newErrors;
      });
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.entity) newErrors.entity = 'Veuillez sélectionner une entite';
    if (!formData.client) newErrors.client = 'Veuillez sélectionner un client';
    if (!formData.contact) newErrors.contact = 'Veuillez sélectionner un contact';
    if (!formData.produit_principal) newErrors.produit_principal = 'Veuillez sélectionner un produit principal';
    if (formData.produits.length === 0) newErrors.produits = 'Veuillez sélectionner au moins un produit';
    if (formData.montant_estime <= 0) newErrors.montant_estime = 'Le montant estimé doit être supérieur à 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await opportuniteService.create(formData);
      
      toast("Succès", {
        description: "Opportunité créée avec succès",
      });
      
      // Redirect to detail page after short delay
      setTimeout(() => {
        navigate(`/opportunites/${response.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'opportunité:', error);
      toast("Erreur", {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/opportunites');
  };
  
  return {
    formData,
    clients,
    contacts: availableContacts,
    products,
    entities,
    errors,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleProductsChange,
    handleSubmit,
    handleCancel,
  };
};