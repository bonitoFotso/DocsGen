import { DocumentStatus } from "./interfaces";

// Types de base
export interface Entity {
    id: number;
    code: string;
    name: string;
  }
  
  export interface Client {
    id: number;
    nom: string;
    email?: string;
    telephone?: string;
    adresse?: string;
  }
  
  export interface Site {
    id: number;
    nom: string;
    client_nom: string;
    clientId: number;
    localisation?: string;
  }
  
  export interface Product {
    id: number;
    code: string;
    name: string;
    category_name: string;
    categoryId: number;
  }
  
  export interface Offre {
    id: number;
    reference: string;
    client_nom: string;
    entity_code: string;
    statut: string;
    date_creation: string;
    sites: Site[];
    produit: Product[];
  }
  
  export interface Rapport {
    id: number;
    reference: string;
    site: Site;
    produit: Product;
    statut: string;
    date_creation: string;
    affaire: {
      id: number;
      reference: string;
      client_nom: string;
      offre_reference: string;
      statut: DocumentStatus;
      date_debut: string;
      date_fin_prevue?: string;
    };
  }
  
  export interface Participant {
    id: number;
    nom: string;
    prenom: string;
    email?: string;
    formation_titre: string;
  }
  
  export interface Formation {
    id: number;
    titre: string;
    description?: string;
    date_debut: string;
    date_fin: string;
    client_nom: string;
    affaire_reference: string;
  }
  
  export interface Facture {
    id: number;
    reference: string;
    client_nom: string;
    affaire_reference: string;
    statut: string;
    date_creation: string;
  }
  
  export interface Attestation {
    id: number;
    reference: string;
    participant_nom: string;
    formation_titre: string;
    date_creation: string;
  }
  
  // Interface principale pour les détails d'une affaire
  export interface AffaireDetails {
    id: number;
    reference: string;
    client: Client;
    entity: Entity;
    offre: Offre;
    statut: 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
    date_debut: string;
    date_fin_prevue?: string;
    date_creation: string;
    rapports: Rapport[];
    formations: Array<{
      formation: Formation;
      participants: Participant[];
      attestations: Attestation[];
    }>;
    facture?: Facture;
    statistiques: {
      nombre_rapports: number;
      nombre_formations: number;
      nombre_total_participants: number;
      nombre_attestations: number;
    };
  }

  export interface User {
    _id: string;
    username: string;
    email: string;
    departement: string;
    avatar?:string;
  }

  export interface LoginCredentials {
    email	: string;
    password: string;
  }
  
  export interface LoginResponse {
    message: string;
    success: boolean;
    token: string;
    user: User;
  }