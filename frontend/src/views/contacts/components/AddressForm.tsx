// AddressForm.tsx
import { MapPin, FileText } from 'lucide-react';
import InputField from '@/components/InputField';
import { ContactEdit } from '../contactsTypes';

interface AddressFormProps {
  formData: ContactEdit;
  setFormData: (data: ContactEdit) => void;
}

export const AddressForm = ({ formData, setFormData }: AddressFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <InputField
          label="Adresse"
          value={formData.adresse || ''}
          onChange={(v) => setFormData({ ...formData, adresse: v || undefined })}
          icon={MapPin}
          placeholder="123 rue des Exemples"
        />
        <InputField
          label="Quartier"
          value={formData.quartier || ''}
          onChange={(v) => setFormData({ ...formData, quartier: v || undefined })}
          icon={MapPin}
          placeholder="Nom du quartier"
        />
      </div>
      <div className="space-y-6">
        <InputField
          label="BP"
          value={formData.bp || ''}
          onChange={(v) => setFormData({ ...formData, bp: v || undefined })}
          icon={MapPin}
          placeholder="Boîte Postale"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
            placeholder="Ajoutez des notes supplémentaires..."
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;