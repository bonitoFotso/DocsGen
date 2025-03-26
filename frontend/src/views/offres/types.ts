import { Contact } from "@/types/contact";
import { Produit } from "@/types/offre";

// General types
export interface Client {
    id: number;
    nom: string;
    c_num: string;
    email?: string;
    ville_nom?: string;
  }
  

  
  export interface Entity {
    id: number;
    code: string;
    name: string;
  }
  

  
  // Form data type
  export interface OffreFormData {
    reference: string;
    statut: 'BROUILLON' | 'ENVOYE' | 'GAGNE' | 'PERDU';
    client: number | null;
    contact: number | null;
    entity: number | null;
    produits: number[];
    produit_principal: number | null;
    notes: string;
    montant: number;
    doc_type: string;
  }
  
  // Totals type
  export interface OfreTotals {
    montantHT: number;
    montantTVA: number;
    montantTTC: number;
  }
  
  // Service type
  export interface OffreService {
    getInitData: () => Promise<{
      clients: Client[];
      contacts: Contact[];
      entities: Entity[];
      produits: Produit[];
    }>;
    create: (data: OffreFormData) => Promise<OffreFormData>;
    update: (id: number, data: OffreFormData) => Promise<OffreFormData>;
  }
  
  // Props types for components
  export interface OffreInfoSectionProps {
    formData: OffreFormData;
    handleChange: (field: string, value: string | number) => void;
    setIsClientDialogOpen: (isOpen: boolean) => void;
    handleContactChange: (contactId: number) => void;
    selectedClient: Client | undefined;
    errors: Record<string, string>;
    entities: Entity[];
    contacts: Contact[];
    getInitials: (name: string) => string;
  }
  
  export interface OffreProductsSectionProps {
    formData: OffreFormData;
    setIsProduitDialogOpen: (isOpen: boolean) => void;
    handleRemoveProduct: (productId: number) => void;
    handleProductQuantityChange: (productId: number, quantity: number) => void;
    handleProductDiscountChange: (productId: number, discount: number) => void;
    handleProduitSelect: (produitId: number) => void;
    errors: Record<string, string>;
    totals: OfreTotals;
    formatMontant: (montant: number) => string;
  }
  
  export interface OffreSidebarProps {
    formData: OffreFormData;
    handleSubmit: (event?: React.FormEvent) => Promise<void>;
    saving: boolean;
    selectedClient: Client | undefined;
    selectedContact: Contact | undefined;
    selectedEntity: Entity | undefined;
    totals: OfreTotals;
    formatMontant: (montant: number) => string;
  }
  
  export interface ClientSelectorProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    clients: Client[];
    handleClientChange: (clientId: number) => void;
    getInitials: (name: string) => string;
  }
  
  export interface ProduitSelectorProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    produits: Produit[];
    formData: OffreFormData;
    handleProductSelect: (product: Produit) => void;
    formatMontant: (montant: number) => string;
  }


  