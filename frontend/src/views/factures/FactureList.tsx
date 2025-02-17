import React from 'react';
import { FileText, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { FactureDetail } from '@/interfaces';
import { StatusBadge } from '@/components/StatusBadge';

interface FactureListProps {
  factures: FactureDetail[];
  isLoading: boolean;
  onViewDetails: (facture: FactureDetail) => void;
  onEdit: (facture: FactureDetail) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export const FactureList: React.FC<FactureListProps> = ({
  factures,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
  isDeleting
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des factures...</p>
      </div>
    );
  }

  if (factures.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Aucune facture trouvée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-100">
        {factures.map((facture) => (
          <li key={facture.id} className="hover:bg-gray-50 transition-colors">
            <div className="px-4 py-4 flex items-center justify-between">
              <button
                onClick={() => onViewDetails(facture)}
                className="flex-1 flex items-center text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <FileText className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{facture.reference}</p>
                    <p className="text-sm text-gray-500">
                      Client: {facture.client.nom} | Affaire: {facture.affaire.reference}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 ml-4">
                  <StatusBadge status={facture.statut} />
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </button>
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onEdit(facture)}
                  className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(facture.id)}
                  disabled={isDeleting}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};