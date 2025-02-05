import { Entity, User } from "./affaireType";
import { Client } from "./itf";

// Définir l'énumération pour les types de documents
export enum DocType {
    LTR = 'LTR',
    DCE = 'DCE',
    ODV = 'ODV',
    CDV = 'CDV',
    BCM = 'BCM',
    DAO = 'DAO',
    ADV = 'ADV',
    RPT = 'RPT',
    FCT = 'FCT',
    DVS = 'DVS',
    BDC = 'BDC',
    CND = 'CND',
    RCL = 'RCL',
    RCV = 'RCV',
    RGL = 'RGL'
}



// Interface principale pour Courrier
export interface Courrier {
    id?: number; // Optionnel, si vous avez besoin d'un identifiant unique
    reference: string;
    entite: Entity;
    doc_type: DocType;
    client: Client;
    date_creation: Date;
    created_by?: User; // Optionnel, peut être null
    notes?: string; // Optionnel
    fichier?: string; // Chemin du fichier, optionnel
}

