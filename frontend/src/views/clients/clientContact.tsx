import React, { useState } from 'react';
import { Building, Users, ChevronRight, ChevronLeft, Mail, Phone, User, Briefcase } from 'lucide-react';

interface Contact {
  id: number;
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  client_nom: string;
  poste: string | null;
}

interface Client {
  id: number;
  nom: string;
  c_num: string;
  email: string;
  telephone: string;
  matricule: string;
  ville: number;
  agreer: boolean;
  agreement_fournisseur: boolean;
  secteur_activite: string;
  contacts_count: number;
  contacts: Contact[];
}

interface ClientWizardProps {
  clients: Client[];
}

const ClientWizard: React.FC<ClientWizardProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentStep, setCurrentStep] = useState<'clients' | 'details' | 'contacts'>('clients');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.secteur_activite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setCurrentStep('details');
  };

  const renderClientsList = () => (
    <div className="space-y-4">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un client ou un secteur..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors"
            onClick={() => handleClientSelect(client)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{client.nom}</h3>
                <p className="text-sm text-gray-500">{client.secteur_activite}</p>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Users className="h-4 w-4" />
                <span className="text-sm">{client.contacts_count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClientDetails = () => {
    if (!selectedClient) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations générales</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Building className="h-5 w-5" />
                  <span>{selectedClient.nom}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${selectedClient.email}`} className="text-indigo-600 hover:text-indigo-800">
                    {selectedClient.email}
                  </a>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-5 w-5" />
                  <a href={`tel:${selectedClient.telephone}`} className="text-indigo-600 hover:text-indigo-800">
                    {selectedClient.telephone}
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations complémentaires</h3>
              <div className="space-y-3">
                <p className="text-gray-600">Matricule: {selectedClient.matricule}</p>
                <p className="text-gray-600">Numéro client: {selectedClient.c_num}</p>
                <p className="text-gray-600">Secteur: {selectedClient.secteur_activite}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('clients')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </button>
          <button
            onClick={() => setCurrentStep('contacts')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
          >
            Voir les contacts
            <ChevronRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    );
  };

  const renderContacts = () => {
    if (!selectedClient) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedClient.contacts.map(contact => (
            <div key={contact.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-400" />
                  <h3 className="font-medium text-gray-900">
                    {contact.nom} {contact.prenom}
                  </h3>
                </div>
                {contact.poste && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Briefcase className="h-4 w-4" />
                    <span>{contact.poste}</span>
                  </div>
                )}
                {contact.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <a href={`mailto:${contact.email}`} className="text-indigo-600 hover:text-indigo-800">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.telephone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a href={`tel:${contact.telephone}`} className="text-indigo-600 hover:text-indigo-800">
                      {contact.telephone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep('details')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour aux détails
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center space-x-4 border-b border-gray-200 pb-4">
        <div className={`flex items-center ${currentStep === 'clients' ? 'text-indigo-600' : 'text-gray-500'}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Building className="h-5 w-5" />
          </div>
          <span className="ml-2 font-medium">Clients</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className={`flex items-center ${currentStep === 'details' ? 'text-indigo-600' : 'text-gray-500'}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Building className="h-5 w-5" />
          </div>
          <span className="ml-2 font-medium">Détails</span>
        </div>
        <ChevronRight className="h-4 w-4 text-gray-400" />
        <div className={`flex items-center ${currentStep === 'contacts' ? 'text-indigo-600' : 'text-gray-500'}`}>
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <span className="ml-2 font-medium">Contacts</span>
        </div>
      </div>

      {currentStep === 'clients' && renderClientsList()}
      {currentStep === 'details' && renderClientDetails()}
      {currentStep === 'contacts' && renderContacts()}
    </div>
  );
};

export default ClientWizard;