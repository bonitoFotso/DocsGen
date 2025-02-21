// FormTabs.tsx
import React from 'react';
import InputField from '@/components/InputField';
import { Building, Mail, MapPin, User } from 'lucide-react';
import { ContactEdit, FormErrors } from './components/useContactForm';

interface TabProps {
  formData: ContactEdit;
  handleFieldChange: <K extends keyof ContactEdit>(field: K, value: ContactEdit[K]) => void;
  errors: FormErrors;
  isLoading?: boolean;
  options?: {
    clients: SelectOption[];
    sites: SelectOption[];
    regions: SelectOption[];
    villes: SelectOption[];
  };
}

interface SelectOption {
  value: string;
  label: string;
}

export const InfoTab: React.FC<Omit<TabProps, 'isLoading' | 'options'>> = React.memo(({
  formData,
  handleFieldChange,
  errors
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-6">
      <InputField
        label="Email"
        type="email"
        value={formData.email || ''}
        onChange={(v) => handleFieldChange('email', v || undefined)}
        icon={Mail}
        error={errors.email}
        required
      />
      <InputField
        label="Notes"
        value={formData.notes || ''}
        onChange={(v) => handleFieldChange('notes', v || undefined)}
        icon={User}
      />
    </div>
    <div className="space-y-6">
      <InputField
        label="Nom"
        value={formData.nom || ''}
        onChange={(v) => handleFieldChange('nom', v || undefined)}
        icon={User}
      />
      <InputField
        label="Prenom"
        value={formData.prenom || ''}
        onChange={(v) => handleFieldChange('prenom', v || undefined)}
        icon={User}
      />
    </div>
  </div>
));

export const EntrepriseTab: React.FC<TabProps> = React.memo(({
  formData,
  handleFieldChange,
  errors,
  isLoading,
  options
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="space-y-6">
      <InputField
        label="Client"
        type="select"
        value={formData.client?.toString() || "placeholder"}
        onChange={(v) => handleFieldChange('client', v !== "placeholder" ? parseInt(v) : undefined)}
        icon={Building}
        options={[
          { value: "placeholder", label: 'Sélectionner un client' },
          ...(options?.clients || [])
        ]}
        isLoading={isLoading}
        error={errors.client}
      />
      <InputField
        label="Site"
        type="select"
        value={formData.site?.toString() || "placeholder"}
        onChange={(v) => handleFieldChange('site', v !== "placeholder" ? parseInt(v) : undefined)}
        icon={Building}
        options={[
          { value: "placeholder", label: 'Sélectionner un site' },
          ...(options?.sites || [])
        ]}
        isLoading={isLoading}
        error={errors.site}
        disabled={!formData.client}
      />
    </div>
    <div className="space-y-6">
      <InputField
        label="Service"
        value={formData.service || ''}
        onChange={(v) => handleFieldChange('service', v || undefined)}
        icon={User}
      />
      <InputField
        label="Poste"
        value={formData.poste || ''}
        onChange={(v) => handleFieldChange('poste', v || undefined)}
        icon={User}
      />
    </div>
  </div>
));

export const AdresseTab: React.FC<TabProps> = React.memo(({
    formData,
    handleFieldChange,
    errors,
    isLoading,
    options
    
  }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <InputField
          label="Region"
          type="select"
          value={formData.region?.toString() || "placeholder"}
          onChange={(v) => handleFieldChange('region', v !== "placeholder" ? parseInt(v) : undefined)}
          icon={Building}
          options={[
            { value: "placeholder", label: 'Sélectionner une region' },
            ...(options?.regions || [])
          ]}
          isLoading={isLoading}
          error={errors.region}
        />
        <InputField
          label="Ville"
          type="select"
          value={formData.ville?.toString() || "placeholder"}
          onChange={(v) => handleFieldChange('ville', v !== "placeholder" ? parseInt(v) : undefined)}
          icon={Building}
          options={[
            { value: "placeholder", label: 'Sélectionner une ville' },
            ...(options?.villes || [])
          ]}
          isLoading={isLoading}
          error={errors.ville}
          disabled={!formData.region}
        />
        <InputField
          label="Secteur"
          value={formData.secteur || ''}
          onChange={(v) => handleFieldChange('secteur', v || undefined)}
          icon={Building}
        />
      </div>
      <div className="space-y-6">
        <InputField
          label="Adresse"
          value={formData.adresse || ''}
          onChange={(v) => handleFieldChange('adresse', v || undefined)}
          icon={MapPin}
        />
        <InputField
          label="Quartier"
          value={formData.quartier || ''}
          onChange={(v) => handleFieldChange('quartier', v || undefined)}
          icon={MapPin}
        />
        <InputField
          label="Boîte Postale"
          value={formData.bp || ''}
          onChange={(v) => handleFieldChange('bp', v || undefined)}
          icon={MapPin}
        />
      </div>
    </div>
  ));
InfoTab.displayName = 'InfoTab';
EntrepriseTab.displayName = 'EntrepriseTab';
AdresseTab.displayName = 'AdresseTab';