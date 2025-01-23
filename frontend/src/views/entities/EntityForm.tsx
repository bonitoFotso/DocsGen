import React from 'react';

interface EntityFormProps {
  onSubmit: (data: { code: string; name: string }) => void;
  onCancel: () => void;
  initialData?: {
    code: string;
    name: string;
  };
}

const EntityForm: React.FC<EntityFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = React.useState({
    code: initialData?.code || '',
    name: initialData?.name || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Code de l'entité
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="ex: KES"
            required
          />
          <p className="text-xs text-gray-500">
            Le code doit être unique et court (3-5 caractères)
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Nom de l'entité
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="ex: KES INSPECTIONS & PROJECTS"
            required
          />
          <p className="text-xs text-gray-500">
            Le nom complet de l'entité
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
        >
          {initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};

export default EntityForm;