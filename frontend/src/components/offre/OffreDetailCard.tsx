// components/offre/OffreDetailCard.tsx
import React from 'react';
import { Building, Calendar, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { OffreDetail } from '@/types/offre';

interface OffreDetailCardProps {
  offre: OffreDetail;
}

const OffreDetailCard: React.FC<OffreDetailCardProps> = ({ offre }) => {
  // Fonctions utilitaires pour le formatage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Obtenir la couleur et l'icône en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'GAGNE':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'PERDU':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'ENVOYE':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'BROUILLON':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch(statut) {
      case 'GAGNE':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'PERDU':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      case 'ENVOYE':
      case 'BROUILLON':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">
                {offre.entity.code}
              </Badge>
              <Badge className={getStatusColor(offre.statut)}>
                {getStatusIcon(offre.statut)}
                {offre.statut}
              </Badge>
              {offre.necessite_relance && (
                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Relance nécessaire
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl">{offre.reference}</CardTitle>
            <CardDescription>
              Séquence #{offre.sequence_number}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Montant total</div>
            <div className="text-2xl font-bold text-primary">{formatMontant(offre.montant)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Client</div>
            <div className="flex items-center">
              <Building className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{offre.client.nom}</span>
              <Badge variant="outline" className="ml-2 text-xs">
                {offre.client.c_num}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Créée le</div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              {formatDate(offre.date_modification)}
            </div>
          </div>
          
          {offre.statut === 'GAGNE' && offre.date_validation && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Date de validation</div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                {formatDate(offre.date_validation)}
              </div>
            </div>
          )}
          
          {offre.relance && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Prochaine relance</div>
              <div className="flex items-center">
                <AlertTriangle className={`h-4 w-4 mr-2 ${offre.necessite_relance ? 'text-amber-600' : 'text-muted-foreground'}`} />
                {formatDate(offre.relance)}
              </div>
            </div>
          )}

          {offre.user && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">responsable</div>
              <div className="flex items-center">
                <span className="font-medium">{offre.user.username}</span>
                <Badge variant="outline" className="ml-2 text-xs">
                  {offre.user.email}
                </Badge>
              </div>
            </div>
          )}
                
          
        </div>
      </CardContent>
    </Card>
  );
};

export default OffreDetailCard;
           