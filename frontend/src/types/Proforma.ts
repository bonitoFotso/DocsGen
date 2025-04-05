import { OffreDetail } from "./offre";

export interface Proforma {
  id: number;
  reference: string;
  offre: OffreDetail;
  client_nom: string;
  entity_code: string;
  statut: string;
  date_creation: string;
  date_validation: string | null;
  date_expiration: string | null;
  montant_ht: string;
  taux_tva: string;
  montant_tva: string;
  montant_ttc: string;
  notes: string | null;
  fichier: string | null;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  sequence_number: number;
}