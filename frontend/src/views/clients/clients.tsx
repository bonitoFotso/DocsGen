import React, { useCallback, useEffect, useState } from 'react';
import { 
  PlusCircle, 
  AlertCircle, 
  X, 
  Building2 
} from 'lucide-react';
import ClientModal from './ClientModal';
import { Alert, AlertDescription } from '@/common/CustomAlert';
import ClientTable from '../contacts/components/ClientTable';
import { clientService } from '@/clientServices';
import { ClientList } from '@/itf';

interface ClientService {
  getAll: () => Promise<ClientBase[]>;
  getById: (id: number) => Promise<ClientDetail>;
  create: (client: ClientEdit) => Promise<void>;
  update: (id: number, client: ClientEdit) => Promise<void>;
  delete: (id: number) => Promise<void>;
}

interface ClientBase {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

interface ClientDetail extends ClientBase {
  // Add any additional fields for detailed view
}

interface ClientEdit {
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
}

interface ClientManagementProps {
  clientService: ClientService;
}

const initialFormData: ClientEdit = {
  nom: '',
  email: '',
  telephone: '',
  adresse: ''
};

const ClientManagement: React.FC<ClientManagementProps> = () => {
  // State management
  const [clients, setClients] = useState<ClientList>([]);
  const [currentClient, setCurrentClient] = useState<ClientDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ClientEdit>(initialFormData);

  // Fetch clients
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
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Form handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentClient) {
        await clientService.update(currentClient.id, formData);
      } else {
        await clientService.create(formData);
      }
      setIsModalOpen(false);
      await loadClients();
      resetForm();
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (client: ClientBase) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const detailedClient = await clientService.getById(client.id);
      setCurrentClient(detailedClient);
      setFormData({
        nom: detailedClient.nom,
        email: detailedClient.email || '',
        telephone: detailedClient.telephone || '',
        adresse: detailedClient.adresse || ''
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading client details:', err);
      setError('Erreur lors du chargement du client');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }
    
    setIsDeleting(id);
    setError(null);
    
    try {
      await clientService.delete(id);
      await loadClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentClient(null);
    setFormData(initialFormData);
    setError(null);
  };

  const handleNewClient = () => {
    resetForm();
    setIsModalOpen(true);
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.telephone?.includes(searchTerm))
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Gestion des Clients</h1>
          </div>
          <button
            onClick={handleNewClient}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
            disabled={isLoading}
          >
            <PlusCircle className="h-5 w-5" />
            Nouveau Client
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="flex justify-between items-center w-full">
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <ClientTable
            clients={clients}
            filteredClients={filteredClients}
            isLoading={isLoading}
            isDeleting={isDeleting}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        currentClient={currentClient?.id}
        onSuccess={loadClients}
      />
    </div>
  );
};

export default ClientManagement;