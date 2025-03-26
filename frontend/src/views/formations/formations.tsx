import React, { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/AppHooks';
import { FormationBase, FormationDetail, FormationEdit, ClientBase, AffaireBase, RapportBase } from '@/interfaces';
import { PlusCircle, Pencil, Trash2, X, AlertCircle, Loader2, GraduationCap, Building2, FileText, Calendar } from 'lucide-react';

const FormationManagement = () => {
  const { formationService, clientService, affaireService, rapportService } = useServices();
  const [formations, setFormations] = useState<FormationBase[]>([]);
  const [clients, setClients] = useState<ClientBase[]>([]);
  const [affaires, setAffaires] = useState<AffaireBase[]>([]);
  const [rapports, setRapports] = useState<RapportBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFormation, setCurrentFormation] = useState<FormationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormationEdit>({
    titre: '',
    client: 0,
    affaire: 0,
    rapport: 0,
    date_debut: '',
    date_fin: '',
    description: ''
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [formationsData, clientsData, affairesData, rapportsData] = await Promise.all([
        formationService.getAll(),
        clientService.getAll(),
        affaireService.getAll(),
        rapportService.getAll()
      ]);
      setFormations(formationsData);
      setClients(clientsData);
      setAffaires(affairesData);
      setRapports(rapportsData);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [formationService, clientService, affaireService, rapportService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentFormation) {
        await formationService.update(currentFormation.id, formData);
      } else {
        await formationService.create(formData);
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

  const handleEdit = async (formation: FormationBase) => {
    setIsLoading(true);
    try {
      const detailedFormation = await formationService.getById(formation.id);
      setCurrentFormation(detailedFormation);
      setFormData({
        titre: detailedFormation.titre,
        client: detailedFormation.client.id,
        affaire: detailedFormation.affaire.id,
        rapport: detailedFormation.rapport.id,
        date_debut: detailedFormation.date_debut || '',
        date_fin: detailedFormation.date_fin || '',
        description: detailedFormation.description || ''
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de la formation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await formationService.delete(id);
      await loadData();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentFormation(null);
    setFormData({
      titre: '',
      client: 0,
      affaire: 0,
      rapport: 0,
      date_debut: '',
      date_fin: '',
      description: ''
    });
    setError(null);
  };

  const handleNewFormation = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredFormations = formations.filter(formation => 
    formation.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getParticipantCount = (formation: FormationDetail) => {
    return formation.participants?.length || 0;
  };

  const getAttestationCount = (formation: FormationDetail) => {
    return formation.attestations?.length || 0;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-violet-50">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Formations</h1>
        </div>
        <button
          onClick={handleNewFormation}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="h-5 w-5" />
          Nouvelle Formation
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-4 animate-fadeIn">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
            <p className="text-sm">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attestations</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && !formations.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                      <span className="ml-2 text-gray-600">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFormations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Aucune formation trouvée
                  </td>
                </tr>
              ) : (
                filteredFormations.map((formation) => (
                  <tr 
                    key={formation.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formation.titre}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Building2 className="h-4 w-4 mr-2" />
                        <span>{formation.client.nom}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>{formation.affaire.reference}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Début: {formatDate(formation.date_debut)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Fin: {formatDate(formation.date_fin)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {getParticipantCount(formation as FormationDetail)} participants
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {getAttestationCount(formation as FormationDetail)} attestations
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button
                        onClick={() => handleEdit(formation)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200 inline-flex items-center"
                        disabled={isLoading}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(formation.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200 inline-flex items-center"
                        disabled={isDeleting === formation.id}
                      >
                        {isDeleting === formation.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-1" />
                        )}
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-2xl transform transition-all duration-200 animate-slideIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentFormation ? 'Modifier la formation' : 'Nouvelle formation'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Titre de la formation"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                    <select
                      value={formData.client}
                      onChange={(e) => setFormData({ ...formData, client: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <option value="">Sélectionnez un client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.nom}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Affaire</label>
                    <select
                      value={formData.affaire}
                      onChange={(e) => setFormData({ ...formData, affaire: Number(e.target.value) })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    >
                      <option value="">Sélectionnez une affaire</option>
                      {affaires.map(affaire => (
                        <option key={affaire.id} value={affaire.id}>{affaire.reference}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rapport</label>
                  <select
                    value={formData.rapport}
                    onChange={(e) => setFormData({ ...formData, rapport: Number(e.target.value) })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  >
                    <option value="">Sélectionnez un rapport</option>
                    {rapports.map(rapport => (
                      <option key={rapport.id} value={rapport.id}>{rapport.reference}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                    <input
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                    <input
                      type="date"
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="Description de la formation"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
                    disabled={isLoading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {currentFormation ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormationManagement;