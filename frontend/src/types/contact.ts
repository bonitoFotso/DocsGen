export interface Contact {
    id: number;
    region: string;
    ville_nom: string;
    entreprise: string;
    secteur: string;
    categorie: string;
    prenom: string;
    nom: string;
    poste: string;
    service: string;
    role_achat: string;
    telephone: string;
    email: string;
    status: string;
    agrement: boolean;
}

export interface Offre {
    id: number;
    contact_id: number;
    date: string;
    montant: number;
    status: string;
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
    status: string;
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