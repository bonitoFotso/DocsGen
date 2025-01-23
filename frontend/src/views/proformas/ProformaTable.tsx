import React from 'react';
import { Building2, Calendar, Loader2, Pencil, Trash2, Send, CheckCircle } from 'lucide-react';
import { DocumentStatus, ProformaBase, ProformaDetail } from '@/interfaces';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/utils/dateHelpers';

interface ProformaTableProps {
  proformas: ProformaBase[];
  isLoading: boolean;
  isDeleting: number | null;
  onEdit: (proforma: ProformaBase) => void;
  onDelete: (id: number) => void;
  onRowClick: (proforma: ProformaBase) => void;
  onStatusChange: (proforma: ProformaBase, newStatus: DocumentStatus) => Promise<void>;
  isStatusChanging: number | null;
}

export const ProformaTable: React.FC<ProformaTableProps> = ({
  proformas,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
  onRowClick,
  onStatusChange,
  isStatusChanging,
}) => {
  if (isLoading && !proformas.length) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4 text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
            <span className="ml-2 text-gray-600">Chargement...</span>
          </div>
        </td>
      </tr>
    );
  }

  if (proformas.length === 0) {
    return (
      <tr>
        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
          Aucune proforma trouvée
        </td>
      </tr>
    );
  }

  const renderStatusButton = (proforma: ProformaBase) => {
    const isChanging = isStatusChanging === proforma.id;

    if (proforma.statut === 'BROUILLON') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Voulez-vous envoyer cette proforma ?')) {
              onStatusChange(proforma, 'ENVOYE');
            }
          }}
          disabled={isChanging}
          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 inline-flex items-center mr-2"
        >
          {isChanging ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-1" />
          )}
          Envoyer
        </button>
      );
    }

    if (proforma.statut === 'ENVOYE') {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Voulez-vous valider cette proforma ?')) {
              onStatusChange(proforma, 'VALIDE');
            }
          }}
          disabled={isChanging}
          className="text-green-600 hover:text-green-800 transition-colors duration-200 inline-flex items-center mr-2"
        >
          {isChanging ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-1" />
          )}
          Valider
        </button>
      );
    }

    return null;
  };

  return (
    <>
      {proformas.map((proforma) => (
        <tr 
          key={proforma.id} 
          className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
          onClick={() => onRowClick(proforma)}
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">{proforma.reference}</div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="h-4 w-4 mr-2" />
              <span>{(proforma as ProformaDetail).client_nom || 'Client inconnu'}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(proforma.date_creation)}</span>
            </div>
          </td>
          <td className="px-6 py-4">
            <StatusBadge status={proforma.statut} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
            {renderStatusButton(proforma)}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(proforma);
              }}
              className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200 inline-flex items-center"
              disabled={isLoading}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Modifier
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(proforma.id);
              }}
              className="text-red-600 hover:text-red-900 transition-colors duration-200 inline-flex items-center"
              disabled={isDeleting === proforma.id}
            >
              {isDeleting === proforma.id ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Supprimer
            </button>
          </td>
        </tr>
      ))}
    </>
  );
};