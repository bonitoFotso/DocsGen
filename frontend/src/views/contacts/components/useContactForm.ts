// types.ts
export interface ClientBase {
  id: number;
  nom: string | null;
}

export interface SiteDetail {
  id: number;
  nom: string | null;
  client: {
    id: number;
  };
}



export interface ContactEdit {
  id?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  poste?: string;
  client?: number;
  site?: number;
  service?: string;
  role_achat?: string;
  date_envoi?: string;
  relance?: boolean;
  adresse?: string;
  quartier?: string;
  bp?: string;
  notes?: string;
  region?: number;
  ville?: number;
  secteur?: string;
}

export type TabId = 'info' | 'entreprise' | 'adresse';

export interface FormErrors {
  email?: string;
  client?: string;
  site?: string;
  region?: string;
  ville?: string;
  fetch?: string;
  [key: string]: string | undefined;
}

// useContactForm.ts
import { useState, useCallback, useEffect } from 'react';
import { useServices } from '@/AppHooks';
import { Region, Ville } from '@/itf';

interface LoadingState {
  clients: boolean;
  sites: boolean;
  regions: boolean;
  villes: boolean;
}

interface ErrorState {
  clients: boolean;
  sites: boolean;
  regions: boolean;
  villes: boolean;
}

interface UseContactFormReturn {
  formData: ContactEdit;
  setFormData: React.Dispatch<React.SetStateAction<ContactEdit>>;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  errors: FormErrors;
  loadingState: LoadingState;
  errorState: ErrorState;
  clients: ClientBase[];
  sites: SiteDetail[];
  regions: Region[];
  villes: Ville[];
  handleFieldChange: <K extends keyof ContactEdit>(field: K, value: ContactEdit[K]) => void;
  getFilteredSites: () => SiteDetail[];
  getFilteredVilles: () => Ville[];
  validateTab: (tabId: TabId) => FormErrors;
  refreshData: () => Promise<void>;
}

export const useContactForm = (initialData: ContactEdit): UseContactFormReturn => {
  // États du formulaire
  const [formData, setFormData] = useState<ContactEdit>(initialData);
  const [activeTab, setActiveTab] = useState<TabId>('info');
  const [errors, setErrors] = useState<FormErrors>({});
  
  // États de chargement et d'erreur détaillés
  const [loadingState, setLoadingState] = useState<LoadingState>({
    clients: false,
    sites: false,
    regions: false,
    villes: false
  });
  
  const [errorState, setErrorState] = useState<ErrorState>({
    clients: false,
    sites: false,
    regions: false,
    villes: false
  });

  // États des données
  const [clients, setClients] = useState<ClientBase[]>([]);
  const [sites, setSites] = useState<SiteDetail[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);

  const { clientService, siteService, regionService, villeService } = useServices();

  // Validation de l'email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validation par onglet
  const validateTab = useCallback((tabId: TabId): FormErrors => {
    const newErrors: FormErrors = {};

    switch (tabId) {
      case 'info':
        if (!formData.email) {
          newErrors.email = 'L\'email est requis';
        } else if (!validateEmail(formData.email)) {
          newErrors.email = 'Email invalide';
        }
        break;
      case 'adresse':
        if (formData.region && !formData.ville) {
          newErrors.ville = 'La ville est requise si une région est sélectionnée';
        }
        break;
    }

    return newErrors;
  }, [formData]);

  // Fonctions de chargement des données
  const fetchData = async <T,>(
    service: () => Promise<T[]>,
    setData: (data: T[]) => void,
    dataType: keyof LoadingState
  ) => {
    setLoadingState(prev => ({ ...prev, [dataType]: true }));
    setErrorState(prev => ({ ...prev, [dataType]: false }));
    
    try {
      const response = await service();
      setData(response);
    } catch (error) {
      console.error(`Error fetching ${dataType}:`, error);
      setErrorState(prev => ({ ...prev, [dataType]: true }));
      setErrors(prev => ({ 
        ...prev, 
        fetch: `Erreur lors du chargement des ${dataType}` 
      }));
    } finally {
      setLoadingState(prev => ({ ...prev, [dataType]: false }));
    }
  };

  const fetchClients = useCallback(() => 
    fetchData(clientService.getAll, setClients, 'clients'), 
    [clientService]
  );

  const fetchSites = useCallback(() => 
    fetchData(siteService.getAll, setSites, 'sites'),
    [siteService]
  );

  const fetchRegions = useCallback(() => 
    fetchData(regionService.getAll, setRegions, 'regions'),
    [regionService]
  );

  const fetchVilles = useCallback(() => 
    fetchData(villeService.getAll, setVilles, 'villes'),
    [villeService]
  );

  // Filtres
  const getFilteredSites = useCallback((): SiteDetail[] => {
    if (!formData.client) return [];
    return sites.filter(site => site.client.id === formData.client);
  }, [formData.client, sites]);

  const getFilteredVilles = useCallback((): Ville[] => {
    if (!formData.region) return [];
    return villes.filter(ville => ville.region.id === formData.region);
  }, [formData.region, villes]);

  // Gestion des changements de champs
  const handleFieldChange = <K extends keyof ContactEdit>(
    field: K,
    value: ContactEdit[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Réinitialisation des champs dépendants
    switch (field) {
      case 'client':
        setFormData(prev => ({ ...prev, site: undefined }));
        break;
      case 'region':
        setFormData(prev => ({ ...prev, ville: undefined }));
        break;
    }
  };

  // Chargement initial des données
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchClients(),
        fetchSites(),
        fetchRegions(),
        fetchVilles()
      ]);
    };

    loadAllData().catch(error => {
      console.error('Error loading initial data:', error);
    });
  }, [fetchClients, fetchRegions, fetchSites, fetchVilles]);

  // Validation à chaque changement d'onglet
  useEffect(() => {
    const tabErrors = validateTab(activeTab);
    setErrors(prev => ({ ...prev, ...tabErrors }));
  }, [activeTab, validateTab]);

  // Fonction de rafraîchissement des données
  const refreshData = async () => {
    await Promise.all([
      fetchClients(),
      fetchSites(),
      fetchRegions(),
      fetchVilles()
    ]);
  };

  return {
    formData,
    setFormData,
    activeTab,
    setActiveTab,
    errors,
    loadingState,
    errorState,
    clients,
    sites,
    regions,
    villes,
    handleFieldChange,
    getFilteredSites,
    getFilteredVilles,
    validateTab,
    refreshData
  };
};