import React, { useState } from 'react';
import { 
  ChevronRight, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  User,
  Building2,
  MapPin,
  Package,
  Clock,
  FileSearch
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { IRapport } from '@/interfaces';


interface RapportsListProps {
  rapports: IRapport[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'EN_COURS':
      return 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100/50';
    case 'TERMINE':
      return 'bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-100/50';
    case 'BROUILLON':
      return 'bg-gray-50 text-gray-600 border-gray-100 shadow-sm';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-100 shadow-sm';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'EN_COURS':
      return <AlertCircle className="w-4 h-4" />;
    case 'TERMINE':
      return <CheckCircle2 className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

const RapportsList: React.FC<RapportsListProps> = ({ rapports }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {rapports.map((rapport) => (
        <div
          key={rapport.id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg group"
        >
          {/* En-tête du rapport */}
          <div
            onClick={() => toggleExpand(rapport.id)}
            className="p-5 cursor-pointer flex items-center justify-between hover:bg-gray-50/80 transition-colors"
          >
            <div className="flex items-center gap-6">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white transition-colors">
                <FileSearch className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {rapport.reference}
                </span>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  {format(new Date(rapport.date_creation), 'dd MMMM yyyy', { locale: fr })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(rapport.statut)} flex items-center gap-1.5`}>
                {getStatusIcon(rapport.statut)}
                {rapport.statut.replace('_', ' ')}
              </span>
              <ChevronRight
                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                  expandedId === rapport.id ? 'rotate-90' : ''
                }`}
              />
            </div>
          </div>

          {/* Détails du rapport */}
          {expandedId === rapport.id && (
            <div className="border-t border-gray-100">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                {/* Informations principales */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Informations générales
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Entité
                      </span>
                      <p className="text-sm font-medium text-gray-900">{rapport.entity.name}</p>
                      <p className="text-xs text-gray-500">Code: {rapport.entity.code}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Numéro de séquence
                      </span>
                      <p className="text-sm font-medium text-gray-900">#{rapport.sequence_number}</p>
                    </div>
                  </div>
                </div>

                {/* Client et Site */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    Client et Site
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5" />
                        Client
                      </span>
                      <p className="text-sm font-medium text-gray-900">{rapport.client.nom}</p>
                      {rapport.client.email && (
                        <p className="text-xs text-gray-500">{rapport.client.email}</p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Site d'intervention
                      </span>
                      <p className="text-sm font-medium text-gray-900">{rapport.site.nom}</p>
                      {rapport.site.localisation && (
                        <p className="text-xs text-gray-500">{rapport.site.localisation}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Produit */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-500" />
                    Produit
                  </h4>
                  <div className="p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs font-medium text-gray-500">Catégorie</span>
                        <p className="text-sm font-medium text-gray-900">{rapport.produit.category.name}</p>
                        <p className="text-xs text-gray-500">Code: {rapport.produit.category.code}</p>
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-500">Produit</span>
                        <p className="text-sm font-medium text-gray-900">{rapport.produit.name}</p>
                        <p className="text-xs text-gray-500">Code: {rapport.produit.code}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RapportsList;