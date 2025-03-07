import React, { useState, useEffect, useCallback } from 'react';
import {  Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Client } from '@/types/client';
import ClientCard from './components/ClientCard';



interface ClientManagementProps {
  onClientSelect?: (clientId: number) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({
  onClientSelect
}) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { clientService } = useServices();

  const loadClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getAll();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  }, [clientService]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleClientClick = (clientId: number): void => {
    if (onClientSelect) {
      onClientSelect(clientId);
    } else {
      navigate(`/clients/${clientId}`);
    }
  };

  const handleNewClient = () => {
    navigate('/clients/new');
  };


  const filteredClients = clients.filter(client =>
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Clients</h1>
        <Button
          onClick={handleNewClient}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouveau Client
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Rechercher un client..."
        className="w-full mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredClients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun client trouvé
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client: Client) => (
  <ClientCard
    key={client.id}
    client={client}
    onClick={() => handleClientClick(client.id)}
  />
))}
        </div>
      )}
    </div>
  );
};

export default ClientManagement;