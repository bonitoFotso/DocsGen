/**
 * Interface de base pour une opportunité
 */
export interface Opportunite {
  id: number;
  reference: string;
  client: number;
  client_nom: string;
  contact: number;
  contact_nom: string;
  entity: number;
  entity_code: string;
  produit_principal: number;
  produit_principal_nom: string;
  statut: OpportuniteStatut;
  statut_display: string;
  montant: number;
  montant_estime: number;
  probabilite: number;
  valeur_ponderee: number;
  date_creation: string;
  date_modification: string;
  date_cloture: string | null;
  relance: string | null;
  created_by: number;
  created_by_nom: string;
  necessite_relance: boolean;
}

/**
 * Interface détaillée pour une opportunité avec toutes les relations
 */
export interface OpportuniteDetail extends Omit<Opportunite, 'client' | 'contact' | 'entity' | 'produit_principal'> {
  description: string | null;
  besoins_client: string | null;
  sequence_number: number;
  produits: Produit[];
  date_detection: string;
  client: Client;
  contact: Contact;
  entity: Entity;
  produit_principal: Produit;
  commentaire: string | null;
  responsable: {
    id: number;
    username: string;
    email: string | undefined;
  };
}

/**
 * Type pour les statuts d'opportunité
 */
export type OpportuniteStatut = 
  'PROSPECT' | 
  'QUALIFICATION' | 
  'PROPOSITION' | 
  'NEGOCIATION' | 
  'GAGNEE' | 
  'PERDUE';

/**
 * Type pour les périodes de filtre
 */
export type OpportunitePeriode = 
  'today' | 
  'this_week' | 
  'this_month' | 
  'this_quarter' | 
  'this_year';

/**
 * Type pour les statuts de relance
 */
export type RelanceStatus = 
  'required' | 
  'upcoming' | 
  'none';

/**
 * Interface pour la création d'une opportunité
 */
export interface CreateOpportuniteDto {
  client: number;
  contact: number;
  entity: number;
  produit_principal: number;
  produits: number[];
  montant: number;
  montant_estime: number;
  description?: string;
  besoins_client?: string;
  relance?: string;
  statut?: OpportuniteStatut;
}

/**
 * Interface pour la mise à jour d'une opportunité
 */
export interface UpdateOpportuniteDto {
  montant?: number;
  montant_estime?: number;
  probabilite?: number;
  description?: string;
  besoins_client?: string;
  relance?: string;
  contact?: number;
  produit_principal?: number;
  produits?: number[];
}

/**
 * Interface pour le filtrage des opportunités
 */
export interface OpportuniteFilter {
  statut?: OpportuniteStatut[];
  clientNom?: string;
  entityId?: number;
  entityCode?: string;
  montantMin?: number;
  montantMax?: number;
  probabiliteMin?: number;
  probabiliteMax?: number;
  dateCreationAfter?: Date;
  dateCreationBefore?: Date;
  createdBy?: number;
  relanceStatus?: RelanceStatus;
  produitId?: number;
  produitPrincipalId?: number;
  hasOffre?: boolean;
  isActive?: boolean;
  periode?: OpportunitePeriode;
  
  // Pagination et tri
  page?: number;
  pageSize?: number;
  ordering?: string;
}

export interface Totaux {
  total_opportunities: number;
  total_montant: number;
  total_montant_estime: number;
  opportunites_gagnees: number;
  opportunites_perdues: number;
  opportunites_en_cours: number;
  relances_necessaires: number;
}

/**
 * Interface pour les statistiques d'opportunité
 */
export interface OpportuniteStatistics {
  par_statut: StatutStat[];
  totaux: Totaux;
}

/**
 * Interface pour les statistiques par statut
 */
export interface StatutStat {
  statut: OpportuniteStatut;
  count: number;
  montant_total: number;
  montant_estime_total: number;
}

/**
 * Interface pour le résultat d'une transition d'état
 */
export interface OpportuniteTransitionResult {
  success: boolean;
  message: string;
  statut?: OpportuniteStatut;
}

/**
 * Interface pour le résultat d'une transition groupée
 */
export interface BatchTransitionResult {
  success: boolean;
  success_count: number;
  error_count: number;
  errors: string[];
}

/**
 * Interfaces pour les entités liées
 */
export interface Client {
  id: number;
  nom: string;
  c_num: string;
  email?: string;
  telephone?: string;
  ville_nom?: string;
  region_nom?: string;
  pays_nom?: string;
  secteur_activite?: string;
}

export interface Contact {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  fonction?: string;
  client: number;
  prenom?: string;
}

export interface Entity {
  id: number;
  code: string;
  nom: string;
  description?: string;
}

export interface Produit {
  name?: string;
  category_name: string;
  id: number;
  code: string;
  nom: string;
  description?: string;
  categorie?: string;
  prix?: number;
}