import { api } from "@/services";
import { Proforma } from "@/types/Proforma";
import { AxiosResponse } from "axios";



export interface IProformaCreate {
  offre: number;
  statut: string;
  date_creation?: string;
  date_expiration?: string;
  montant_ht: number;
  taux_tva: number;
  notes?: string;
}

export interface IProformaFilters {
  statut?: string[];
  offre__client?: number;
  offre__entity?: number;
  date_creation_min?: string;
  date_creation_max?: string;
  date_validation_min?: string;
  date_validation_max?: string;
  montant_ttc_min?: number;
  montant_ttc_max?: number;
  page: number;
  page_size: number;
  ordering?: string;
  search?: string;
}

export interface IProformaStats {
  total: number;
  validated: number;
  expired: number;
  validation_rate: number;
  monthly_stats: Array<{
    month: number;
    count: number;
    validated: number;
  }>;
}

class ProformaService {
  private baseUrl = "/proformas/";

  /**
   * Récupère la liste des proformas avec possibilité de filtrage
   * @param filters - Options de filtrage
   * @returns Promise avec les proformas
   */
  async getProformas(
    filters: IProformaFilters = {
      page: 0,
      page_size: 0,
    }
  ): Promise<AxiosResponse<Proforma[]>> {
    // Conversion des filtres en paramètres de requête
    const params = new URLSearchParams();

    // Ajout des filtres aux paramètres
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((val) => params.append(key, val));
        } else {
          params.append(key, String(value));
        }
      }
    });

    return api.get(`${this.baseUrl}?${params.toString()}`);
  }

  /**
   * Récupère une proforma par son ID
   * @param id - ID de la proforma
   * @returns Promise avec le détail de la proforma
   */
  async getProformaById(id: number): Promise<AxiosResponse<Proforma>> {
    return api.get(`${this.baseUrl}${id}/`);
  }

  /**
   * Crée une nouvelle proforma
   * @param proformaData - Données de la proforma à créer
   * @returns Promise avec la proforma créée
   */
  async createProforma(
    proformaData: IProformaCreate
  ): Promise<AxiosResponse<Proforma>> {
    return api.post(this.baseUrl, proformaData);
  }

  /**
   * Met à jour une proforma existante
   * @param id - ID de la proforma
   * @param proformaData - Données de la proforma à mettre à jour
   * @returns Promise avec la proforma mise à jour
   */
  async updateProforma(
    id: number,
    proformaData: Partial<IProformaCreate>
  ): Promise<AxiosResponse<Proforma>> {
    return api.patch(`${this.baseUrl}${id}/`, proformaData);
  }

  /**
   * Supprime une proforma
   * @param id - ID de la proforma
   * @returns Promise avec la réponse
   */
  async deleteProforma(id: number): Promise<AxiosResponse<void>> {
    return api.delete(`${this.baseUrl}${id}/`);
  }

  /**
   * Valide une proforma
   * @param id - ID de la proforma
   * @returns Promise avec la réponse
   */
  async validateProforma(
    id: number
  ): Promise<AxiosResponse<{ status: string }>> {
    return api.post(`${this.baseUrl}${id}/validate/`);
  }

  /**
   * Marque une proforma comme expirée
   * @param id - ID de la proforma
   * @returns Promise avec la réponse
   */
  async expireProforma(id: number): Promise<AxiosResponse<{ status: string }>> {
    return api.post(`${this.baseUrl}${id}/expire/`);
  }

  /**
   * Change le statut d'une proforma
   * @param id - ID de la proforma
   * @param status - Nouveau statut
   * @returns Promise avec la réponse
   */
  async changeStatus(
    id: number,
    status: string
  ): Promise<AxiosResponse<{ status: string; proforma: Proforma }>> {
    return api.post(`${this.baseUrl}${id}/change_status/`, { status });
  }

  /**
   * Télécharge un fichier pour une proforma
   * @param id - ID de la proforma
   * @param file - Fichier à télécharger
   * @returns Promise avec la réponse
   */
  async uploadFile(
    id: number,
    file: File
  ): Promise<
    AxiosResponse<{ status: string; file_name: string; file_url: string }>
  > {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(`${this.baseUrl}${id}/upload_file/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  /**
   * Récupère les statistiques des proformas
   * @returns Promise avec les statistiques
   */
  async getStats(): Promise<AxiosResponse<IProformaStats>> {
    return api.get(`${this.baseUrl}stats/`);
  }

  /**
   * Télécharge le fichier d'une proforma
   * @param fileUrl - URL du fichier
   * @param fileName - Nom du fichier
   */
  downloadFile(fileUrl: string, fileName: string): void {
    api
      .get(fileUrl, {
        responseType: "blob",
      })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
      });
  }

  /**
   * Exporte la liste des proformas en CSV
   * @param filters - Options de filtrage
   * @returns Blob pour téléchargement
   */
  async exportCsv(
    filters: IProformaFilters = {
      page: 0,
      page_size: 0,
    }
  ): Promise<Blob> {
    // Conversion des filtres en paramètres de requête
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((val) => params.append(key, val));
        } else {
          params.append(key, String(value));
        }
      }
    });

    const response = await api.get(
      `${this.baseUrl}export_csv/?${params.toString()}`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  }

  /**
   * Exporte une proforma en PDF
   * @param id - ID de la proforma
   * @returns Blob pour téléchargement
   */
  async exportPdf(id: number): Promise<Blob> {
    const response = await api.get(`${this.baseUrl}${id}/export_pdf/`, {
      responseType: "blob",
    });

    return response.data;
  }
}

// Export d'une instance unique du service
export const proformaService = new ProformaService();
