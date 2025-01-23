import React from 'react';
import { OffreDetail } from '@/interfaces';
import { X, Building2, Package, MapPin, Calendar, Pencil, Trash2, Loader2 } from 'lucide-react';
import { formatDate } from '@/utils/dateHelpers';
import { getStatusBadgeClass, getStatusIcon, getStatusLabel } from '@/utils/statusHelpers';

interface OffreDetailsProps {
  offre: OffreDetail;
  onClose: () => void;
  onEdit: (offre: OffreDetail) => void;
  onDelete: (id: number) => void;
  isDeleting: number | null;
}

export const OffreDetails: React.FC<OffreDetailsProps> = ({
  offre,
  onClose,
  onEdit,
  onDelete,
  isDeleting,
}) => {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50">
      <div className="absolute inset-y-0 right-0 w-full max-w-xl bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Détails de l'offre</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Reference */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-purple-900 mb-2">{offre.reference}</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                    offre.statut
                  )}`}
                >
                  {getStatusIcon(offre.statut)}
                  {getStatusLabel(offre.statut)}
                </span>
              </div>

              {/* Sections */}
              <DetailSection
                icon={<Building2 className="h-5 w-5 text-gray-400" />}
                title="Information Client"
              >
                <p className="text-gray-600">{offre.client.nom}</p>
                <p className="text-sm text-gray-500">Entité: {offre.entity.name}</p>
              </DetailSection>

              <DetailSection icon={<Package className="h-5 w-5 text-gray-400" />} title="Produits">
                <ul className="space-y-2">
                  {offre.produit.map((product) => (
                    <li key={product.id} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-purple-400 rounded-full" />
                      {product.name}
                    </li>
                  ))}
                </ul>
              </DetailSection>

              <DetailSection icon={<MapPin className="h-5 w-5 text-gray-400" />} title="Sites">
                <ul className="space-y-2">
                  {offre.sites.map((site) => (
                    <li key={site.id} className="flex items-center gap-2 text-gray-600">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full" />
                      {site.nom}
                    </li>
                  ))}
                </ul>
              </DetailSection>

              <DetailSection icon={<Calendar className="h-5 w-5 text-gray-400" />} title="Dates">
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Créé le: {formatDate(offre.date_creation)}</p>
                  <p>Dernière modification: {formatDate(offre.date_modification)}</p>
                </div>
              </DetailSection>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={() => onEdit(offre)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
            >
              <Pencil className="h-4 w-4" />
              Modifier
            </button>
            <button
              onClick={() => onDelete(offre.id)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 transition-all duration-200"
              disabled={isDeleting === offre.id}
            >
              {isDeleting === offre.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div className="border-b pb-4">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h4 className="font-medium text-gray-900">{title}</h4>
    </div>
    {children}
  </div>
);