import React, { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/AppHooks';
import { ProformaBase, ProformaDetail, ProformaEdit, OffreBase, ClientBase, EntityBase, DocumentStatus } from '@/interfaces';
import { FileText, PlusCircle, AlertCircle, X } from 'lucide-react';
import { ProformaTable } from './ProformaTable';
import { ProformaModal } from './ProformaModal';
import { ProformaDetails } from './ProformaDetails';
import { Toast } from '@/components/ui/toast-container';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning';
}

const ProformaManagement = () => {
  const { proformaService, offreService, clientService, entityService } = useServices();
  const [proformas, setProformas] = useState<ProformaBase[]>([]);
  const [offres, setOffres] = useState<OffreBase[]>([]);
  const [clients, setClients] = useState<ClientBase[]>([]);
  const [entities, setEntities] = useState<EntityBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProforma, setCurrentProforma] = useState<ProformaDetail | null>(null);
  const [selectedProforma, setSelectedProforma] = useState<ProformaDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isStatusChanging, setIsStatusChanging] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [formData, setFormData] = useState<ProformaEdit>({
    offre: 0,
    client: 0,
    entity: 0,
    statut: 'BROUILLON',
    doc_type: 'PRO',
    sequence_number: 0
  });

  const addToast = (message: string, type: 'success' | 'error' | 'warning') => {
    const id = Date.now();
    setToasts(current => [...current, { id, message, type }]);
    setTimeout(() => {
      setToasts(current => current.filter(toast => toast.id !== id));
    }, 3000);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [proformasData, offresData, clientsData, entitiesData] = await Promise.all([
        proformaService.getAll(),
        offreService.getAll(),
        clientService.getAll(),
        entityService.getAll()
      ]);
      setProformas(proformasData);
      setOffres(offresData);
      setClients(clientsData);
      setEntities(entitiesData);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [proformaService, offreService, clientService, entityService]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (proforma: ProformaBase, newStatus: DocumentStatus) => {
    setIsStatusChanging(proforma.id);
    try {
        await proformaService.change_status(proforma.id, { status: newStatus }); // Correction ici
        await loadData();
        addToast(
            newStatus === 'ENVOYE'
                ? 'Proforma envoyée avec succès'
                : 'Proforma validée avec succès',
            'success'
        );
    } catch (err) {
        console.error(err);
        addToast('Erreur lors du changement de statut', 'error');
    } finally {
        setIsStatusChanging(null);
    }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentProforma) {
        await proformaService.update(currentProforma.id, formData);
        addToast('Proforma modifiée avec succès', 'success');
      } else {
        await proformaService.create(formData);
        addToast('Proforma créée avec succès', 'success');
      }
      setIsModalOpen(false);
      await loadData();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la sauvegarde');
      addToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (proforma: ProformaBase) => {
    setIsLoading(true);
    try {
      const detailedProforma = await proformaService.getById(proforma.id);
      setCurrentProforma(detailedProforma);
      setFormData({
        offre: detailedProforma.offre.id,
        client: detailedProforma.client.id,
        entity: detailedProforma.entity.id,
        statut: detailedProforma.statut,
        doc_type: 'PRO',
        sequence_number: 0
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de la proforma');
      addToast('Erreur lors du chargement de la proforma', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await proformaService.delete(id);
      await loadData();
      addToast('Proforma supprimée avec succès', 'success');
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
      addToast('Erreur lors de la suppression', 'error');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRowClick = async (proforma: ProformaBase) => {
    try {
      const detailedProforma = await proformaService.getById(proforma.id);
      setSelectedProforma(detailedProforma);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des détails');
      addToast('Erreur lors du chargement des détails', 'error');
    }
  };

  const resetForm = () => {
    setCurrentProforma(null);
    setFormData({
      offre: 0,
      client: 0,
      entity: 0,
      statut: 'BROUILLON',
      doc_type: 'PRO',
      sequence_number: 0
    });
    setError(null);
  };

  const handleNewProforma = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredProformas = proformas.filter(proforma => 
    proforma.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-teal-50">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Proformas</h1>
        </div>
        <button
          onClick={handleNewProforma}
          className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
        >
          <PlusCircle className="h-5 w-5" />
          Nouvelle Proforma
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
            placeholder="Rechercher par référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Création</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <ProformaTable
                proformas={filteredProformas}
                isLoading={isLoading}
                isDeleting={isDeleting}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRowClick={handleRowClick}
                onStatusChange={handleStatusChange}
                isStatusChanging={isStatusChanging}
              />
            </tbody>
          </table>
        </div>
      </div>

      <ProformaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isLoading={isLoading}
        currentProforma={currentProforma}
        offres={offres}
        clients={clients}
        entities={entities}
      />

      {selectedProforma && (
        <ProformaDetails
          proforma={selectedProforma}
          onClose={() => setSelectedProforma(null)}
        />
      )}

      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToasts(current => current.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>
  );
};

export default ProformaManagement;