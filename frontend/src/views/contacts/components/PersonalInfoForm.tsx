// PersonalInfoForm.tsx
import { User, Mail, Phone, Briefcase } from 'lucide-react';
import InputField from '@/components/InputField';
import { ContactEdit } from '../contactsTypes';

interface PersonalInfoFormProps {
  formData: ContactEdit;
  setFormData: (data: ContactEdit) => void;
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
}

export const PersonalInfoForm = ({ 
  formData, 
  setFormData, 
  errors, 
  setErrors 
}: PersonalInfoFormProps) => {
  return (
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
          onChange={(v) => {
            setFormData({ ...formData, email: v || undefined });
            setErrors({ ...errors, email: '' });
          }}
          icon={Mail}
          error={errors.email}
          required
        />
      </div>
      <div className="space-y-6">
        <InputField
          label="Téléphone"
          value={formData.telephone || ''}
          onChange={(v) => setFormData({ ...formData, telephone: v || undefined })}
          icon={Phone}
          pattern="[0-9]{10}"
          placeholder="0123456789"
        />
        <InputField
          label="Mobile"
          value={formData.mobile || ''}
          onChange={(v) => setFormData({ ...formData, mobile: v || undefined })}
          icon={Phone}
          pattern="[0-9]{10}"
          placeholder="0612345678"
        />
        <InputField
          label="Poste"
          value={formData.poste || ''}
          onChange={(v) => setFormData({ ...formData, poste: v || undefined })}
          icon={Briefcase}
        />
      </div>
    </div>
  );
};