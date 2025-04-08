import axios, { AxiosInstance } from 'axios';
import type {
  EntityBase, EntityDetail, EntityEdit,
  ClientDetail, ClientEdit,
  SiteBase, SiteDetail, SiteEdit,
  CategoryBase, CategoryDetail, CategoryEdit,
  ProductBase, ProductDetail, ProductEdit,
  OffreBase,
  ProformaBase, ProformaDetail, ProformaEdit,
  AffaireBase, AffaireDetail, AffaireEdit,
  FactureBase, FactureDetail, FactureEdit,
  RapportBase, RapportDetail, RapportEdit,
  FormationBase, FormationDetail, FormationEdit,
  ParticipantBase, ParticipantDetail, ParticipantEdit,
  AttestationFormationBase, AttestationFormationDetail, AttestationFormationEdit,
  ProformaEditStatus,
} from './interfaces';
import { AffaireDetails } from './affaireType';
import { Client, ClientDetails } from './types/client';
import { Contact, Opportunite, OpportuniteEdition, OpportuniteListItem } from './types/contact';
import { ContactBase, ContactEdit } from './itf';
import { OffreDetail, OffreInitData } from './types/offre';
import { OffreFormData } from './views/offres/types';
import { OffreStatus } from './components/offre/ActionsCard';

const API_URL = import.meta.env.VITE_APP_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Instance d'Axios pour les requêtes multipart (utile pour l'upload de fichiers)
export const apiClientFile: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data', // Pour les requêtes avec fichiers
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour ajouter le token
apiClientFile.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Entity Service
export const entityService = {
  getAll: async () => {
    const { data } = await api.get<EntityBase[]>('/entities/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<EntityDetail>(`/entities/${id}/`);
    return data;
  },
  create: async (entity: EntityEdit) => {
    const { data } = await api.post<EntityDetail>('/entities/', entity);
    return data;
  },
  update: async (id: number, entity: Partial<EntityEdit>) => {
    const { data } = await api.put<EntityDetail>(`/entities/${id}/`, entity);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/entities/${id}/`);
  }
};

// Client Service
export const clientService = {
  getAll: async () => {
    const { data } = await api.get<Client[]>('/clients/');
    return data;
  },
  getAllcc: async () => {
    const { data } = await api.get<Client[]>('/clientsContacts/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<ClientDetails>(`/clients/${id}/`);
    return data;
  },
  create: async (client: ClientEdit) => {
    const { data } = await api.post<ClientDetail>('/clients/', client);
    return data;
  },
  update: async (id: number, client: Partial<ClientEdit>) => {
    const { data } = await api.put<ClientDetail>(`/clients/${id}/`, client);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/clients/${id}/`);
  },
  getSites: async (id: number) => {
    const { data } = await api.get<SiteBase[]>(`/clients/${id}/sites/`);
    return data;
  },
  getContacts: async (id: number) => {
    const { data } = await api.get<ContactBase[]>(`/clients/${id}/contacts/`);
    return data;
  },
  getOpportunites: async (id: number) => {
    const { data } = await api.get<OpportuniteListItem[]>(`/clients/${id}/opportunites/`);
    return data;
  },
  getOffres: async (id: number) => {
    const { data } = await api.get<OffreBase[]>(`/clients/${id}/offres/`);
    return data;
  },
  getAffaires: async (id: number) => {
    const { data } = await api.get<AffaireBase[]>(`/clients/${id}/affaires/`);
    return data;
  },
  getFactures: async (id: number) => {
    const { data } = await api.get<FactureBase[]>(`/clients/${id}/factures/`);
    return data;
  },
  getFormations: async (id: number) => {
    const { data } = await api.get<FormationBase[]>(`/clients/${id}/formations/`);
    return data;
  },
  getRapports: async (id: number) => {
    const { data } = await api.get<RapportBase[]>(`/clients/${id}/rapports/`);
    return data;
  }
};

// Contact Service
export const contactService = {
  getAll: async () => {
    const { data } = await api.get<ContactBase[]>('/contacts/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<Contact>(`/contacts/${id}/`);
    return data;
  },
  create: async (contact: ContactEdit) => {
    const { data } = await api.post<Contact>('/contacts/', contact);
    return data;
  },
  update: async (id: number, contact: Partial<ContactEdit>) => {
    const { data } = await api.put<Contact>(`/contacts/${id}/`, contact);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/contacts/${id}/`);
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<ContactBase[]>(`/clients/${clientId}/contacts/`);
    return data;
  }
};

// Site Service
export const siteService = {
  getAll: async () => {
    const { data } = await api.get<SiteDetail[]>('/sites/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<SiteDetail>(`/sites/${id}/`);
    return data;
  },
  create: async (site: SiteEdit) => {
    const { data } = await api.post<SiteDetail>('/sites/', site);
    return data;
  },
  update: async (id: number, site: Partial<SiteEdit>) => {
    const { data } = await api.put<SiteDetail>(`/sites/${id}/`, site);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/sites/${id}/`);
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<SiteBase[]>(`/clients/${clientId}/sites/`);
    return data;
  }
};

// Category Service
export const categoryService = {
  getAll: async () => {
    const { data } = await api.get<CategoryBase[]>('/categories/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<CategoryDetail>(`/categories/${id}/`);
    return data;
  },
  create: async (category: CategoryEdit) => {
    const { data } = await api.post<CategoryDetail>('/categories/', category);
    return data;
  },
  update: async (id: number, category: Partial<CategoryEdit>) => {
    const { data } = await api.put<CategoryDetail>(`/categories/${id}/`, category);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/categories/${id}/`);
  }
};

// Product Service
export const productService = {
  getAll: async () => {
    const { data } = await api.get<ProductBase[]>('/products/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<ProductDetail>(`/products/${id}/`);
    return data;
  },
  create: async (product: ProductEdit) => {
    const { data } = await api.post<ProductDetail>('/products/', product);
    return data;
  },
  update: async (id: number, product: Partial<ProductEdit>) => {
    const { data } = await api.put<ProductDetail>(`/products/${id}/`, product);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/products/${id}/`);
  }
};

interface OffreStatusResponse {
  success: boolean;
  current_status: OffreStatus;
}

// Offre Service
export const offreService = {
  getAll: async () => {
    const { data } = await api.get<OffreDetail[]>('/offres/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<OffreDetail>(`/offres/${id}/`);
    return data;
  },
  create: async (offre: OffreFormData) => {
    const { data } = await api.post<OffreDetail>('/offres/', offre);
    return data;
  },
  update: async (id: number, offre: Partial<OffreFormData>) => {
    const { data } = await api.put<OffreDetail>(`/offres/${id}/`, offre);
    return data;
  },
  update_notes: async (id: number, notes: string) => {
    const { data } = await api.put<OffreDetail>(`/off/offres/${id}/notes/`, { notes });
    return data;
  },
  upload: async (id: number, file: File) => {
    const { data } = await apiClientFile.post<OffreDetail>(`/off/offres/${id}/upload/`, { file });
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/offres/${id}/`);
  },
  valider: async (id: number) => {
    const { data } = await api.post<OffreDetail>(`/offres/${id}/valider/`);
    return data;
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<OffreBase[]>(`/clients/${clientId}/offres/`);
    return data;
  },
  getARelancer: async () => {
    const { data } = await api.get<OffreBase[]>('/offres/a_relancer/');
    return data;
  },
  getStatistiques: async (period?: string) => {
    const params = period ? { period } : {};
    const { data } = await api.get('/offres/statistiques/', { params });
    return data;
  },

  getInitData: async () => {
    const { data } = await api.get<OffreInitData>('/offress/init_data/');
    return data;
  },

  download: async (id: number) => {
    const { data } = await api.get<OffreDetail>(`/offres/${id}/download/`);
    return data;
  },
  archive: async (id: number) => {
    const { data } = await api.post<OffreDetail>(`/offres/${id}/archiver/`);
    return data;
  },
  markWon: async (id: number, date_validation: string) => {
    const { data } = await api.put<OffreStatusResponse>(`/off/offres/${id}/gagner/`, { date_validation });
    return data;
  },
  markLost: async (id: number, date_cloture: string) => {
    const { data } = await api.put<OffreStatusResponse>(`/off/offres/${id}/perdre/`, { date_cloture });
    return data;
  },
  send: async (id: number, date_envoi: string) => {
    const { data } = await api.put<OffreStatusResponse>(`/off/offres/${id}/envoyer/`, { date_envoi });
    return data;
  },
  sendReminder: async (id: number) => {
    const { data } = await api.put<OffreDetail>(`/off/offres/${id}/relance/`);
    return data;
  },
};

// Proforma Service
export const proformaService = {
  getAll: async () => {
    const { data } = await api.get<[ProformaDetail]>('/proformas/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<ProformaDetail>(`/proformas/${id}/`);
    return data;
  },
  create: async (proforma: ProformaEdit) => {
    const { data } = await api.post<ProformaDetail>('/proformas/', proforma);
    return data;
  },
  change_status: async (id: number, proforma: ProformaEditStatus) => {
    const { data } = await api.post<ProformaDetail>(`/proformas/${id}/change_status/`, proforma);
    return data;
  },
  update: async (id: number, proforma: Partial<ProformaEdit>) => {
    const { data } = await api.put<ProformaDetail>(`/proformas/${id}/`, proforma);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/proformas/${id}/`);
  },
  valider: async (id: number) => {
    const { data } = await api.post<ProformaDetail>(`/proformas/${id}/valider/`);
    return data;
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<ProformaBase[]>(`/clients/${clientId}/proformas/`);
    return data;
  }
};

// Affaire Service
export const affaireService = {
  getAll: async () => {
    const { data } = await api.get<AffaireBase[]>('/affaires/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<AffaireDetail>(`/affaires/${id}/`);
    return data;
  },
  details: async (id: number) => {
    const { data } = await api.get<AffaireDetails>(`/affaires/${id}/details_complets`);
    return data;
  },
  create: async (affaire: AffaireEdit) => {
    const { data } = await api.post<AffaireDetail>('/affaires/', affaire);
    return data;
  },
  update: async (id: number, affaire: Partial<AffaireEdit>) => {
    const { data } = await api.put<AffaireDetail>(`/affaires/${id}/`, affaire);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/affaires/${id}/`);
  },
  getRapports: async (id: number) => {
    const { data } = await api.get<RapportBase[]>(`/affaires/${id}/rapports/`);
    return data;
  },
  getFormations: async (id: number) => {
    const { data } = await api.get<FormationBase[]>(`/affaires/${id}/formations/`);
    return data;
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<AffaireBase[]>(`/clients/${clientId}/affaires/`);
    return data;
  },
  getStatistiques: async (period?: string) => {
    const params = period ? { period } : {};
    const { data } = await api.get('/affaires/statistiques/', { params });
    return data;
  },
  changeStatus: async (id: number, status: string) => {
    const { data } = await api.post<AffaireDetail>(`/affaires/${id}/change_status/`, { status });
    return data;
  }
};

// Facture Service
export const factureService = {
  getAll: async () => {
    const { data } = await api.get<FactureBase[]>('/factures/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<FactureDetail>(`/factures/${id}/`);
    return data;
  },
  create: async (facture: FactureEdit) => {
    const { data } = await api.post<FactureDetail>('/factures/', facture);
    return data;
  },
  update: async (id: number, facture: Partial<FactureEdit>) => {
    const { data } = await api.put<FactureDetail>(`/factures/${id}/`, facture);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/factures/${id}/`);
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<FactureBase[]>(`/clients/${clientId}/factures/`);
    return data;
  },
  getStatistiques: async (period?: string) => {
    const params = period ? { period } : {};
    const { data } = await api.get('/factures/statistiques/', { params });
    return data;
  },
  changeStatus: async (id: number, status: string) => {
    const { data } = await api.post<FactureDetail>(`/factures/${id}/change_status/`, { status });
    return data;
  }
};

// Rapport Service
export const rapportService = {
  getAll: async () => {
    const { data } = await api.get<RapportBase[]>('/rapports/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<RapportDetail>(`/rapports/${id}/`);
    return data;
  },
  create: async (rapport: RapportEdit) => {
    const { data } = await api.post<RapportDetail>('/rapports/', rapport);
    return data;
  },
  update: async (id: number, rapport: Partial<RapportEdit>) => {
    const { data } = await api.put<RapportDetail>(`/rapports/${id}/`, rapport);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/rapports/${id}/`);
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<RapportBase[]>(`/clients/${clientId}/rapports/`);
    return data;
  },
  getByAffaire: async (affaireId: number) => {
    const { data } = await api.get<RapportBase[]>(`/affaires/${affaireId}/rapports/`);
    return data;
  },
  changeStatus: async (id: number, status: string) => {
    const { data } = await api.post<RapportDetail>(`/rapports/${id}/change_status/`, { status });
    return data;
  }
};

// Formation Service
export const formationService = {
  getAll: async () => {
    const { data } = await api.get<FormationBase[]>('/formations/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<FormationDetail>(`/formations/${id}/`);
    return data;
  },
  create: async (formation: FormationEdit) => {
    const { data } = await api.post<FormationDetail>('/formations/', formation);
    return data;
  },
  update: async (id: number, formation: Partial<FormationEdit>) => {
    const { data } = await api.put<FormationDetail>(`/formations/${id}/`, formation);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/formations/${id}/`);
  },
  getParticipants: async (id: number) => {
    const { data } = await api.get<ParticipantBase[]>(`/formations/${id}/participants/`);
    return data;
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<FormationBase[]>(`/clients/${clientId}/formations/`);
    return data;
  },
  getByAffaire: async (affaireId: number) => {
    const { data } = await api.get<FormationBase[]>(`/affaires/${affaireId}/formations/`);
    return data;
  }
};

// Participant Service
export const participantService = {
  getAll: async () => {
    const { data } = await api.get<ParticipantBase[]>('/participants/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<ParticipantDetail>(`/participants/${id}/`);
    return data;
  },
  create: async (participant: ParticipantEdit) => {
    const { data } = await api.post<ParticipantDetail>('/participants/', participant);
    return data;
  },
  update: async (id: number, participant: Partial<ParticipantEdit>) => {
    const { data } = await api.put<ParticipantDetail>(`/participants/${id}/`, participant);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/participants/${id}/`);
  },
  getByFormation: async (formationId: number) => {
    const { data } = await api.get<ParticipantBase[]>(`/formations/${formationId}/participants/`);
    return data;
  }
};

// AttestationFormation Service
export const attestationFormationService = {
  getAll: async () => {
    const { data } = await api.get<AttestationFormationBase[]>('/attestations/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<AttestationFormationDetail>(`/attestations/${id}/`);
    return data;
  },
  create: async (attestation: AttestationFormationEdit) => {
    const { data } = await api.post<AttestationFormationDetail>('/attestations/', attestation);
    return data;
  },
  update: async (id: number, attestation: Partial<AttestationFormationEdit>) => {
    const { data } = await api.put<AttestationFormationDetail>(`/attestations/${id}/`, attestation);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/attestations/${id}/`);
  },
  getByFormation: async (formationId: number) => {
    const { data } = await api.get<AttestationFormationBase[]>(`/formations/${formationId}/attestations/`);
    return data;
  },
  getByParticipant: async (participantId: number) => {
    const { data } = await api.get<AttestationFormationBase[]>(`/participants/${participantId}/attestations/`);
    return data;
  }
};

export const opportuniteService = {
  getAll: async () => {
    const { data } = await api.get<OpportuniteListItem[]>('/opportunites/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<Opportunite>(`/opportunites/${id}/`);
    return data;
  },
  create: async (opportunite: OpportuniteEdition) => {
    const { data } = await api.post<Opportunite>('/opportunites/', opportunite);
    return data;
  },
  update: async (id: number, opportunite: Partial<OpportuniteEdition>) => {
    const { data } = await api.put<Opportunite>(`/opportunites/${id}/`, opportunite);
    return data;
  },
  qualifier: async (id: number) => {
    const { data } = await api.post<Opportunite>(`/opportunites/${id}/qualifier/`);
    return data;
  },
  proposer: async (id: number) => {
    const { data } = await api.post<Opportunite>(`/opportunites/${id}/proposer/`);
    return data;
  },
  negocier: async (id: number) => {
    const { data } = await api.post<Opportunite>(`/opportunites/${id}/negocier/`);
    return data;
  },
  gagner: async (id: number) => {
    const { data } = await api.post<Opportunite>(`/opportunites/${id}/gagner/`);
    return data;
  },
  perdre: async (id: number, raison?: string) => {
    // Only send the raison parameter, without change_state
    const { data } = await api.post<Opportunite>(`/opportunites/${id}/perdre/`, 
      raison ? { raison } : {});
    return data;
  },
  creerOffre: async (id: number) => {
    const { data } = await api.post<{ status: string, id: number, offre_reference: string }>(
      `/opportunites/${id}/creer_offre/`
    );
    return data;
  },
  getARelancer: async () => {
    const { data } = await api.get<OpportuniteListItem[]>('/opportunites/a_relancer/');
    return data;
  },
  getStatistiques: async (days?: number) => {
    const params = days ? { days } : {};
    const { data } = await api.get('/opportunites/statistiques/', { params });
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/opportunites/${id}/`);
  },
  getByClient: async (clientId: number) => {
    const { data } = await api.get<OpportuniteListItem[]>(`/clients/${clientId}/opportunites/`);
    return data;
  }
};