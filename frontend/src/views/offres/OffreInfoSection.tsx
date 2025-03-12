import React from 'react';
import { Edit, Mail, Building } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { OffreInfoSectionProps } from './types';

const OffreInfoSection: React.FC<OffreInfoSectionProps> = ({ 
  formData, 
  handleChange, 
  setIsClientDialogOpen, 
  handleContactChange, 
  selectedClient, 
  errors, 
  entities, 
  contacts,
  getInitials
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="statut">Statut</Label>
            <Select 
              value={formData.statut} 
              onValueChange={(value) => handleChange('statut', value)}
            >
              <SelectTrigger id="statut">
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BROUILLON">Brouillon</SelectItem>
                <SelectItem value="ENVOYE">Envoyé</SelectItem>
                <SelectItem value="GAGNE">Gagné</SelectItem>
                <SelectItem value="PERDU">Perdu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Entity */}
          <div className="space-y-2">
            <Label htmlFor="entity">Entité</Label>
            <Select 
              value={formData.entity?.toString() || ""} 
              onValueChange={(value) => handleChange('entity', parseInt(value))}
            >
              <SelectTrigger id="entity">
                <SelectValue placeholder="Sélectionner une entité" />
              </SelectTrigger>
              <SelectContent>
                {entities.map(entity => (
                  <SelectItem key={entity.id} value={entity.id.toString()}>
                    {entity.code} - {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.entity_id && (
              <p className="text-sm text-red-500">{errors.entity_id}</p>
            )}
          </div>
        </div>
        
        {/* Reference */}
        {formData.reference && (
          <div className="space-y-2">
            <Label htmlFor="reference">Référence</Label>
            <div className="flex items-center gap-2">
              <Input id="reference" value={formData.reference} readOnly className="bg-muted" />
              <Badge variant="outline">Auto-générée</Badge>
            </div>
          </div>
        )}
        
        {/* Client */}
        <div className="space-y-2">
          <Label>Client</Label>
          {selectedClient ? (
            <div className="border rounded-md p-3 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                type="button"
                className="absolute top-2 right-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsClientDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="text-primary">{getInitials(selectedClient.nom)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedClient.nom}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {selectedClient.c_num}
                    </Badge>
                    {selectedClient.ville_nom && (
                      <span>{selectedClient.ville_nom}</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-2 gap-2">
                {selectedClient.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                    {selectedClient.email}
                  </div>
                )}
                
                {/* Contact selection */}
                {formData.client && (
                  <div className="space-y-2">
                    <Label htmlFor="contact" className="text-sm">Contact</Label>
                    <Select 
                      value={formData.contact?.toString() || ""} 
                      onValueChange={(value) => handleContactChange(parseInt(value))}
                    >
                      <SelectTrigger id="contact">
                        <SelectValue placeholder="Sélectionner un contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts
                          .filter(contact => contact.client_id?.toString() === formData.client?.toString())
                          .map(contact => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.nom}
                              {contact.poste && ` (${contact.poste})`}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full py-6"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsClientDialogOpen(true);
              }}
            >
              <Building className="h-4 w-4 mr-2" />
              Sélectionner un client
            </Button>
          )}
          {errors.client_id && (
            <p className="text-sm text-red-500">{errors.client_id}</p>
          )}
        </div>

        {/* montant */}
        <div className="space-y-2">
          <Label htmlFor="montant">Montant</Label>
          <Input id="montant" value={formData.montant} className="bg-muted" 
          onChange={(e) => handleChange('montant', e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea 
            id="notes" 
            placeholder="Notes ou commentaires sur l'offre" 
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default OffreInfoSection;