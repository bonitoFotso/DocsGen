import { AffaireBase } from '@/interfaces';
import { Calendar, Eye, Loader2, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge } from './AffaireStatus';
import { formatDate } from '@/utils/dateHelpers';

interface AffaireGridViewProps {
  affaires: AffaireBase[];
  isDeleting: number | null;
  onView: (affaire: AffaireBase) => void;
  onEdit: (affaire: AffaireBase) => void;
  onDelete: (id: number) => void;
}

export const AffaireGridView = ({
  affaires,
  isDeleting,
  onView,
  onEdit,
  onDelete
}: AffaireGridViewProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {affaires.map((affaire) => (
      <div key={affaire.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{affaire.reference}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Créée le {formatDate(affaire.date_debut)}
              </p>
            </div>
            <StatusBadge status={affaire.statut} />
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>
                Fin prévue : {affaire.date_fin_prevue ? formatDate(affaire.date_fin_prevue) : '-'}
              </span>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => onView(affaire)}
              className="p-1 text-gray-600 hover:text-gray-900 rounded transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEdit(affaire)}
              className="p-1 text-blue-600 hover:text-blue-900 rounded transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(affaire.id)}
              disabled={isDeleting === affaire.id}
              className="p-1 text-red-600 hover:text-red-900 rounded transition-colors disabled:opacity-50"
            >
              {isDeleting === affaire.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);