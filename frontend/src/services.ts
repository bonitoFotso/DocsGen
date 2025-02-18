import axios from 'axios';
import type {
  EntityBase, EntityDetail, EntityEdit,
  ClientBase, ClientDetail, ClientEdit,
  SiteBase, SiteDetail, SiteEdit,
  CategoryBase, CategoryDetail, CategoryEdit,
  ProductBase, ProductDetail, ProductEdit,
  OffreBase, OffreDetail, OffreEdit,
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

const API_URL = import.meta.env.VITE_APP_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
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
    const { data } = await api.get<ClientBase[]>('/clients/');
    return data;
  },
  getAllcc: async () => {
    const { data } = await api.get<ClientBase[]>('/clientsContacts/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<ClientDetail>(`/clients/${id}/`);
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

// Offre Service
export const offreService = {
  getAll: async () => {
    const { data } = await api.get<OffreBase[]>('/offres/');
    return data;
  },
  getById: async (id: number) => {
    const { data } = await api.get<OffreDetail>(`/offres/${id}/`);
    return data;
  },
  create: async (offre: OffreEdit) => {
    const { data } = await api.post<OffreDetail>('/offres/', offre);
    return data;
  },
  update: async (id: number, offre: Partial<OffreEdit>) => {
    const { data } = await api.put<OffreDetail>(`/offres/${id}/`, offre);
    return data;
  },
  delete: async (id: number) => {
    await api.delete(`/offres/${id}/`);
  },
  valider: async (id: number) => {
    const { data } = await api.post<OffreDetail>(`/offres/${id}/valider/`);
    return data;
  }
};

// Proforma Service
export const proformaService = {
  getAll: async () => {
    const { data } = await api.get<ProformaBase[]>('/proformas/');
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
  }
};