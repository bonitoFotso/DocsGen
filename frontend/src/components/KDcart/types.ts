export interface Produit {
  id: number;
  code: string;
  category: string;
  name: string;
}

export interface Client {
  id: number;
  c_num: string;
  nom: string;
  email: string;
  telephone: string;
  ville_nom: string;
  region_nom: string;
  pays_nom: string;
  secteur_activite: string;
}

export interface Contact {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  client_id: number;
}

export interface Entity {
  id: number;
  code: string;
  name: string;
}

export interface Offer {
  id: number;
  reference: string;
  date_creation: string;
  date_modification: string;
  statut: string;
  montant: string;
  relance: null | string;
  necessite_relance: null | boolean;
  client: Client;
  contact: Contact;
  entity: Entity;
  produit_principal: Produit;
  produits: Produit[];
  notes: string;
  sequence_number: number;
  fichier: string | null;
}

export interface StatsConfig {
  cards: CardConfig[];
  colorScheme?: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    danger: string;
  };
}

export interface CardConfig {
  id: string;
  title: string;
  type: "amount" | "count" | "percentage" | "distribution";
  dataKey?: string;
  filter?: (item: Offer) => boolean;
  calculation?: (data: Offer[]) => number | { [key: string]: number };
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  tooltipText?: string;
  trend?: {
    type: "up" | "down";
    value: number;
    period: string;
  };
}
