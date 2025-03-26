import React, { useState, useEffect } from 'react';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { useServices } from '@/AppHooks';

// Import custom components
import OffreInfoSection from './OffreInfoSection';
import OffreProductsSection from './OffreProductsSection';
import OffreSidebar from './OffreSidebar';
import ProduitSelector from './ProduitSelector';
import ClientSelector from './ClientSelector';

// Import types
import {
  Client,
  Entity,
  OffreFormData,
  OfreTotals
} from './types';
import { Produit } from '@/types/offre';
import { Contact } from '@/types/contact';
import { toast } from 'sonner';

const OffreForm: React.FC = () => {
  // States for the form
  const [formData, setFormData] = useState<OffreFormData>({
    reference: '',
    statut: 'BROUILLON',
    client: null,
    contact: null,
    entity: null,
    produits: [],
    produit_principal: null,
    notes: '',
    montant: 0,
  });

  // Auxiliary states
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isClientDialogOpen, setIsClientDialogOpen] = useState<boolean>(false);
  const [isProduitDialogOpen, setIsProduitDialogOpen] = useState<boolean>(false);

  // Data lists states
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);

  // Totals state
  const [totals, setTotals] = useState<OfreTotals>({
    montantHT: 0,
    montantTVA: 0,
    montantTTC: 0
  });

  const { offreService } = useServices();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const onBack = (): void => {
    if (id) {
      navigate(`/offres/${id}`);
    } else {
      navigate('/offres');
    }
  };

  // Selected items
  const selectedClient = clients.find(client => client.id === formData.client);
  const selectedContact = contacts.find(contact => contact.id === formData.contact);
  const selectedEntity = entities.find(entity => entity.id === formData.entity);

  useEffect(() => {
    const fetchInitData = async (): Promise<void> => {
      setLoading(true);
      try {
        const initData = await offreService.getInitData();
        setClients(initData.clients);
        setContacts(initData.contacts);
        setEntities(initData.entities);
        setProduits(initData.produits);

        // If editing, fetch the offer data
        if (id) {
          // This would be implemented if needed
          const offreData = await offreService.getById(Number(id));
          // convertion de OffreDetail en OffreFormData
          const offreFormData: OffreFormData = {
            reference: offreData.reference,
            statut: offreData.statut,
            client: offreData.client.id || null,
            contact: offreData.contact?.id || null,
            entity: offreData.entity.id || null,
            produits: offreData.produits,
            produit_principal: offreData.produit_principal?.id || null,

            notes: offreData.notes,
            montant: offreData.montant,
          };
          setFormData(offreFormData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitData();
  }, [offreService, id]);

  // Calculate totals when products change
  useEffect(() => {
    const montantHT = formData.produits.reduce((total, produit) => {
      const price = produit.prix;
      return total + (price);
    }, 0);

    const tva = montantHT * 0; // 19.5% VAT
    const montantTTC = montantHT + tva;

    setTotals({
      montantHT,
      montantTVA: tva,
      montantTTC
    });
  }, [formData.produits]);
  // Handler for simple field changes
  const handleChange = (field: string, value: unknown): void => {
    console.log(field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error if present
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handler for client change
  const handleClientChange = (clientId: number): void => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client: clientId,
        contact: null // Reset contact
      }));
      setIsClientDialogOpen(false);
    }
  };


  // Handler for contact change
  const handleContactChange = (contactId: number): void => {
    console.log(contactId);
    setFormData(prev => ({
      ...prev,
      contact: contactId
    }));
  };

  // Handler for product selection
  const handleProductSelect = (product: Produit): void => {

    // Check if product is already in the list
    const existingIndex = formData.produits.findIndex(p => p.id === product.id);

    if (existingIndex >= 0) {
      // Remove product if already in the list
      setFormData(prev => ({
        ...prev,
        produits: prev.produits.filter(p => p.id !== product.id)
      }));
    } else {
      // Add product with default quantity
      const newProduct = {
        ...product,
        quantite: 1,
        remise: 0,
      };

      setFormData(prev => ({
        ...prev,
        produits: [...prev.produits, newProduct]
      }));
    }
    console.log(formData.produits);
  };

  // Handler to remove a product
  const handleRemoveProduct = (productId: number): void => {
    setFormData(prev => ({
      ...prev,
      produits: prev.produits.filter(p => p.id !== productId)
    }));
  };




  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client) {
      newErrors.client = 'Veuillez sélectionner un client';
    }

    if (!formData.entity) {
      newErrors.entity = 'Veuillez sélectionner une entité';
    }

    if (!formData.produit_principal) {
      newErrors.produit_principal = 'Veuillez sélectionner un produit_principal';
    }

    if (formData.produits.length === 0) {
      console.log(formData.produits);
      newErrors.produits = 'Veuillez ajouter au moins un produit';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event?: React.FormEvent): Promise<void> => {
    // Empêcher le comportement par défaut si un événement est fourni
    if (event) {
      event.preventDefault();
    }

    // Valider le formulaire avant de continuer
    if (!validateForm()) {
      console.log(errors);
      toast("Erreur de validation", {
        description: `Veuillez corriger les erreurs dans le formulaire avant de continuer`,
      });
      return;
    }

    // Activer l'indicateur de chargement
    setSaving(true);

    try {
      // Préparer les données à envoyer
      const offreData = {
        ...formData,
        // Convertir l'objet produit en ID de produit principal
        produit_principal: formData.produit_principal || null,
      };

      // Créer ou mettre à jour selon la présence d'un ID
      if (id) {
        // Mise à jour d'une offre existante
        const updatedOffre = await offreService.update(Number(id), offreData);
        toast("Offre mise à jour", {
          description: `L'offre ${updatedOffre.reference || `#${updatedOffre.id}`} a été mise à jour avec succès.`,
        });
      } else {
        // Création d'une nouvelle offre
        console.log(offreData);
        const newOffre = await offreService.create(offreData);
        toast("Offre créée", {
          description: `L'offre ${newOffre.reference || `#${newOffre.id}`} a été créée avec succès.`,
        });
      }

      // Naviguer en arrière après le succès
      onBack();
    } catch (error: Error | unknown) {
      // Gestion des erreurs avec un message approprié
      console.error('Erreur lors de la sauvegarde:', error);

      // Afficher un message d'erreur selon le type d'erreur
      toast("Échec de l'opération", {
        description: error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de la sauvegarde de l'offre.",
      });
    } finally {
      // Désactiver l'indicateur de chargement, peu importe le résultat
      setSaving(false);
    }
  };

  // Format amount helper
  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Get initials for avatar
  const getInitials = (name: string): string => {
    if (!name) return "?";
    const nameArray = name.split(' ');
    if (nameArray.length >= 2) {
      return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Chargement...</h1>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">{id ? 'Modifier l\'offre' : 'Nouvelle offre'}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            Annuler
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {/* Main section */}
          <div className="col-span-2 space-y-6">
            {/* General information */}
            <OffreInfoSection
              formData={formData}
              handleChange={handleChange}
              setIsClientDialogOpen={setIsClientDialogOpen}
              handleContactChange={handleContactChange}
              selectedClient={selectedClient}
              errors={errors}
              entities={entities}
              contacts={contacts}
              getInitials={getInitials}
            />

            {/* Products section */}
            <OffreProductsSection
              formData={formData}
              setIsProduitDialogOpen={setIsProduitDialogOpen}
              handleRemoveProduct={handleRemoveProduct}
              errors={errors}
              handleChange={handleChange}
            />
          </div>

          {/* Sidebar */}
          <OffreSidebar
            formData={formData}
            handleSubmit={handleSubmit}
            saving={saving}
            selectedClient={selectedClient}
            selectedContact={selectedContact}
            selectedEntity={selectedEntity}
            totals={totals}
            formatMontant={formatMontant}
          />
        </div>
      </form>

      {/* Client selection dialog */}
      <ClientSelector
        isOpen={isClientDialogOpen}
        setIsOpen={setIsClientDialogOpen}
        clients={clients}
        handleClientChange={handleClientChange}
        getInitials={getInitials}
      />

      {/* Product selection dialog */}
      <ProduitSelector
        isOpen={isProduitDialogOpen}
        setIsOpen={setIsProduitDialogOpen}
        produits={produits}
        formData={formData}
        handleProductSelect={handleProductSelect}
        formatMontant={formatMontant}
      />
    </div>
  );
};

export default OffreForm;