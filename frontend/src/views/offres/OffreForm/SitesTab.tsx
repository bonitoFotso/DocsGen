import React from 'react';
import { OffreEdit, SiteBase } from '@/interfaces';
import { FormField } from './FormField';

interface SitesTabProps {
  formData: OffreEdit;
  setFormData: React.Dispatch<React.SetStateAction<OffreEdit>>;
  sites: SiteBase[];
}

export const SitesTab: React.FC<SitesTabProps> = ({
  formData,
  setFormData,
  sites,
}) => {
  const filteredSites = formData.client
    ? sites.filter(site => site.clientId === formData.client)
    : [];

  return (
    <FormField 
      label="Sites" 
      helpText={formData.client 
        ? `${filteredSites.length} site(s) disponible(s)` 
        : "Veuillez d'abord sélectionner un client"}
    >
      <select
        multiple
        value={(formData.sites ?? []).map(String)}
        onChange={(e) =>
          setFormData({
            ...formData,
            sites: Array.from(e.target.selectedOptions, (option) => Number(option.value)),
          })
        }
        className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 min-h-[400px] transition-all duration-200 hover:border-gray-300 bg-white scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        {formData.client ? (
          filteredSites.length > 0 ? (
            filteredSites.map((site) => (
              <option 
                key={site.id} 
                value={site.id}
                className="py-2.5 px-2 hover:bg-purple-50 cursor-pointer transition-colors duration-150"
              >
                {site.nom}
              </option>
            ))
          ) : (
            <option disabled value="" className="py-2.5 px-2 text-gray-500 italic">
              Aucun site disponible pour ce client
            </option>
          )
        ) : (
          <option disabled value="" className="py-2.5 px-2 text-gray-500 italic">
            Veuillez d'abord sélectionner un client
          </option>
        )}
      </select>
    </FormField>
  );
};