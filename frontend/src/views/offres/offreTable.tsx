import React from 'react';
import { Building2, Calendar, Loader2, ArrowUpDown, CheckCircle2, AlertCircle, Clock, Send } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import { formatDate } from '@/utils/dateHelpers';
import { useNavigate } from 'react-router-dom';
import { OffreDetail } from '@/types/offre';
interface OffreTableProps {
  offres: OffreDetail[];
  isLoading: boolean;
  onEdit: (offre: OffreDetail) => void;
  onDelete: (id: number) => void;
  isDeleting: number | null;
}

export const OffreTable: React.FC<OffreTableProps> = ({
  offres,
  isLoading,
}) => {
  const { items: sortedOffres, requestSort } = useSortableData(offres, {
    key: 'date_creation',
    direction: 'desc',
  });
  const navigate = useNavigate();

  const columns = [
    { key: 'reference' as keyof OffreDetail, label: 'Référence' },
    { key: 'id' as keyof OffreDetail, label: 'Client' },
    { key: 'date_creation' as keyof OffreDetail, label: 'Date Création' },
    { key: 'statut' as keyof OffreDetail, label: 'Statut' },
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
      case 'GAGNE':
        return 'bg-green-100 text-green-800 ring-1 ring-green-300';
      case 'EN_COURS':
        return 'bg-blue-100 text-blue-800 ring-1 ring-blue-300';
      case 'ENVOYE':
        return 'bg-purple-100 text-purple-800 ring-1 ring-purple-300';
      case 'PERDU':
        return 'bg-red-100 text-red-800 ring-1 ring-red-300';
      default:
        return 'bg-gray-100 text-gray-800 ring-1 ring-gray-300';
    }
  }

  function getStatusIcon(statut: string): React.ReactNode {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return <Clock className="h-3.5 w-3.5 mr-1" />;
      case 'GAGNE':
        return <CheckCircle2 className="h-3.5 w-3.5 mr-1" />;
      case 'EN_COURS':
        return <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />;
      case 'ENVOYE':
        return <Send className="h-3.5 w-3.5 mr-1" />;
      case 'PERDU':
        return <AlertCircle className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  }

  function getStatusLabel(statut: string): string {
    switch (statut.toUpperCase()) {
      case 'BROUILLON':
        return 'Brouillon';
      case 'GAGNE':
        return 'Gagné';
      case 'EN_COURS':
        return 'En cours';
      case 'ENVOYE':
        return 'Envoyé';
      case 'PERDU':
        return 'Perdu';
      default:
        return statut;
    }
  }

  const handleDetailsClick = ( id: number) => {
    navigate(`/offres/${id}`);
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
                    onClick={() =>  requestSort(key)}
                    className={`flex items-center gap-1.5 text-xs font-semibold text-gray-600 uppercase tracking-wider group `}
                    
                  >
                    {label}
                    { (
                      <ArrowUpDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedOffres.map((offre: OffreDetail) => (
              <tr
                key={offre.id}
                onClick={() => handleDetailsClick(offre.id)}
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
                    <span className="truncate max-w-[200px]">{offre.client.nom}</span>
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
                
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

