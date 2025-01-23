import React from 'react';

interface ClientFormProps {
  onSubmit: (data: { 
    nom: string; 
    email: string; 
    telephone: string; 
    adresse: string 
  }) => void;
  onCancel: () => void;
  initialData?: {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
  };
}

const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onCancel,
  initialData
}) => {
  const [formData, setFormData] = React.useState({
    nom: initialData?.nom || '',
    email: initialData?.email || '',
    telephone: initialData?.telephone || '',
    adresse: initialData?.adresse || ''
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
            Nom du client
          </label>
          <input
            type="text"
            value={formData.nom}
            onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="ex: SABC"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="ex: contact@sabc.cm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Téléphone
          </label>
          <input
            type="tel"
            value={formData.telephone}
            onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="ex: +237 123 456 789"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Adresse
          </label>
          <textarea
            value={formData.adresse}
            onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            placeholder="ex: Douala, Cameroun"
            rows={3}
          />
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

export default ClientForm;