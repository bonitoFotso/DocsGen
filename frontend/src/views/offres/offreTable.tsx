import React, { useState } from 'react';
import { OffreBase } from '@/interfaces';
import { Building2, Calendar, Loader2, Trash2, Pencil, ArrowUpDown, CheckCircle2, AlertCircle, Clock, Send, XCircle } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import { formatDate } from '@/utils/dateHelpers';

interface OffreTableProps {
  offres: OffreBase[];
  isLoading: boolean;
  onViewDetails: (offre: OffreBase) => void;
  onEdit: (offre: OffreBase) => void;
  onDelete: (id: number) => void;
  isDeleting: number | null;
}

export const OffreTable: React.FC<OffreTableProps> = ({
  offres,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null);
  const { items: sortedOffres, requestSort } = useSortableData(offres, {
    key: 'date_creation',
    direction: 'desc',
  });

  const columns = [
    { key: 'reference' as keyof OffreBase, label: 'Référence' },
    { key: 'id' as keyof OffreBase, label: 'Client' },
    { key: 'date_creation' as keyof OffreBase, label: 'Date Création' },
    { key: 'statut' as keyof OffreBase, label: 'Statut' },
    { key: 'actions' as const, label: 'Actions' },
  ];

  if (isLoading && !offres.length) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px] bg-white rounded-xl border border-gray-200">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
          <p className="text-gray-500 font-medium">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  function getStatusBadgeClass(statut: string) {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300';
      case 'VALIDE':
        return 'bg-green-100 text-green-800 ring-1 ring-green-300';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-300';
      case 'ENVOYE':
        return 'bg-purple-100 text-purple-800 ring-1 ring-purple-300';
      case 'REFUSE':
        return 'bg-red-100 text-red-800 ring-1 ring-red-300';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
    }
  }

  function getStatusIcon(statut: string): React.ReactNode {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case 'VALIDE':
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case 'EN_COURS':
        return <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />;
      case 'ENVOYE':
        return <Send className="h-3.5 w-3.5 mr-1" />;
      case 'REFUSE':
        return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  }

  function getStatusLabel(statut: string): string {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return 'Brouillon';
      case 'VALIDE':
        return 'Validé';
      case 'EN_COURS':
        return 'En cours';
      case 'ENVOYE':
        return 'Envoyé';
      case 'REFUSE':
        return 'Refusé';
      default:
        return statut;
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setDeleteConfirmation(id);
  };

  const handleConfirmDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    onDelete(id);
    setDeleteConfirmation(null);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmation(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              {columns.map(({ key, label }) => (
                <th key={key} className="px-6 py-4 text-left">
                  <button
                    onClick={() => key !== 'actions' && requestSort(key)}
                    className={`flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider group ${
                      key !== 'actions' ? 'hover:text-gray-900' : ''
                    }`}
                    disabled={key === 'actions'}
                  >
                    {label}
                    {key !== 'actions' && (
                      <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedOffres.map((offre: OffreBase) => (
              <tr
                key={offre.id}
                onClick={() => onViewDetails(offre)}
                className="group hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {offre.reference}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate max-w-[200px]">{offre.client_nom}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(offre.date_creation)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                      offre.statut
                    )}`}
                  >
                    {getStatusIcon(offre.statut)}
                    {getStatusLabel(offre.statut)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {deleteConfirmation === offre.id ? (
                      <div className="flex items-center gap-2 bg-red-50 py-1 px-2 rounded-lg">
                        <span className="text-xs text-red-700">Confirmer ?</span>
                        <button
                          onClick={(e) => handleConfirmDelete(e, offre.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1"
                          disabled={isDeleting === offre.id}
                        >
                          {isDeleting === offre.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancelDelete}
                          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(offre);
                          }}
                          className="p-1 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, offre.id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Supprimer"
                          disabled={isDeleting === offre.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

