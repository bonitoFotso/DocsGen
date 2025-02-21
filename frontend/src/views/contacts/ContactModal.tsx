// ContactModal.tsx
import React from 'react';
import { ContactEdit, TabId, useContactForm } from './components/useContactForm';
import { InfoTab, EntrepriseTab, AdresseTab } from './FormTabs';
import { Building, User, MapPin } from 'lucide-react';

interface ContactModalProps {
  title: string;
  initialData: ContactEdit;
  onClose: () => void;
  onSubmit: (data: ContactEdit) => Promise<void>;
  isSubmitting?: boolean;
}

interface Tab {
  id: TabId;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const tabs: readonly Tab[] = [
  { id: 'info', label: 'Informations', icon: User },
  { id: 'entreprise', label: 'Entreprise', icon: Building },
  { id: 'adresse', label: 'Adresse', icon: MapPin },
] as const;

const transformInitialData = (data: ContactEdit): ContactEdit => {
  const transformed = { ...data };

  // Helper pour transformer les objets en IDs
  const transformObjectToId = (obj: any): number | undefined => {
    if (obj && typeof obj === 'object' && 'id' in obj) {
      return obj.id;
    }
    return obj;
  };

  transformed.client = transformObjectToId(transformed.client);
  transformed.site = transformObjectToId(transformed.site);
  transformed.region = transformObjectToId(transformed.region);
  transformed.ville = transformObjectToId(transformed.ville);

  return transformed;
};

export const ContactModal: React.FC<ContactModalProps> = ({
  title,
  initialData,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const transformedInitialData = React.useMemo(
    () => transformInitialData(initialData),
    [initialData]
  );

  const {
    formData,
    activeTab,
    setActiveTab,
    errors,
    isLoading,
    clients,
    regions,
    handleFieldChange,
    getFilteredSites,
    getFilteredVilles,
  } = useContactForm(transformedInitialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(transformInitialData(formData));
  };

  const filteredSites = React.useMemo(() => getFilteredSites(), [getFilteredSites]);
  const filteredVilles = React.useMemo(() => getFilteredVilles(), [getFilteredVilles]);

  // Préparation des options avec useMemo pour éviter les recalculs inutiles
  const options = React.useMemo(() => ({
    clients: clients.map(client => ({
      value: client.id.toString(),
      label: client.nom || 'Client sans nom'
    })),
    sites: filteredSites.map(site => ({
      value: site.id.toString(),
      label: site.nom || 'Site sans nom'
    })),
    regions: regions.map(region => ({
      value: region.id.toString(),
      label: region.nom || 'Region sans nom'
    })),
    villes: filteredVilles.map(ville => ({
      value: ville.id.toString(),
      label: ville.nom || 'Ville sans nom'
    }))
  }), [clients, filteredSites, regions, filteredVilles]);

  const TabButton = React.memo(({ tab }: { tab: Tab }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab.id)}
      className={`
        py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm
        ${activeTab === tab.id
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      <tab.icon className="h-4 w-4" />
      <span>{tab.label}</span>
    </button>
  ));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6" aria-label="Tabs">
            {tabs.map(tab => (
              <TabButton key={tab.id} tab={tab} />
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === 'info' && (
              <InfoTab
                formData={formData}
                handleFieldChange={handleFieldChange}
                errors={errors}
              />
            )}

            {activeTab === 'entreprise' && (
              <EntrepriseTab
                formData={formData}
                handleFieldChange={handleFieldChange}
                errors={errors}
                isLoading={isLoading}
                options={options}
              />
            )}

            {activeTab === 'adresse' && (
              <AdresseTab
                formData={formData}
                handleFieldChange={handleFieldChange}
                errors={errors}
                isLoading={isLoading}
                options={options}
              />
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.email || Object.keys(errors).length > 0}
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(ContactModal);