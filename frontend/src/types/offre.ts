export interface OffreNotification {
    type: 'RELANCE_REQUISE';
    offre_id: number;
    reference: string;
    client: string;
    date_relance: string;
    montant: string;
    statut: string;
  }