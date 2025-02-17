import { X, FileText, Users, ClipboardCheck, Receipt, Calendar, Loader2, Download, Search, Filter, ChevronDown, Share2, Printer } from 'lucide-react';
import { useCallback, useState, useEffect } from 'react';
import { affaireService } from '@/services';
import { AffaireDetail } from '@/interfaces';
import { AffaireDetails as IAffaireDetails } from '@/affaireType';
import { formatDate } from '@/utils/dateHelpers';
import { cn } from '@/lib/utils';

interface AffaireDetailsProps {
  affaire: AffaireDetail | null;
  onClose: () => void;
}

export const AffaireDetails = ({ affaire, onClose }: AffaireDetailsProps) => {
  const [affaireData, setAffaireData] = useState<IAffaireDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    if (!affaire) return;
    setIsLoading(true);
    try {
      const data = await affaireService.details(affaire.id);
      setAffaireData(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [affaire]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    alert("Export lancé. Le document sera prêt dans quelques instants.");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    alert("Lien copié dans le presse-papier");
  };

  if (!affaire || !affaireData) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50">
      <div className="container mx-auto h-full py-4">
        <div className="bg-white rounded-xl h-[calc(100vh-2rem)] flex flex-col max-w-7xl mx-auto">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white rounded-t-xl z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Détails de l'affaire</h2>
              <p className="text-gray-500">Référence: {affaireData.reference}</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </button>
              <button 
                onClick={handleExport}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
              <button 
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimer
              </button>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-gray-500">Chargement des données...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
                <p className="font-medium">{error}</p>
                <button 
                  onClick={loadData}
                  className="mt-4 px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Réessayer
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Tabs */}
                <div className="flex items-center justify-between border-b">
                  <div className="flex space-x-1">
                    {['overview', 'reports', 'formations', 'billing'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "px-4 py-2 text-sm font-medium rounded-t-lg focus:outline-none",
                          activeTab === tab
                            ? "border-b-2 border-primary text-primary"
                            : "text-gray-500 hover:text-gray-700"
                        )}
                      >
                        {tab === 'overview' && 'Vue d\'ensemble'}
                        {tab === 'reports' && 'Rapports'}
                        {tab === 'formations' && 'Formations'}
                        {tab === 'billing' && 'Facturation'}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtres
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-8">
                      {/* Main Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InfoCard
                          title="Informations générales"
                          items={[
                            { label: 'Client', value: affaireData.client.nom },
                            { label: 'Statut', value: <StatusBadge status={affaireData.statut} /> },
                            { label: 'Offre associée', value: affaireData.offre.reference }
                          ]}
                        />
                        <InfoCard
                          title="Dates importantes"
                          items={[
                            { label: 'Date de début', value: formatDate(affaireData.date_debut) },
                            { 
                              label: 'Date de fin prévue', 
                              value: affaireData.date_fin_prevue ? formatDate(affaireData.date_fin_prevue) : '-' 
                            }
                          ]}
                        />
                      </div>

                      {/* Statistics */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-6">Vue d'ensemble</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <StatCard
                            icon={<FileText className="h-5 w-5" />}
                            title="Rapports"
                            value={affaireData.statistiques.nombre_rapports}
                          />
                          <StatCard
                            icon={<Users className="h-5 w-5" />}
                            title="Formations"
                            value={affaireData.statistiques.nombre_formations}
                          />
                          <StatCard
                            icon={<ClipboardCheck className="h-5 w-5" />}
                            title="Participants"
                            value={affaireData.statistiques.nombre_total_participants}
                          />
                          <StatCard
                            icon={<Receipt className="h-5 w-5" />}
                            title="Attestations"
                            value={affaireData.statistiques.nombre_attestations}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'reports' && (
                    <div className="grid gap-4">
                      {affaireData.rapports.map((rapport) => (
                        <div
                          key={rapport.id}
                          className="flex justify-between items-center p-4 bg-white border rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/5 rounded-lg">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{rapport.reference}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <StatusBadge status={rapport.statut} />
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'formations' && (
                    <div className="grid gap-6">
                      {affaireData.formations.map((formationData) => (
                        <div
                          key={formationData.formation.id}
                          className="border rounded-xl p-6 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h4 className="font-medium text-gray-900 text-lg">
                                {formationData.formation.titre}
                              </h4>
                              <div className="flex items-center text-sm text-gray-500 mt-2">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>
                                  {formatDate(formationData.formation.date_debut)} - {formatDate(formationData.formation.date_fin)}
                                </span>
                              </div>
                            </div>
                            <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                              Voir les détails
                            </button>
                          </div>
                          
                          {/* Participants */}
                          {formationData.participants.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Participants ({formationData.participants.length})
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {formationData.participants.map((participant) => (
                                  <div
                                    key={participant.id}
                                    className="text-sm bg-gray-50 rounded-lg p-3 flex items-center space-x-3 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="p-1.5 bg-white rounded-full">
                                      <Users className="h-4 w-4 text-primary" />
                                    </div>
                                    <span className="text-gray-700">{participant.nom} {participant.prenom}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div>
                      {affaireData.facture ? (
                        <div className="bg-white border rounded-xl p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900 text-lg mb-2">
                                Facture {affaireData.facture.reference}
                              </h4>
                              <p className="text-sm text-gray-500">
                                Créée le {formatDate(affaireData.facture.date_creation)}
                              </p>
                            </div>
                            <div className="flex gap-4">
                              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                <Download className="h-4 w-4 mr-2" />
                                Télécharger
                              </button>
                              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Aucune facture disponible
                          </h3>
                          <p className="text-gray-500">
                            La facture n'a pas encore été générée pour cette affaire.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ 
  title, 
  items 
}: { 
  title: string; 
  items: Array<{ label: string; value: React.ReactNode }> 
}) => (
  <div className="bg-white border rounded-xl p-6 hover:shadow-md transition-all duration-200">
    <h3 className="font-medium text-gray-700 mb-4">{title}</h3>
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index}>
          <h4 className="text-sm font-medium text-gray-500 mb-1">{item.label}</h4>
          <div className="text-gray-900">{item.value}</div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) => (
  <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
    <div className="flex items-center space-x-3 text-gray-600 mb-3">
      <div className="p-2 bg-primary/5 rounded-lg">
        {icon}
      </div>
      <span className="font-medium">{title}</span>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    const baseStyles = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'EN_COURS':
        return cn(baseStyles, "bg-blue-50 text-blue-700");
      case 'VALIDE':
        return cn(baseStyles, "bg-green-50 text-green-700");
      case 'ENVOYE':
        return cn(baseStyles, "bg-green-50 text-green-700");
      case 'REFUSE':
        return cn(baseStyles, "bg-red-50 text-red-700");
      case 'BROUILLON':
        return cn(baseStyles, "bg-yellow-50 text-yellow-700");
      default:
        return cn(baseStyles, "bg-gray-50 text-gray-700");
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'EN_COURS':
        return 'En cours';
      case 'VALIDE':
        return 'Validé';
      case 'ENVOYE':
        return 'Envoyé';
      case 'REFUSE':
        return 'Refusé';
      case 'BROUILLON':
        return 'Brouillon';
      default:
        return status;
    }
  };

  return (
    <span className={getStatusStyles(status)}>
      {getStatusLabel(status)}
    </span>
  );
};

export default AffaireDetails;