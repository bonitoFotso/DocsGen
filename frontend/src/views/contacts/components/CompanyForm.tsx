import React from 'react';
import { Building, Briefcase, Calendar } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactEdit, SiteDetail } from '../contactsTypes';



type CompanyFormProps = {
  formData: ContactEdit;
  setFormData: (data: ContactEdit) => void;
  clients: Array<{ id: number; nom: string }>;
  sites: Array<{ id: number; nom: string; client: { id: number; nom: string } }>;
  isLoading: boolean;
  getFilteredSites: SiteDetail[];
};

export const CompanyForm = ({
  formData,
  setFormData,
  clients,
  isLoading,
  getFilteredSites

}: CompanyFormProps) => {


  const handleChange = (field: keyof ContactEdit, value: any) => {
    console.log('form', formData);
    if (field === 'client') {
      // Réinitialiser le site quand on change de client
      setFormData({ 
        ...formData, 
        [field]: value,
        site: undefined 
      });
    } else {
      
      setFormData({ ...formData, [field]: value });
      console.log('form2' ,{ ...formData, [field]: value } );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        {/* Sélection du client */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>Client</span>
          </Label>
          <Select
            value={formData.client?.id.toString()}
            onValueChange={(v) => handleChange('client', v ? parseInt(v) : undefined)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sélection du site */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>Site</span>
          </Label>
          <Select
            value={formData.site?.toString()}
            onValueChange={(v) => handleChange('site', v ? parseInt(v) : undefined)}
            disabled={!formData.client || isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.client ? 'Sélectionner un site' : 'Sélectionnez d\'abord un client'} />
            </SelectTrigger>
            <SelectContent>
              {getFilteredSites.map(site => (
                <SelectItem key={site.id} value={site.id.toString()}>
                  {site.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        {/* Service */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>Service</span>
          </Label>
          <Input
            value={formData.service || ''}
            onChange={(e) => handleChange('service', e.target.value)}
          />
        </div>

        {/* Rôle achat */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>Rôle achat</span>
          </Label>
          <Input
            value={formData.role_achat || ''}
            onChange={(e) => handleChange('role_achat', e.target.value)}
          />
        </div>

        {/* Date d'envoi */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Date d'envoi</span>
          </Label>
          <Input
            type="date"
            value={formData.date_envoi || ''}
            onChange={(e) => handleChange('date_envoi', e.target.value)}
          />
        </div>

        {/* Checkbox relance */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="relance"
            checked={formData.relance}
            onCheckedChange={(checked) => handleChange('relance', checked)}
          />
          <Label htmlFor="relance">
            Relance nécessaire
          </Label>
        </div>
      </div>
    </div>
  );
};