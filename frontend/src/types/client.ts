import { Affaire, Contact, Facture, OffreCommerciale, Opportunite, Rapport, Site, Ville } from "./contact";
import { Courrier } from "./courrier";

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
    opportunities_count: number;
    courriers_count: number;
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
    courriers:Courrier[];
}