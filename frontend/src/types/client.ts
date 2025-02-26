import { Affaire, Contact, Facture, Offre, OffreCommerciale, Opportunite, Rapport, Site, Ville } from "./contact";

export interface Client {
    id: number;
    c_num: string;
    nom: string;
    email: string;
    telephone: string;
    ville_nom: string;
    region_nom: string;
    secteur_activite: string;
    agreer: boolean;
    agreement_fournisseur: boolean;
    contacts_count: number;
    offres_count: number;
    affaires_count: number;
    factures_count: number;
    is_client: string;
    bp: string;
    quartier: string;
    matricule: string;
    entite: string;
}


export interface ClientDetails extends Client {
    contacts: Contact[];
    offres: OffreCommerciale[];
    factures: Facture[];
    sites: Site[];
    affaires: Affaire[];
    rapports: Rapport[];
    ville: Ville;
    opportunites:Opportunite[];
}