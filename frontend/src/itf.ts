// types/common.ts
export interface Auditable {
    created_by: User | null;
    updated_by: User | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }
  
  // types/location.ts
  export interface Pays {
    id: number;
    nom: string;
    code_iso: string;
    nombre_de_regions?: number;
    regions?: Region[];
  }
  
  export interface Region {
    id: number;
    nom: string;
    pays: number;
    pays_details?: Pays;
    nombre_de_villes?: number;
    villes?: Ville[];
  }
  
  export interface Ville {
    id: number;
    nom: string;
    region: Region;
    region_details?: Region;
    nom_complet?: string;
  }
  
  // types/client.ts
  export interface Client extends Auditable {
    id: number;
    nom: string;
    email: string | null;
    telephone: string | null;
    adresse: string | null;
    c_num: string | null;
    ville: number | null;
    ville_details?: Ville;
    
    secteur_activite: string | null;
    address: string | null;
    bp: string | null;
    quartier: string | null;
    matricule: string | null;
    agreer: boolean;
    agreement_fournisseur: boolean;
    entite: string | null;
    
    contacts?: Contact[];
    sites?: Site[];
  }
  
  // Liste simplifiée pour les aperçus
  export interface ClientList {
    id: number;
    c_num: string | null;
    nom: string;
    email: string | null;
    telephone: string | null;
    ville_nom?: string;
    secteur_activite: string | null;
    agreer: boolean;
    agreement_fournisseur: boolean;
    contacts_count?: number;
  }
  
  // Pour création/édition
  export interface ClientEdit {
    nom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
    ville?: number;
    secteur_activite?: string;
    address?: string;
    bp?: string;
    quartier?: string;
    matricule?: string;
    agreer?: boolean;
    agreement_fournisseur?: boolean;
    entite?: string;
  }
  
  // types/site.ts
  export interface Site extends Auditable {
    id: number;
    nom: string;
    client: number;
    client_details?: Client;
    localisation: string | null;
    description: string | null;
    s_num: string | null;
    ville: number | null;
    ville_details?: Ville;
  }
  
  export interface SiteList {
    id: number;
    s_num: string | null;
    nom: string;
    client_nom: string;
    ville_nom: string | null;
    localisation: string | null;
  }
  
  export interface SiteEdit {
    nom: string;
    client: number;
    localisation?: string;
    description?: string;
    ville?: number;
  }
  
  // types/contact.ts
  export interface Contact {
    id: number;
    nom: string;
    prenom: string | null;
    email: string | null;
    telephone: string | null;
    mobile: string | null;
    poste: string | null;
    service: string | null;
    role_achat: string | null;
    date_envoi: string | null;
    relance: boolean;
    
    client: number | null;
    client_details?: Client;
    
    adresse: string | null;
    ville: number | null;
    ville_details?: Ville;
    quartier: string | null;
    bp: string | null;
    notes: string | null;
    entreprise: string | null;
    ville_nom: string | null;
    region: string | null;
    secteur: string | null;
    status: string | null;
    agrement: string | null;
    categorie: string | null;
    
    created_at: string;
    updated_at: string;
  }
  
  export interface ContactList {
    id: number;
    nom: string;
    prenom: string | null;
    email: string | null;
    telephone: string | null;
    client_nom: string;
    poste: string | null;
  }

  export interface ContactEdit {
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    mobile?: string;
    poste?: string;
    service?: string;
    role_achat?: string;
    date_envoi?: string;
    relance?: boolean;
    client?: number;
    adresse?: string;
    ville?: number;
    quartier?: string;
    bp?: string;
    notes?: string;
    site?: number;
  }
  export interface ContactBase {
    nom: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    mobile?: string;
    poste?: string;
    service?: string;
    role_achat?: string;
    date_envoi?: string;
    relance?: boolean;
    client?: number;
    adresse?: string;
    ville?: number;
    quartier?: string;
    bp?: string;
    notes?: string;
  }

export interface MailEdit {
  email?: string;
  client?: number;
}