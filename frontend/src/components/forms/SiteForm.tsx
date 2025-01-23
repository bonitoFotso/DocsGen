import { useState } from "react";
import { useClient } from "../../contexts/ClientContext";
import { useSite } from "../../contexts/SiteContext";
import { useModal } from "../../hooks/useModal";

// ISite Form
export const SiteForm: React.FC = () => {

    // Utility function for handling form changes
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setter: React.Dispatch<React.SetStateAction<typeof site>>) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };
  
    const [site, setSite] = useState({ id: 0, nom: '', client: 0, localisation: '', description: '' });

    const { clients } = useClient();
    const { createSite, fetchSites } = useSite();
    const { closeModal } = useModal();
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      createSite(site);
      fetchSites();
        closeModal();
      console.log(site); // Replace with your logic
    };
  
    return (
      <form onSubmit={handleSubmit} className="p-4 space-y-4 bg-gray-100 rounded">
        <label htmlFor="nom">Nom</label>
        <input
          type="text"
          name="nom"
          placeholder="Nom"
          value={site.nom}
          onChange={(e) => handleChange(e, setSite)}
          className="block w-full p-2 border rounded"
        />
        <label htmlFor="client">Client</label>
        <select
          name="client"
          value={site.client}
          onChange={(e) => handleChange(e, setSite)}
          className="block w-full p-2 border rounded">
            <option value="">Sélectionnez un client</option>
                {clients?.map((cli) => (
                  <option key={cli.id} value={cli.id}>{cli.nom}</option>
                ))}
              </select>
        <input
          type="text"
          name="localisation"
          placeholder="Localisation"
          value={site.localisation || ''}
          onChange={(e) => handleChange(e, setSite)}
          className="block w-full p-2 border rounded"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={site.description || ''}
          onChange={(e) => handleChange(e, setSite)}
          className="block w-full p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
      </form>
    );
  };
  