import { api } from '@/services';
import { OffreDetail } from '@/types/offre';
import { AxiosResponse } from 'axios';

// Types pour les affaires
export interface IAffaire {
  id: number;
  reference: string;
  offre: OffreDetail;
  client_nom: string;
  date_debut: string;
  date_fin_prevue: string | null;
  date_fin_reelle: string | null;
  statut: string;
  statut_display: string;
  responsable: number | IUser | null;
  responsable_nom: string | null;
  montant_total: number;
  montant_facture: number;
  montant_paye: number;
  progression: number;
  en_retard: boolean;
  date_creation: string;
  date_modification: string;
  notes?: string;
}

export interface IOffre {
  id: number;
  reference: string;
  client: IClient;
  entity: IEntity;
  montant_total: number;
  statut: string;
}

export interface IEntity {
  id: number;
  code: string;
  nom: string;
}

export interface IClient {
  id: number;
  nom: string;
  email: string;
}

export interface IUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface IRapport {
  id: number;
  produit: number;
  produit_nom: string;
  produit_category: string;
  statut: string;
  statut_display: string;
  has_formation: boolean;
  date_creation: string;
  date_modification: string;
}

export interface IFacture {
  id: number;
  reference: string;
  client: number;
  client_nom: string;
  montant_ht: number;
  montant_ttc: number;
  statut: string;
  statut_display: string;
  date_creation: string;
  date_echeance: string | null;
}

export interface IAffaireDetail extends IAffaire {
  client: IClient;
  created_by: IUser;
  rapports: IRapport[];
  factures: IFacture[];
  montant_restant_a_facturer: number;
  montant_restant_a_payer: number;
}

export interface IAffaireCreate {
  offre_id: number;
  date_debut: string;
  date_fin_prevue?: string;
  responsable_id?: number;
  notes?: string;
  statut: string;
}

export interface IStatutChange {
  statut: string;
  commentaire?: string;
}

export interface IDashboardData {
  compteurs_statut: Array<{ statut: string; count: number }>;
  dernieres_affaires: IAffaire[];
  affaires_en_retard: IAffaire[];
  resume_financier: {
    montant_total: number;
    montant_facture: number;
    montant_paye: number;
  };
}

export interface IAffaireFilters {
  statut?: string[];
  client?: string;
  responsable?: number;
  date_debut_min?: string;
  date_debut_max?: string;
  date_fin_min?: string;
  date_fin_max?: string;
  montant_min?: number;
  montant_max?: number;
  en_retard?: boolean;
  recent?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
  entity_code?: string;
}

export interface IAffaireInitData {
  offres: IOffre[];
  responsables: IUser[];
}

class AffaireService {
  private baseUrl = '/affaires/';

  /**
   * Récupère la liste des affaires avec possibilité de filtrage
   * @param filters - Options de filtrage
   * @returns Promise avec les affaires
   */
  async getAffaires(filters: IAffaireFilters = {}): Promise<AxiosResponse<IAffaire[]>> {
    // Conversion des filtres en paramètres de requête
    const params = new URLSearchParams();
    
    // Ajout des filtres aux paramètres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(val => params.append(key, val));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return api.get(`${this.baseUrl}?${params.toString()}`);
  }

  /**
   * Récupère une affaire par son ID
   * @param id - ID de l'affaire
   * @returns Promise avec le détail de l'affaire
   */
  async getAffaireById(id: number): Promise<AxiosResponse<IAffaireDetail>> {
    return api.get(`${this.baseUrl}${id}/`);
  }

  /**
   * Récupère tout les element necessaires pour la creation d'une affaire
   * @returns Promise avec les données nécessaires
   */
  async getInitData(id: number ): Promise<AxiosResponse<IAffaireInitData>> {
    return api.get(`${this.baseUrl}${id}/initData/`);
  }

  /**
   * Crée une nouvelle affaire
   * @param affaireData - Données de l'affaire à créer
   * @returns Promise avec l'affaire créée
   */
  async createAffaire(affaireData: IAffaireCreate): Promise<AxiosResponse<IAffaire>> {
    return api.post(this.baseUrl, affaireData);
  }

  /**
   * Met à jour une affaire existante
   * @param id - ID de l'affaire
   * @param affaireData - Données de l'affaire à mettre à jour
   * @returns Promise avec l'affaire mise à jour
   */
  async updateAffaire(id: number, affaireData: Partial<IAffaireCreate>): Promise<AxiosResponse<IAffaire>> {
    return api.put(`${this.baseUrl}${id}/`, affaireData);
  }

  /**
   * Supprime une affaire
   * @param id - ID de l'affaire
   * @returns Promise avec la réponse
   */
  async deleteAffaire(id: number): Promise<AxiosResponse<void>> {
    return api.delete(`${this.baseUrl}${id}/`);
  }

  /**
   * Change le statut d'une affaire
   * @param id - ID de l'affaire
   * @param statutData - Nouveau statut et commentaire optionnel
   * @returns Promise avec la réponse
   */
  async changeStatut(id: number, statutData: IStatutChange): Promise<AxiosResponse<{ success: boolean; statut: string; message: string }>> {
    return api.post(`${this.baseUrl}${id}/change_statut/`, statutData);
  }

  /**
   * Récupère les rapports associés à une affaire
   * @param id - ID de l'affaire
   * @returns Promise avec les rapports
   */
  async getRapports(id: number): Promise<AxiosResponse<IRapport[]>> {
    return api.get(`${this.baseUrl}${id}/rapports/`);
  }

  /**
   * Récupère les factures associées à une affaire
   * @param id - ID de l'affaire
   * @returns Promise avec les factures
   */
  async getFactures(id: number): Promise<AxiosResponse<IFacture[]>> {
    return api.get(`${this.baseUrl}${id}/factures/`);
  }

  /**
   * Génère une nouvelle facture pour l'affaire
   * @param id - ID de l'affaire
   * @returns Promise avec la réponse
   */
  async genererFacture(id: number): Promise<AxiosResponse<{ success: boolean; message: string; facture: IFacture }>> {
    return api.post(`${this.baseUrl}${id}/generer_facture/`);
  }

  /**
   * Marque un rapport comme terminé
   * @param id - ID de l'affaire
   * @param rapportId - ID du rapport
   * @returns Promise avec la réponse
   */
  async marquerRapportTermine(id: number, rapportId: number): Promise<AxiosResponse<{ success: boolean; message: string }>> {
    return api.post(`${this.baseUrl}${id}/marquer_rapport_termine/`, { rapport_id: rapportId });
  }

  /**
   * Récupère les données du tableau de bord
   * @returns Promise avec les données du tableau de bord
   */
  async getDashboard(): Promise<AxiosResponse<IDashboardData>> {
    return api.get(`${this.baseUrl}dashboard/`);
  }

  /**
   * Exporte la liste des affaires en CSV
   * @param filters - Options de filtrage
   * @returns Blob pour téléchargement
   */
  async exportCsv(filters: IAffaireFilters = {}): Promise<Blob> {
    // Conversion des filtres en paramètres de requête
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(val => params.append(key, val));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get(`${this.baseUrl}export_csv/?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  /**
   * Exporte une affaire en PDF
   * @param id - ID de l'affaire
   * @returns Blob pour téléchargement
   */
  async exportPdf(id: number): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}${id}/export_pdf/`, {
      responseType: 'blob'
    });
    
    return response.data;
  }
}

// Export d'une instance unique du service
export const affaireService = new AffaireService();