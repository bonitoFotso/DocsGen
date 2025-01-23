import React, { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/AppHooks';
import { AffaireBase, AffaireDetail, AffaireEdit, AffaireStatus, OffreBase } from '@/interfaces';
import {
  PlusCircle, FileText, Filter, Download, Upload, Search,
  RefreshCw
} from 'lucide-react';
import { AffaireTableView } from './AffaireTableView';
import { AffaireGridView } from './AffaireGridView';
import { AffaireForm } from './AffaireForm';
import { AffaireDetails } from './AffaireDetails';


const AffaireManagement = () => {
  const { affaireService, offreService } = useServices();
  const [affaires, setAffaires] = useState<AffaireBase[]>([]);
  const [offres, setOffres] = useState<OffreBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAffaire, setCurrentAffaire] = useState<AffaireDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<AffaireStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'reference' | 'date_debut' | 'date_fin_prevue'>('date_debut');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentView, setCurrentView] = useState<'grid' | 'table'>('table');
  const [selectedAffaire, setSelectedAffaire] = useState<AffaireDetail | null>(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);

  const [formData, setFormData] = useState<AffaireEdit>({
    offre: 0,
    date_fin_prevue: '',
    statut: 'EN_COURS',
    doc_type: 'AFD',
    sequence_number: 0,
    entity: 0,
    client: 0,
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [affairesData, offresData] = await Promise.all([
        affaireService.getAll(),
        offreService.getAll()
      ]);
      setAffaires(affairesData);
      setOffres(offresData);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
      console.log('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [affaireService, error, offreService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentAffaire) {
        await affaireService.update(currentAffaire.id, formData);
      } else {
        setFormData({
          ...formData,
          date_fin_prevue: new Date().toISOString(),
          client: 1,
          entity: 1,
        });
        await affaireService.create(formData);
      }
      setIsModalOpen(false);
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (affaire: AffaireBase) => {
    setIsLoading(true);
    try {
      const detailedAffaire = await affaireService.getById(affaire.id);
      setCurrentAffaire(detailedAffaire);
      setFormData({
        offre: detailedAffaire.offre.id,
        date_fin_prevue: detailedAffaire.date_fin_prevue || '',
        statut: detailedAffaire.statut,
        doc_type: "AFF",
        sequence_number: 0,
        entity: detailedAffaire.entity.id,
        client: detailedAffaire.client.id,
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de l\'affaire');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (affaire: AffaireBase) => {
    try {
      const detailedAffaire = await affaireService.getById(affaire.id);
      setSelectedAffaire(detailedAffaire);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des détails');
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await affaireService.delete(id);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentAffaire(null);
    setFormData({
      offre: 0,
      date_fin_prevue: '',
      statut: 'EN_COURS',
      doc_type: 'AFQ',
      sequence_number: 0,
      entity: 0,
      client: 0,
    });
    setError(null);
  };

  const handleNewAffaire = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredAndSortedAffaires = affaires
    .filter(affaire => 
      affaire.reference.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === 'ALL' || affaire.statut === selectedStatus)
    )
    .sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'reference') {
        return direction * a.reference.localeCompare(b.reference);
      }
      return direction * (new Date(a[sortField] ?? '').getTime() - new Date(b[sortField] ?? '').getTime());
    });

  const handleExport = () => {
    // Implementation for exporting data
    console.log('Exporting data...');
  };

  const handleImport = () => {
    // Implementation for importing data
    console.log('Importing data...');
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Affaires</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredAndSortedAffaires.length} affaires au total
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                </button>
                {showStatusFilter && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => {
                        setSelectedStatus('ALL');
                        setShowStatusFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Tous les statuts
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus('EN_COURS');
                        setShowStatusFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      En cours
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus('TERMINEE');
                        setShowStatusFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Terminée
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus('ANNULEE');
                        setShowStatusFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      Annulée
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleExport}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={handleImport}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                onClick={handleNewAffaire}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Nouvelle Affaire
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mb-4">
            <div className="border-b border-gray-200">
              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentView('table')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    currentView === 'table'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Vue tableau
                </button>
                <button
                  onClick={() => setCurrentView('grid')}
                  className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                    currentView === 'grid'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Vue grille
                </button>
              </div>
            </div>
          </div>

          {currentView === 'table' ? (
            <AffaireTableView
              affaires={filteredAndSortedAffaires}
              sortField={sortField}
              sortDirection={sortDirection}
              isDeleting={isDeleting}
              onSort={toggleSort}
              onView={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <AffaireGridView
              affaires={filteredAndSortedAffaires}
              isDeleting={isDeleting}
              onView={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      <AffaireForm
        isOpen={isModalOpen}
        title={currentAffaire ? 'Modifier l\'affaire' : 'Nouvelle affaire'}
        formData={formData}
        offres={offres}
        isLoading={isLoading}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        onChange={setFormData}
      />

      <AffaireDetails
        affaire={selectedAffaire}
        onClose={() => setSelectedAffaire(null)}
      />
    </div>
  );
};

export default AffaireManagement;