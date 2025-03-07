import React from 'react';
import { ChevronDown } from 'lucide-react';
import { ClientBase, EntityBase, OffreEdit } from '@/interfaces';
import { FormField } from './FormField';
import { Contact } from '@/types/contact';

interface InfoTabProps {
  formData: OffreEdit;
  setFormData: React.Dispatch<React.SetStateAction<OffreEdit>>;
  clients: ClientBase[];
  entities: EntityBase[];
  contacts: Contact[];
}

export const InfoTab: React.FC<InfoTabProps> = ({
  formData,
  setFormData,
  clients,
  entities,
}) => {
  const statusColors = {
    BROUILLON: 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-50',
    ENVOYE: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    VALIDE: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    REFUSE: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    EN_COURS: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    TERMINEE: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    ANNULEE: 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-50',
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
      <FormField label="Entité" required>
          <div className="group relative">
            <select
              value={formData.entity}
              onChange={(e) => setFormData({ ...formData, entity: Number(e.target.value) })}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            >
              <option value="">Sélectionnez une entité</option>
              {entities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
          </div>
        </FormField>


      </div>
      <div className="grid grid-cols-2 gap-8">
      
        <FormField label="Client" required>
          <div className="group relative">
            <select
              value={formData.client}
              onChange={(e) => {
                const newClientId = Number(e.target.value);
                setFormData({
                  ...formData,
                  client: newClientId,
                });
              }}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            >
              <option value="">Sélectionnez un client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nom}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
          </div>
        </FormField>

        <FormField label="Contant" required>
          <div className="group relative">
            <select
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: Number(e.target.value) })}
              required
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all duration-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
            >
              <option value="">Sélectionnez une entité</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
          </div>
        </FormField>


      </div>


      <FormField label="Statut">
        <div className="group relative">
          <select
            value={formData.statut}
            onChange={(e) =>
              setFormData({ ...formData, statut: e.target.value as OffreEdit['statut'] })
            }
            className={`w-full px-4 py-3.5 rounded-xl border appearance-none transition-all duration-200 focus:ring-4 focus:ring-purple-100 ${
              statusColors[formData.statut as keyof typeof statusColors]
            }`}
          >
            <option value="BROUILLON">Brouillon</option>
            <option value="ENVOYE">Envoyé</option>
            <option value="VALIDE">Validé</option>
            <option value="REFUSE">Refusé</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINEE">Terminée</option>
            <option value="ANNULEE">Annulée</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors duration-200 pointer-events-none h-5 w-5" />
        </div>
      </FormField>
    </div>
  );
};