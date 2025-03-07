import { Client, ClientEdit, ClientList, ContactEdit, MailEdit, Pays, Region, Site, SiteEdit, SiteList, Ville } from "./itf";
import { api } from "./services";
import { Contact } from "./types/contact";



export const paysService = {
  getAll: async () => {
    const { data } = await api.get<Pays>('/pays/');
    return data;
  },

  getByd: async (id: number) => {
    const { data } = await api.get<Pays>(`/pays/${id}/`);
    return data;
  }
};


export const regionService = {
  getAll: async () => {
    const { data } = await api.get<Region[]>('/regions/');
    return data;
  },

  getByd: async (id: number) => {
    const { data } = await api.get<Region>(`/regions/${id}/`);
    return data;
  },

  getByPays: async (paysd: number) => {
    const { data } = await api.get<Region>(`/regions/?pays=${paysd}`);
    return data;
  }
};


export const villeService = {
  getAll: async () => {
    const { data } = await api.get<Ville[]>('/villes/');
    return data;
  },

  getByd: async (id: number) => {
    const { data } = await api.get<Ville>(`/villes/${id}/`);
    return data;
  },

  getByRegion: async (regiond: number) => {
    const { data } = await api.get<Ville[]>(`/villes/?region=${regiond}`);
    return data;
  }
};


export const clientService = {
  getAll: async () => {
    const { data } = await api.get<ClientList>('/clients/');
    return data;
  },

  getByd: async (id: number) => {
    const { data } = await api.get<Client>(`/clients/${id}/`);
    return data;
  },

  create: async (client: ClientEdit) => {
    const { data } = await api.post<Client>('/clients/', client);
    return data;
  },

  update: async (id: number, client: Partial<ClientEdit>) => {
    const { data } = await api.patch<Client>(`/clients/${id}/`, client);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/clients/${id}/`);
  },

  getSites: async (id: number) => {
    const { data } = await api.get<Site>(`/clients/${id}/sites/`);
    return data;
  },

  getContacts: async (id: number) => {
    const { data } = await api.get<Contact>(`/clients/${id}/contacts/`);
    return data;
  }
};

export const siteService = {
  getAll: async () => {
    const { data } = await api.get<SiteList>('/sites/');
    return data;
  },

  getByd: async (id: number) => {
    const { data } = await api.get<Site>(`/sites/${id}/`);
    return data;
  },

  create: async (site: SiteEdit) => {
    const { data } = await api.post<Site>('/sites/', site);
    return data;
  },

  update: async (id: number, site: Partial<SiteEdit>) => {
    const { data } = await api.patch<Site>(`/sites/${id}/`, site);
    return data;
  },

  delete: async (id: number) => {
    await api.delete(`/sites/${id}/`);
  }
};

export const contactService = {
  getAll: async () => {
    const { data } = await api.get<Contact[]>('/contacts/');
    return data;
  },
  getAllcc: async () => {
    const { data } = await api.get<Contact[]>('/contact2/');
    return data;
  },

  getAlls: async () => {
    const { data } = await api.get<Contact[]>('/contacts-detailles/');
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
  addmail: async (contact: MailEdit) => {
    const { data } = await api.post<Contact>('/contacts/', contact);
    return data;
  },

  update: async (id: number, contact: Partial<ContactEdit>) => {
    const { data } = await api.put<Contact>(`/contacts/${id}/`, contact);
    return data;
  },

  delete: async (id: string | number) => {
    await api.delete(`/contacts/${id}/`);
  },
    getByClient: async (clientId: number) => {
      const { data } = await api.get<Contact[]>(`/clients/${clientId}/contacts/`);
      return data;
    }
};
