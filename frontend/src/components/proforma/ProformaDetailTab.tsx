// src/components/proforma/ProformaDetailTab.tsx
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  XCircle,
  Clock,
  CircleDashed
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { EditedProformaData } from '@/hooks/useProformaPage';
import { IProformaDetail } from '@/services/proformaService';

interface ProformaDetailTabProps {
  proforma: IProformaDetail;
  isEditing: boolean;
  editedData: EditedProformaData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const ProformaDetailTab: React.FC<ProformaDetailTabProps> = ({
  proforma,
  isEditing,
  editedData,
  handleInputChange
}) => {
  // Afficher le badge de statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'BROUILLON':
        return <Badge variant="outline" className="bg-gray-100">
          <CircleDashed className="mr-1 h-3 w-3" /> Brouillon
        </Badge>;
      case 'EN_COURS':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <Clock className="mr-1 h-3 w-3" /> En cours
        </Badge>;
      case 'VALIDE':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Validé
        </Badge>;
      case 'REFUSE':
        return <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" /> Refusé
        </Badge>;
      case 'EXPIRE':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">
          <Clock className="mr-1 h-3 w-3" /> Expiré
        </Badge>;
      case 'ANNULE':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">
          <XCircle className="mr-1 h-3 w-3" /> Annulé
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Informations générales */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Référence</Label>
              <div className="mt-1 font-medium">{proforma.reference}</div>
            </div>
            <div>
              <Label>Séquence</Label>
              <div className="mt-1">{proforma.sequence_number}</div>
            </div>
            <div>
              <Label>Date de création</Label>
              <div className="mt-1">{formatDate(proforma.date_creation)}</div>
            </div>
            <div>
              <Label>Date de validation</Label>
              <div className="mt-1">
                {proforma.date_validation ? formatDate(proforma.date_validation) : 'Non validée'}
              </div>
            </div>
            <div>
              <Label>Date d'expiration</Label>
              {isEditing ? (
                <Input
                  name="date_expiration"
                  type="date"
                  value={editedData.date_expiration}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <div className="mt-1">
                  {proforma.date_expiration ? formatDate(proforma.date_expiration) : 'Non définie'}
                </div>
              )}
            </div>
            <div>
              <Label>Statut</Label>
              <div className="mt-1">
                {renderStatusBadge(proforma.statut)}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label>Notes</Label>
            {isEditing ? (
              <Textarea
                name="notes"
                value={editedData.notes}
                onChange={handleInputChange}
                rows={4}
                className="mt-1"
                placeholder="Notes ou commentaires sur cette proforma..."
              />
            ) : (
              <div className="mt-1 p-2 bg-muted/20 rounded-md min-h-[80px]">
                {proforma.notes || 'Aucune note'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Informations financières */}
      <Card>
        <CardHeader>
          <CardTitle>Informations financières</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Montant HT</Label>
            {isEditing ? (
              <Input
                name="montant_ht"
                type="number"
                value={editedData.montant_ht}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <div className="mt-1 font-medium text-lg">
                {formatCurrency(proforma.montant_ht)}
              </div>
            )}
          </div>
          
          <div>
            <Label>Taux TVA</Label>
            {isEditing ? (
              <Input
                name="taux_tva"
                type="number"
                step="0.01"
                value={editedData.taux_tva}
                onChange={handleInputChange}
                className="mt-1"
              />
            ) : (
              <div className="mt-1">
                {proforma.taux_tva}%
              </div>
            )}
          </div>
          
          <div>
            <Label>Montant TVA</Label>
            <div className="mt-1">
              {formatCurrency(proforma.montant_tva)}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <Label>Montant TTC</Label>
            <div className="mt-1 font-bold text-xl">
              {formatCurrency(proforma.montant_ttc)}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Métadonnées */}
      <Card className="md:col-span-3">
        <CardHeader>
          <CardTitle>Métadonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Date de création</Label>
              <div className="mt-1">
                {formatDate(proforma.created_at, { showTime: true })}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Dernière modification par</Label>
              <div className="mt-1">
                {proforma.updated_by_name || 'N/A'}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Date de modification</Label>
              <div className="mt-1">
                {formatDate(proforma.updated_at, { showTime: true })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProformaDetailTab;