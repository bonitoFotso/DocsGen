import React from 'react';
import { Building2, PlusCircle } from 'lucide-react';

interface ClientListHeaderProps {
  onNewClient: () => void;
}

export const ClientListHeader: React.FC<ClientListHeaderProps> = ({ onNewClient }) => (
  <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
    <div className="flex items-center gap-2">
      <Building2 className="h-6 w-6 text-blue-600" />
      <h1 className="text-2xl font-bold text-gray-800">Gestion des Clients</h1>
    </div>
    <button
      onClick={onNewClient}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
    >
      <PlusCircle className="h-5 w-5" />
      Nouveau Client
    </button>
  </div>
);