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
    client_id: string;
}

  export interface Client {
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
  

export interface Offre {
    id: number;
    contact_id: number;
    date: string;
    montant: number;
    status: string;
    reference: string;
}

export interface Facture {
    id: number;
    contact_id: number;
    date: string;
    montant: number;
    numero: string;
    status: string;
}

export interface Site {
    id: number;
    contact_id: number;
    nom: string;
    adresse: string;
    code_postal: string;
    ville: string;
}

export interface Affaire {
    id: number;
    contact_id: number;
    titre: string;
    date_debut: string;
    date_fin: string;
    statut: string;
}

export interface Rapport {
    id: number;
    contact_id: number;
    date: string;
    contenu: string;
    type: string;
}


export interface Ville {
    id: number;
    nom: string;
    region_nom: string;
    pays_nom: string;
}

export interface Region {
    id: number;
    nom: string;
    pays_nom: string;
    nombre_de_villes: number;
}

export interface OpportuniteStatus {
    PROSPECT: 'PROSPECT';
    QUALIFICATION: 'QUALIFICATION';
    PROPOSITION: 'PROPOSITION';
    NEGOCIATION: 'NEGOCIATION';
    GAGNEE: 'GAGNEE';
    PERDUE: 'PERDUE';
}

export interface Opportunite {
    id: number;
    reference: string;
    produits: number[];
    produit_principal: number;
    client_id: number;
    contact_id: number;
    date_detection: string;
    date_modification: string;
    date_cloture: string | null;
    statut: keyof OpportuniteStatus;
    montant_estime: number;
    probabilite: number;
    description: string | null;
    besoins_client: string | null;
    relance: string | null;
    entity_id: number;
    created_by: number | null;
    sequence_number: number;
    client: number;
    contact: number;
    entity: number;
}

export interface OpportuniteListItem {
    id: number;
    reference: string;
    client_nom: string;
    statut: keyof OpportuniteStatus;
    montant_estime: number;
    probabilite: number;
    date_detection: string;
    date_modification: string;
}

export interface OpportuniteEdition {
    produits: number[];
    produit_principal: number;
    client: number;
    contact: number;
    montant_estime: number;
    description: string | null;
    besoins_client: string | null;
    entity: number;
}

export interface OffreCommerciale {
    id: number;
    reference: string;
    client_nom: string;
    entity_code: string;
    statut: string;
    date_creation: string;
    montant?: number;
    validite_date?:string;
    produits_count?:number;
}