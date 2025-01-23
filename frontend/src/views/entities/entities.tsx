import React, { useCallback, useEffect, useState } from 'react';
import { useServices } from '@/AppHooks';
import { EntityBase, EntityDetail, EntityEdit } from '@/interfaces';
import { PlusCircle, Pencil, Trash2, X, AlertCircle, Loader2 } from 'lucide-react';

const EntityManagement = () => {
  const { entityService } = useServices();
  const [entities, setEntities] = useState<EntityBase[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEntity, setCurrentEntity] = useState<EntityDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const [formData, setFormData] = useState<EntityEdit>({
    code: '',
    name: ''
  });

  const loadEntities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await entityService.getAll();
      setEntities(data);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des entités');
    } finally {
      setIsLoading(false);
    }
  }, [entityService]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentEntity) {
        await entityService.update(currentEntity.id, formData);
      } else {
        await entityService.create(formData);
      }
      setIsModalOpen(false);
      await loadEntities();
      resetForm();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (entity: EntityBase) => {
    setIsLoading(true);
    try {
      const detailedEntity = await entityService.getById(entity.id);
      setCurrentEntity(detailedEntity);
      setFormData({
        code: detailedEntity.code,
        name: detailedEntity.name
      });
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement de l\'entité');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await entityService.delete(id);
      await loadEntities();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setCurrentEntity(null);
    setFormData({ code: '', name: '' });
    setError(null);
  };

  const handleNewEntity = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredEntities = entities.filter(entity => 
    entity.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Entités</h1>
          <button
            onClick={handleNewEntity}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-md"
          >
            <PlusCircle className="h-5 w-5" />
            Nouvelle Entité
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
              placeholder="Rechercher par code ou nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading && !entities.length ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                        <span className="ml-2 text-gray-600">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredEntities.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      Aucune entité trouvée
                    </td>
                  </tr>
                ) : (
                  filteredEntities.map((entity) => (
                    <tr 
                      key={entity.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entity.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{entity.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <button
                          onClick={() => handleEdit(entity)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors duration-200 inline-flex items-center"
                          disabled={isLoading}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(entity.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 inline-flex items-center"
                          disabled={isDeleting === entity.id}
                        >
                          {isDeleting === entity.id ? (
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md transform transition-all duration-200 animate-slideIn">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentEntity ? 'Modifier l\'entité' : 'Nouvelle entité'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Entrez le code..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Entrez le nom..."
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {currentEntity ? 'Modifier' : 'Créer'}
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

export default EntityManagement;