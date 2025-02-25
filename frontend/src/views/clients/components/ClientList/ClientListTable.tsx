import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Pencil, Trash2, Loader2 } from 'lucide-react';
import { ClientBase } from '@/interfaces';

interface ClientListTableProps {
  clients: ClientBase[];
  isLoading: boolean;
  onEdit: (client: ClientBase) => void;
  onDelete: (id: number) => void;
  isDeleting: number | null;
}

export const ClientListTable: React.FC<ClientListTableProps> = ({
  clients,
  isLoading,
  onEdit,
  onDelete,
  isDeleting
}) => {
  const navigate = useNavigate();

  const handleRowClick = (clientId: number) => {
    navigate(`/clients/${clientId}`);
  };

  const handleEditClick = (e: React.MouseEvent, client: ClientBase) => {
    e.stopPropagation(); // Empêche la propagation vers handleRowClick
    onEdit(client);
  };

  const handleDeleteClick = (e: React.MouseEvent, clientId: number) => {
    e.stopPropagation(); // Empêche la propagation vers handleRowClick
    onDelete(clientId);
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading && !clients.length ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Chargement...</span>
                </div>
              </td>
            </tr>
          ) : clients.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                Aucun client trouvé
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                onClick={() => handleRowClick(client.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.nom}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {client.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <a
                          href={`mailto:${client.email}`}
                          className="hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.email}
                        </a>
                      </div>
                    )}
                    {client.telephone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <a
                          href={`tel:${client.telephone}`}
                          className="hover:text-blue-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {client.telephone}
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {client.adresse && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate max-w-xs">{client.adresse}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button
                    onClick={(e) => handleEditClick(e, client)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200 inline-flex items-center"
                    disabled={isLoading}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Modifier
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, client.id)}
                    className="text-red-600 hover:text-red-900 transition-colors duration-200 inline-flex items-center"
                    disabled={isDeleting === client.id}
                  >
                    {isDeleting === client.id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-1" />
                    )}
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientListTable;