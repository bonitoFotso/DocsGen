// src/services/factureService.ts
import { api } from '@/services';
import { AxiosResponse } from 'axios';

// Types
export interface IFacture {
  id: number;
  reference: string;
  affaire: number | IAffaire;
  affaire_reference: string;
  client_nom: string;
  entity_code: string;
  statut: string;
  statut_display: string;
  date_creation: string;
  date_emission: string | null;
  date_echeance: string | null;
  date_paiement: string | null;
  montant_ht: number;
  montant_ttc: number;
  montant_paye: number;
  solde: number;
  est_en_retard: boolean;
  fichier: string | null;
}

export interface IAffaire {
  id: number;
  reference: string;
  offre: {
    id: number;
    reference: string;
    client: {
      id: number;
      nom: string;
    };
    entity: {
      id: number;
      code: string;
    };
  };
}

export interface IFactureDetail extends IFacture {
  taux_tva: number;
  montant_tva: number;
  notes: string | null;
  sequence_number: number;
  created_by: number;
  created_by_name: string;
  updated_by: number;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface IFactureCreate {
  affaire: number;
  statut: string;
  date_creation?: string;
  date_echeance?: string;
  montant_ht: number;
  taux_tva: number;
  notes?: string;
}

export interface IFactureFilters {
  statut?: string[];
  affaire__offre__client?: number;
  affaire__offre__entity?: number;
  date_creation_min?: string;
  date_creation_max?: string;
  date_emission_min?: string;
  date_emission_max?: string;
  date_echeance_min?: string;
  date_echeance_max?: string;
  montant_ttc_min?: number;
  montant_ttc_max?: number;
  est_en_retard?: boolean;
  search?: string;
  page: number;
  page_size: number;
  ordering?: string;
}

export interface IFactureStats {
  total_count: number;
  montant_total: number;
  montant_paye: number;
  taux_recouvrement: number;
  factures_en_retard: number;
  stats_par_statut: Array<{
    statut: string;
    count: number;
    montant: number;
  }>;
  stats_par_mois: Array<{
    mois: number;
    count: number;
    montant: number;
    paye: number;
  }>;
}

class FactureService {
  private baseUrl = '/factures/';

  /**
   * Récupère la liste des factures avec possibilité de filtrage
   * @param filters - Options de filtrage
   * @returns Promise avec les factures
   */
  async getFactures(filters: IFactureFilters = {
    page: 0,
    page_size: 0
  }): Promise<AxiosResponse<IFacture[]>> {
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
   * Récupère une facture par son ID
   * @param id - ID de la facture
   * @returns Promise avec le détail de la facture
   */
  async getFactureById(id: number): Promise<AxiosResponse<IFactureDetail>> {
    return api.get(`${this.baseUrl}${id}/`);
  }

  /**
   * Crée une nouvelle facture
   * @param factureData - Données de la facture à créer
   * @returns Promise avec la facture créée
   */
  async createFacture(factureData: IFactureCreate): Promise<AxiosResponse<IFacture>> {
    return api.post(this.baseUrl, factureData);
  }

  /**
   * Met à jour une facture existante
   * @param id - ID de la facture
   * @param factureData - Données de la facture à mettre à jour
   * @returns Promise avec la facture mise à jour
   */
  async updateFacture(id: number, factureData: Partial<IFactureCreate>): Promise<AxiosResponse<IFacture>> {
    return api.patch(`${this.baseUrl}${id}/`, factureData);
  }

  /**
   * Supprime une facture
   * @param id - ID de la facture
   * @returns Promise avec la réponse
   */
  async deleteFacture(id: number): Promise<AxiosResponse<void>> {
    return api.delete(`${this.baseUrl}${id}/`);
  }

  /**
   * Marque une facture comme payée
   * @param id - ID de la facture
   * @param amount - Montant payé (optionnel, si non fourni, la facture est marquée comme entièrement payée)
   * @returns Promise avec la réponse
   */
  async markAsPaid(id: number, amount?: number): Promise<AxiosResponse<{ status: string; message: string; montant_paye: number; statut: string }>> {
    const data = amount !== undefined ? { amount } : {};
    return api.post(`${this.baseUrl}${id}/mark_as_paid/`, data);
  }

  /**
   * Marque une facture comme émise
   * @param id - ID de la facture
   * @returns Promise avec la réponse
   */
  async markAsIssued(id: number): Promise<AxiosResponse<{ status: string; message: string; statut: string; date_emission: string }>> {
    return api.post(`${this.baseUrl}${id}/mark_as_issued/`);
  }

  /**
   * Annule une facture
   * @param id - ID de la facture
   * @returns Promise avec la réponse
   */
  async cancelFacture(id: number): Promise<AxiosResponse<{ status: string; message: string; statut: string }>> {
    return api.post(`${this.baseUrl}${id}/cancel/`);
  }

  /**
   * Télécharge un fichier pour une facture
   * @param id - ID de la facture
   * @param file - Fichier à télécharger
   * @returns Promise avec la réponse
   */
  async uploadFile(id: number, file: File): Promise<AxiosResponse<{ status: string; message: string; file_name: string; file_url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(`${this.baseUrl}${id}/upload_file/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Récupère l'URL de téléchargement du fichier d'une facture
   * @param id - ID de la facture
   * @returns Promise avec l'URL du fichier
   */
  async getFileUrl(id: number): Promise<AxiosResponse<{ fichier_url: string }>> {
    return api.get(`${this.baseUrl}${id}/download/`);
  }

  /**
   * Télécharge le fichier d'une facture
   * @param url - URL du fichier
   * @param fileName - Nom du fichier
   */
  downloadFile(url: string, fileName: string): void {
    api.get(url, {
      responseType: 'blob'
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
  }

  /**
   * Récupère les statistiques des factures
   * @returns Promise avec les statistiques
   */
  async getStats(): Promise<AxiosResponse<IFactureStats>> {
    return api.get(`${this.baseUrl}stats/`);
  }

  /**
   * Exporte des factures au format PDF
   * @param id - ID de la facture
   * @returns Promise avec le fichier PDF
   */
  async exportPdf(id: number): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}${id}/export_pdf/`, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  /**
   * Exporte la liste des factures au format CSV
   * @param filters - Filtres à appliquer
   * @returns Promise avec le fichier CSV
   */
  async exportCsv(filters: IFactureFilters = {
    page: 0,
    page_size: 0
  }): Promise<Blob> {
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
}

// Export d'une instance unique du service
export const factureService = new FactureService();