import { useState, useCallback, useEffect } from 'react';
import { ContactEdit } from '@/itf';
import InputField from '@/components/InputField';
import { Building, Mail, Phone, User, Briefcase, Calendar, MapPin, FileText } from 'lucide-react';
import { useServices } from '@/AppHooks';
import { ClientBase } from '@/interfaces';

interface ContactModalProps {
  title: string;
  initialData: ContactEdit & { id?: number };
  onClose: () => void;
  onSubmit: (data: ContactEdit) => void;
  isSubmitting?: boolean;
}

const ContactModal = ({
  title,
  initialData,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ContactModalProps) => {
  const [formData, setFormData] = useState<ContactEdit>(initialData);
  const [activeTab, setActiveTab] = useState<'info' | 'entreprise' | 'adresse'>('info');
  const { clientService } = useServices();
  const [clients, setClients] = useState<ClientBase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await clientService.getAll();
      setClients(response);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [clientService]);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const tabs = [
    { id: 'info', label: 'Informations', icon: User },
    { id: 'entreprise', label: 'Entreprise', icon: Building },
    { id: 'adresse', label: 'Adresse', icon: MapPin },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-4 px-6" aria-label="Tabs">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`
                  py-4 px-1 flex items-center space-x-2 border-b-2 font-medium text-sm
                  ${activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <InputField
                    label="Nom"
                    value={formData.nom || ""}
                    onChange={(v) => setFormData({ ...formData, nom: v })}
                    icon={User}
                  />
                  <InputField
                    label="Prénom"
                    value={formData.prenom || ''}
                    onChange={(v) => setFormData({ ...formData, prenom: v || undefined })}
                    icon={User}
                  />
                  <InputField
                    label="Email"
                    type="email"
                    value={formData.email || ''}
                    onChange={(v) => setFormData({ ...formData, email: v || undefined })}
                    icon={Mail}
                  />
                </div>
                <div className="space-y-6">
                  <InputField
                    label="Téléphone"
                    value={formData.telephone || ''}
                    onChange={(v) => setFormData({ ...formData, telephone: v || undefined })}
                    icon={Phone}
                  />
                  <InputField
                    label="Mobile"
                    value={formData.mobile || ''}
                    onChange={(v) => setFormData({ ...formData, mobile: v || undefined })}
                    icon={Phone}
                  />
                  <InputField
                    label="Poste"
                    value={formData.poste || ''}
                    onChange={(v) => setFormData({ ...formData, poste: v || undefined })}
                    icon={Briefcase}
                  />
                </div>
              </div>
            )}

            {activeTab === 'entreprise' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <InputField
                    label="Client"
                    type="select"
                    value={formData.client?.toString() || ''}
                    onChange={(v) => setFormData({ ...formData, client: v ? parseInt(v) : undefined })}
                    icon={Building}
                    options={[
                      { value: '', label: 'Sélectionner un client' },
                      ...clients.map(client => ({
                        value: client.id.toString(),
                        label: client.email ?? ''
                      }))
                    ]}
                    isLoading={isLoading}
                    error={isError ? "Erreur lors du chargement des clients" : undefined}
                  />
                </div>
                <div className="space-y-6">
                  <InputField
                    label="Service"
                    value={formData.service || ''}
                    onChange={(v) => setFormData({ ...formData, service: v || undefined })}
                    icon={Building}
                  />
                  <InputField
                    label="Rôle achat"
                    value={formData.role_achat || ''}
                    onChange={(v) => setFormData({ ...formData, role_achat: v || undefined })}
                    icon={Briefcase}
                  />
                </div>
                <div className="space-y-6">
                  <InputField
                    label="Date d'envoi"
                    type="date"
                    value={formData.date_envoi || ''}
                    onChange={(v) => setFormData({ ...formData, date_envoi: v || undefined })}
                    icon={Calendar}
                  />
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.relance || false}
                      onChange={(e) => setFormData({ ...formData, relance: e.target.checked })}
                      className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <span className="text-sm font-medium text-gray-700">Relance nécessaire</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'adresse' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <InputField
                    label="Adresse"
                    value={formData.adresse || ''}
                    onChange={(v) => setFormData({ ...formData, adresse: v || undefined })}
                    icon={MapPin}
                  />
                  <InputField
                    label="Quartier"
                    value={formData.quartier || ''}
                    onChange={(v) => setFormData({ ...formData, quartier: v || undefined })}
                    icon={MapPin}
                  />
                </div>
                <div className="space-y-6">
                  <InputField
                    label="BP"
                    value={formData.bp || ''}
                    onChange={(v) => setFormData({ ...formData, bp: v || undefined })}
                    icon={MapPin}
                  />
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Notes</span>
                      </div>
                    </label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value || undefined })}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.email}
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;