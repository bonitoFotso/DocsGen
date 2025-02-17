import React from 'react';
import { Calendar, User, Briefcase, Hash, X, Pencil, Trash2 } from 'lucide-react';
import { FactureDetail as IFactureDetail } from '@/interfaces';
import { StatusBadge } from '@/components/StatusBadge';

interface FactureDetailProps {
  facture: IFactureDetail;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const FactureDetail: React.FC<FactureDetailProps> = ({
  facture,
  onClose,
  onEdit,
  onDelete,
  isDeleting
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Facture {facture.reference}
              </h2>
              <StatusBadge status={facture.statut} />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
              >
                <Pencil className="h-5 w-5" />
              </button>
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="text-sm font-medium">
                    {new Date(facture.date_creation).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Numéro de séquence</p>
                  <p className="text-sm font-medium">{facture.sequence_number}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="text-sm font-medium">{facture.client.nom}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Affaire</p>
                  <p className="text-sm font-medium">{facture.affaire.reference}</p>
                </div>
              </div>
            </div>
          </div>

          {facture.fichier && (
            <div className="pt-6 border-t border-gray-200">
              <a
                href={facture.fichier}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl 
                         text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Télécharger le fichier
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};