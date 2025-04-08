import { Entity } from "@/affaireType";
import { Client } from "./client";
import { Contact } from "./contact";
import { AffaireBase, ProformaBase } from "@/interfaces";

export interface Produit {
  id: number;
  name: string;
  code: string;
  category: string;
  prix: number;
}

export interface OffreDetail {
  fichier: string | null;
  id: number;
  reference: string;
  statut: 'BROUILLON' | 'ENVOYE' | 'GAGNE' | 'PERDU';
  date_creation: string;
  date_modification: string;
  date_validation?: string;
  montant: number;
  client: Client;
  contact: Contact;
  entity: Entity;
  produits: Produit[];
  produit_principal: Produit;
  relance?: string;
  necessite_relance: boolean;
  sequence_number: number;
  proforma?: ProformaBase;
  affaire?: AffaireBase;
  notes: string;
  date_envoi: string |null;
  date_cloture: string |null;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

export interface OffreInitData {
  clients: Client[];
  contacts: Contact[];
  entities: Entity[];
  produits: Produit[];
}

