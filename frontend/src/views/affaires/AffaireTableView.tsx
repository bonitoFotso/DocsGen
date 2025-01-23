import { AffaireBase } from '@/interfaces';
import { Calendar, Eye, Loader2, Pencil, SortAsc, SortDesc, Trash2 } from 'lucide-react';
import { StatusBadge } from './AffaireStatus';
import { formatDate } from '@/utils/dateHelpers';

interface AffaireTableViewProps {
  affaires: AffaireBase[];
  sortField: 'reference' | 'date_debut' | 'date_fin_prevue';
  sortDirection: 'asc' | 'desc';
  isDeleting: number | null;
  onSort: (field: 'reference' | 'date_debut' | 'date_fin_prevue') => void;
  onView: (affaire: AffaireBase) => void;
  onEdit: (affaire: AffaireBase) => void;
  onDelete: (id: number) => void;
}

export const AffaireTableView = ({
  affaires,
  sortField,
  sortDirection,
  isDeleting,
  onSort,
  onView,
  onEdit,
  onDelete
}: AffaireTableViewProps) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left">
            <button
              className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              onClick={() => onSort('reference')}
            >
              Référence
              {sortField === 'reference' && (
                sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </button>
          </th>
          <th className="px-6 py-3 text-left">
            <button
              className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              onClick={() => onSort('date_debut')}
            >
              Date Début
              {sortField === 'date_debut' && (
                sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </button>
          </th>
          <th className="px-6 py-3 text-left">
            <button
              className="flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider"
              onClick={() => onSort('date_fin_prevue')}
            >
              Date Fin Prévue
              {sortField === 'date_fin_prevue' && (
                sortDirection === 'asc' ? <SortAsc className="ml-1 h-4 w-4" /> : <SortDesc className="ml-1 h-4 w-4" />
              )}
            </button>
          </th>
          <th className="px-6 py-3 text-left">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </span>
          </th>
          <th className="px-6 py-3 text-right">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {affaires.map((affaire) => (
          <tr key={affaire.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm text-gray-900">{affaire.reference}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(affaire.date_debut)}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {affaire.date_fin_prevue ? formatDate(affaire.date_fin_prevue) : '-'}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <StatusBadge status={affaire.statut} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                onClick={() => onView(affaire)}
                className="text-gray-600 hover:text-gray-900 mx-2"
              >
                <Eye className="h-4 w-4" />
              </button>
              <button
                onClick={() => onEdit(affaire)}
                className="text-blue-600 hover:text-blue-900 mx-2"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(affaire.id)}
                disabled={isDeleting === affaire.id}
                className="text-red-600 hover:text-red-900 mx-2 disabled:opacity-50"
              >
                {isDeleting === affaire.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);