import React from 'react';
import { X, Building2, Calendar, FileText, Briefcase, Clock } from 'lucide-react';
import { ProformaDetail } from '@/interfaces';
import { StatusBadge } from './StatusBadge';
import { formatDate } from '@/utils/dateHelpers';

interface ProformaDetailsProps {
  proforma: ProformaDetail;
  onClose: () => void;
}

export const ProformaDetails: React.FC<ProformaDetailsProps> = ({ proforma, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-xl w-full max-w-2xl transform transition-all duration-200 animate-slideIn">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-600" />
              Détails de la Proforma
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Référence</h3>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {proforma.reference}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Client</h3>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    {proforma.client_nom}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Entité</h3>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-gray-400" />
                    {proforma.entity.name}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(proforma.date_creation)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Statut</h3>
                  <div className="mt-1">
                    <StatusBadge status={proforma.statut} />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Offre associée</h3>
                  <p className="mt-1 text-sm text-gray-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    {proforma.offre.reference}
                  </p>
                </div>
              </div>
            </div>

            {proforma.date_modification && (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Dernière modification le {formatDate(proforma.date_modification)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};