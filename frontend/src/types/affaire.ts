// Types pour les affaires et structures associées

export interface IOffre {
  id: number;
  reference: string;
  date_creation: string;
  date_modification: string;
  statut: string;
  montant: string;
  relance: string | null;
  necessite_relance: boolean | null;
  client: IClient;
  contact: IContact;
  entity: IEntity;
  produit_principal: IProduit;
  produits: IProduit[];
  notes: string;
  sequence_number: number;
  fichier: string | null;
}

export interface Client {
  id: number;
  c_num: string;
  nom: string;
  email: string;
  ville_nom: string;
  region_nom: string;
  pays_nom: string;
  secteur_activite: string;
}

export interface IContact {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  client_id: number;
}

export interface IEntity {
  id: number;
  code: string;
  name: string;
}

export interface IProduit {
  id: number;
  code: string;
  category: string;
  name: string;
}

export interface IResponsable {
  id: number;
  username: string;
  email: string;
}

export interface IAffaire {
  id: number;
  reference: string;
  offre: IOffre;
  client_nom: string;
  date_debut: string;
  date_fin_prevue: string | null;
  date_fin_reelle: string | null;
  statut: string;
  statut_display: string;
  responsable: IResponsable | null;
  responsable_nom: string | null;
  montant_total: string;
  montant_facture: string;
  montant_paye: string;
  progression: number;
  en_retard: boolean;
  date_creation: string;
  date_modification: string;
  notes: string;
  montant_restant_a_facturer: string;
  montant_restant_a_payer: string;
}

export interface IDashboardData {
  compteurs_statut: Array<{
    statut: string;
    count: number;
  }>;
  dernieres_affaires: IAffaire[];
  affaires_en_retard: IAffaire[];
  resume_financier: {
    montant_total: number;
    montant_facture: number;
    montant_paye: number;
    montant_restant_a_facturer: number;
    montant_restant_a_payer: number;
  };
}