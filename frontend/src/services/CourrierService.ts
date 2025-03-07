// services/CourrierService.ts
import { apiClientFile } from '@/services';
import { Courrier, CourrierFilter, CourrierHistory, CourrierStats } from '@/types/courrier';



class CourrierService {

  // Récupérer la liste des courriers avec filtrage
  async getCourriers(filters?: CourrierFilter): Promise<Courrier[]> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    
    const url = `/courriers/${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await apiClientFile.get<Courrier[]>(url);
    return response.data;
  }

  // Récupérer un courrier par son ID
  async getCourrier(id: number): Promise<Courrier> {
    const response = await apiClientFile.get<Courrier>(`/courriers/${id}/`);
    return response.data;
  }

  // Créer un nouveau courrier
  async createCourrier(courrier: Partial<Courrier>): Promise<Courrier> {
    const response = await apiClientFile.post<Courrier>(`/courriers/`, courrier);
    return response.data;
  }

  // Mettre à jour un courrier existant
  async updateCourrier(id: number, courrier: Partial<Courrier>): Promise<Courrier> {
    const response = await apiClientFile.put<Courrier>(`/courriers/${id}/`, courrier);
    return response.data;
  }

  // Supprimer un courrier
  async deleteCourrier(id: number): Promise<void> {
    await apiClientFile.delete(`/courriers/${id}/`);
  }

  // Marquer un courrier comme envoyé
  async markAsSent(id: number, date_envoi?: string): Promise<void> {
    await apiClientFile.post(`/courriers/${id}/mark_as_sent/`, { date_envoi });
  }

  // Marquer un courrier comme reçu
  async markAsReceived(id: number, date_reception?: string): Promise<void> {
    await apiClientFile.post(`/courriers/${id}/mark_as_received/`, { date_reception });
  }

  // Marquer un courrier comme traité
  async markAsProcessed(id: number): Promise<void> {
    await apiClientFile.post(`/courriers/${id}/mark_as_processed/`, {});
  }

  // Archiver un courrier
  async archiveCourrier(id: number): Promise<void> {
    await apiClientFile.post(`/courriers/${id}/archive/`, {});
  }

  // Récupérer l'historique d'un courrier
  async getCourrierHistory(id: number): Promise<CourrierHistory[]> {
    const response = await apiClientFile.get<CourrierHistory[]>(`/courriers/${id}/history/`);
    return response.data;
  }

  // Récupérer les statistiques des courriers
  async getCourrierStats(): Promise<CourrierStats> {
    const response = await apiClientFile.get<CourrierStats>(`/courriers/stats/`);
    return response.data;
  }
}

export default new CourrierService();