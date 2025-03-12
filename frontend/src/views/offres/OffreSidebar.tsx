import React from 'react';
import { Save, Eye, Send, Building, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { OffreSidebarProps } from './types';

const OffreSidebar: React.FC<OffreSidebarProps> = ({
  formData,
  handleSubmit,
  saving,
  selectedClient,
  selectedContact,
  selectedEntity,
  totals,
  formatMontant
}) => {
  return (
    <div className="col-span-1 space-y-6">
      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Enregistrez cette offre pour pouvoir l'éditer ultérieurement.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col space-y-2">
          <Button className="w-full" onClick={() => handleSubmit()} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Enregistrer
          </Button>
          
          <Button variant="outline" className="w-full" type="button">
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          
          {formData.statut === 'BROUILLON' && (
            <Button variant="secondary" className="w-full" type="button">
              <Send className="h-4 w-4 mr-2" />
              Envoyer au client
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedClient && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Client</p>
              <div className="flex items-center text-sm">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                {selectedClient.nom}
              </div>
            </div>
          )}
          
          {selectedContact && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Contact</p>
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 mr-2 text-muted-foreground" />
                {selectedContact.nom}
              </div>
            </div>
          )}
          
          {selectedEntity && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Entité</p>
              <div className="flex items-center text-sm">
                <Badge variant="outline">{selectedEntity.code}</Badge>
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Montant total</p>
            <div className="text-lg font-bold text-primary">{formatMontant(totals.montantTTC)}</div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium">Produits</p>
            <div className="flex items-center gap-2 text-sm">
              <Badge>{formData.produits.length}</Badge>
              {formData.produits.length > 0 && (
                <span className="text-muted-foreground">produits ajoutés</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OffreSidebar;