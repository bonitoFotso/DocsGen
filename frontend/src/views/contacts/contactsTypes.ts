// types.ts
export interface ContactEdit {
    id?: number;
    nom?: string;
    prenom?: string;
    email?: string;
    telephone?: string;
    mobile?: string;
    poste?: string;
    client?: ClientBase;
    site?: SiteDetail;
    service?: string;
    role_achat?: string;
    date_envoi?: string;
    relance?: boolean;
    adresse?: string;
    quartier?: string;
    bp?: string;
    notes?: string;
  }
  
  export interface ClientBase {
    id: number;
    nom: string;
  }
  
  export interface SiteDetail {
    id: number;
    nom: string;
    client: {
      id: number;
    };
  }
  
  export interface ContactModalProps {
    title: string;
    initialData: ContactEdit;
    onClose: () => void;
    onSubmit: (data: ContactEdit) => void;
    isSubmitting?: boolean;
  }

  export interface Site {
    id: number;
    s_num: string;
    nom: string;
    client: {
      id: number;
      c_num: string;
      nom: string;
      email: string;
      telephone: string;
      ville_nom: string;
      secteur_activite: string;
      agreer: boolean;
      agreement_fournisseur: boolean;
      contacts_count: number;
    };
    ville_nom: string;
    localisation: string;
  }