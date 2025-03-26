export const DOC_TYPES = {
  LTR: 'Lettre',
  DCE: 'Demande de Certificat',
  ODV: 'Ordre de Virement',
  CDV: 'Courrier de Virement',
  BCM: 'Bon de Commande',
  DAO: 'Demande d\'Approvisionnement',
  ADV: 'Avis de Mission',
  RPT: 'Rapport',
  FCT: 'Facture',
  DVS: 'Devis',
  BDC: 'Bon de Commande',
  CND: 'Conduite à Tenir',
  RCL: 'Recouvrement',
  RCV: 'Reçu',
  RGL: 'Règlement'
};

export interface Courrier {
  id: number;
  reference: string;
  entite?: {
    id: number;
    nom: string;
    code: string;
  };
  entite_id?: number;
  entite_nom?: string;
  client?: {
    id: number;
    nom: string;
    c_num: string;
  };
  client_id?: number;
  client_nom?: string;
  doc_type: string;
  doc_type_display?: string;
  direction: 'IN' | 'OUT';
  direction_display?: string;
  statut: string;
  statut_display?: string;
  date_creation: string;
  date_envoi?: string;
  date_reception?: string;
  objet: string;
  notes?: string;
  fichier?: string;
  est_urgent: boolean;
  created_by?: number;
  created_by_name?: string;
  updated_by_name?: string;
  handled_by?: number;
  is_overdue?: boolean;
}

export interface CourrierHistory {
  id: number;
  courrier: number;
  courrier_reference: string;
  action: string;
  action_display: string;
  date_action: string;
  user: number;
  user_name: string;
  details?: string;
}

export interface CourrierStats {
  total: number;
  entrants: number;
  sortants: number;
  par_statut: Record<string, number>;
  par_type: Record<string, number>;
  en_retard: number;
}

export interface CourrierFilter {
  [x: string]: any;
  search?: string;
  entite?: number;
  client?: number;
  doc_type?: string;
  direction?: 'IN' | 'OUT';
  statut?: string;
  est_urgent?: boolean;
  date_envoi?: string;
  date_creation?: string;
  date_reception?: string;
  created_by?: number;
  handled_by?: number;
}