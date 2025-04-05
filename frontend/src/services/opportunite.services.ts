import { 
  Opportunite,
  OpportuniteDetail, 
  CreateOpportuniteDto, 
  UpdateOpportuniteDto,
  OpportuniteFilter,
  OpportuniteStatistics,
  OpportuniteTransitionResult,
  BatchTransitionResult
} from '@/types/opportunite.types';
import { apiClient } from './api';

/**
 * Base URL pour l'API
 */
const BASE_URL = `/opportunites`;
const TRANSITIONS_URL = `/transitions`;

/**
 * Client API pour les opérations sur les opportunités
 */
export const opportuniteApi = {
  /**
   * Récupère la liste des opportunités avec filtrage
   */
  async getOpportunites(filter?: OpportuniteFilter): Promise<Opportunite[]> {
    // Préparation des paramètres de requête
    const params: Record<string, string | number | boolean> = {};
    
    if (filter) {
      if (filter.statut?.length) {
        filter.statut.forEach((statut, index) => {
          params[`statut[${index}]`] = statut;
        });
      }
      
      if (filter.clientNom) params.client_nom = filter.clientNom;
      if (filter.entityId) params.entity = filter.entityId;
      if (filter.entityCode) params.entity_code = filter.entityCode;
      if (filter.montantMin) params.montant_min = filter.montantMin;
      if (filter.montantMax) params.montant_max = filter.montantMax;
      if (filter.probabiliteMin) params.probabilite_min = filter.probabiliteMin;
      if (filter.probabiliteMax) params.probabilite_max = filter.probabiliteMax;
      
      if (filter.dateCreationAfter) {
        params.date_creation_after = filter.dateCreationAfter.toISOString();
      }
      
      if (filter.dateCreationBefore) {
        params.date_creation_before = filter.dateCreationBefore.toISOString();
      }
      
      if (filter.createdBy) params.created_by = filter.createdBy;
      if (filter.relanceStatus) params.relance_status = filter.relanceStatus;
      if (filter.produitId) params.produit = filter.produitId;
      if (filter.produitPrincipalId) params.produit_principal = filter.produitPrincipalId;
      
      if (filter.hasOffre !== undefined) params.has_offre = filter.hasOffre;
      if (filter.isActive !== undefined) params.is_active = filter.isActive;
      if (filter.periode) params.periode = filter.periode;
      
      // Pagination
      if (filter.page) params.page = filter.page;
      if (filter.pageSize) params.page_size = filter.pageSize;
      
      // Tri
      if (filter.ordering) params.ordering = filter.ordering;
    }
    
    const response = await apiClient.get(BASE_URL, { params });
    return response.data || [];
  },

  /**
   * Récupère les détails d'une opportunité
   */
  async getOpportuniteDetail(id: number): Promise<OpportuniteDetail> {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle opportunité
   */
  async createOpportunite(opportunite: CreateOpportuniteDto): Promise<Opportunite> {
    const response = await apiClient.post(BASE_URL, opportunite);
    return response.data;
  },

  /**
   * Met à jour une opportunité existante
   */
  async updateOpportunite(id: number, opportunite: UpdateOpportuniteDto): Promise<Opportunite> {
    const response = await apiClient.patch(`${BASE_URL}/${id}`, opportunite);
    return response.data;
  },

  /**
   * Supprime une opportunité
   */
  async deleteOpportunite(id: number): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Qualifie une opportunité
   */
  async qualifierOpportunite(id: number): Promise<OpportuniteTransitionResult> {
    const response = await apiClient.post(`${BASE_URL}/${id}/qualifier`, {});
    return response.data;
  },

  /**
   * Passe une opportunité en proposition
   */
  async proposerOpportunite(id: number): Promise<OpportuniteTransitionResult> {
    const response = await apiClient.post(`${BASE_URL}/${id}/proposer`, {});
    return response.data;
  },

  /**
   * Passe une opportunité en négociation
   */
  async negocierOpportunite(id: number): Promise<OpportuniteTransitionResult> {
    const response = await apiClient.post(`${BASE_URL}/${id}/negocier`, {});
    return response.data;
  },

  /**
   * Marque une opportunité comme gagnée
   */
  async gagnerOpportunite(id: number): Promise<OpportuniteTransitionResult> {
    const response = await apiClient.post(`${BASE_URL}/${id}/gagner`, {});
    return response.data;
  },

  /**
   * Marque une opportunité comme perdue
   */
  async perdreOpportunite(id: number, raison?: string): Promise<OpportuniteTransitionResult> {
    const response = await apiClient.post(`${BASE_URL}/${id}/perdre`, { raison: raison || '' });
    return response.data;
  },

  /**
   * Crée une offre à partir d'une opportunité
   */
  async creerOffre(id: number): Promise<{ success: boolean, offre_id: number, offre_reference: string }> {
    const response = await apiClient.post(`${BASE_URL}/${id}/creer_offre`, {});
    return response.data;
  },

  /**
   * Récupère les statistiques sur les opportunités
   */
  async getStatistics(): Promise<OpportuniteStatistics> {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
  },

  /**
   * Marque plusieurs opportunités comme gagnées
   */
  async gagnerMultiple(ids: number[]): Promise<BatchTransitionResult> {
    const response = await apiClient.post(`${TRANSITIONS_URL}/gagner_multiple`, { ids });
    return response.data;
  },

  /**
   * Marque plusieurs opportunités comme perdues
   */
  async perdreMultiple(ids: number[], raison?: string): Promise<BatchTransitionResult> {
    const response = await apiClient.post(`${TRANSITIONS_URL}/perdre_multiple`, { 
      ids, 
      raison: raison || '' 
    });
    return response.data;
  },

  /**
   * Met à jour les dates de relance pour plusieurs opportunités
   */
  async updateRelanceMultiple(ids: number[]): Promise<BatchTransitionResult> {
    const response = await apiClient.post(`${TRANSITIONS_URL}/update_relance_multiple`, { ids });
    return response.data;
  }
};