import React, { useState, useMemo } from 'react';
import { Search, Calendar, Building2, User2, Tag, Clock, ChevronDown, FileText, ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { IOffre } from '../../interfaces';
import OfferDetails from './OfferDetails'; // Importez le composant OfferDetails

interface OffersListProps {
  offers: IOffre[];
}

const OffersList: React.FC<OffersListProps> = ({ offers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [sortBy] = useState<'date' | 'reference'>('date');
  const [selectedOffer, setSelectedOffer] = useState<IOffre | null>(null); // État pour l'offre sélectionnée

  const entities = useMemo(() => {
    const uniqueEntities = new Set(offers.map(offer => offer.entity.name));
    return Array.from(uniqueEntities);
  }, [offers]);

  const statuses = useMemo(() => {
    const uniqueStatuses = new Set(offers.map(offer => offer.statut));
    return Array.from(uniqueStatuses);
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers
      .filter(offer => {
        const matchesSearch = 
          offer.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.produit.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesEntity = !entityFilter || offer.entity.name === entityFilter;
        const matchesStatus = !statusFilter || offer.statut === statusFilter;

        return matchesSearch && matchesEntity && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'date') {
          return new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime();
        }
        return a.reference.localeCompare(b.reference);
      });
  }, [offers, searchTerm, entityFilter, statusFilter, sortBy]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VALIDE':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'REFUSE':
        return <XCircle className="h-3 w-3 text-red-500" />;
      case 'BROUILLON':
        return <AlertCircle className="h-3 w-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALIDE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REFUSE':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BROUILLON':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-0">
        
      {selectedOffer ? (
        // Affiche OfferDetails si une offre est sélectionnée
        <div>
          <button
            onClick={() => setSelectedOffer(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
            <ArrowLeft className="h-5 w-5" />
            Retour à la liste
          </button>
          <OfferDetails offer={selectedOffer} onBack={() => setSelectedOffer(null)} onEdit={function (): void {
                      throw new Error('Function not implemented.');
                  } } />
        </div>
      ) : (
        // Affiche la liste des offres
        <div>
          <div className="mb-8">
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Barre de recherche */}
              <div className="col-span-full lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Rechercher par référence, client ou produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Filtres */}
              <div className="relative">
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option value="">Toutes les entités</option>
                  {entities.map(entity => (
                    <option key={entity} value={entity}>{entity}</option>
                  ))}
                </select>
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg appearance-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                >
                  <option value="">Tous les statuts</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="bg-white rounded-lg shadow">
            <div className="grid gap-4 p-4">
              {filteredOffers.map(offer => (
                <div
                  key={offer.id}
                  className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 transition-all cursor-pointer"
                  onClick={() => setSelectedOffer(offer)} // Définit l'offre sélectionnée
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h- w-5 text-blue-500" />
                        <h3 className="font-medium text-gray-900">{offer.reference}</h3>
                        <div className={`px-4 py-2 rounded-full border ${getStatusColor(offer.statut)} flex items-center gap-2`}>
                {getStatusIcon(offer.statut)}
                {offer.statut}
              </div>
                      </div>
                      
                      <div className="grid gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span>{offer.entity.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User2 className="h-4 w-4" />
                          <span>{offer.client.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span>{offer.produit.map(p => p.name).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Créé le {formatDate(offer.date_creation)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Modifié le {formatDate(offer.date_modification)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredOffers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Aucune offre ne correspond aux critères de recherche
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersList;
