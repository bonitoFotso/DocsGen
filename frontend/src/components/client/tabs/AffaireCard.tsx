import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Building,
  Calendar,
  CheckCircle2, 
  XCircle,
  Clock,
  Edit,
  FileText,
  Eye,
  Trash2,
  AlertTriangle,
  CalendarRange
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Interface pour l'objet affaire
interface Affaire {
  id: number;
  reference: string;
  client_nom: string;
  offre_reference?: string;
  statut: string;
  date_debut: string;
  date_fin_prevu?: string;
  montant_total?: number;
  taux_avancement?: number;
  produits_count?: number;
}

interface AffaireCardProps {
  affaire: Affaire;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewOffre?: () => void;
  onViewDetails?: () => void;
  className?: string;
  compact?: boolean;
}

const AffaireCard: React.FC<AffaireCardProps> = ({ 
  affaire,
  onClick,
  onEdit,
  onDelete,
  onViewOffre,
  onViewDetails,
  className,
  compact = false
}) => {
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut.toUpperCase().replace('_', ' ')) {
      case 'TERMINE':
      case 'TERMINÉ':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'ANNULE':
      case 'ANNULÉ':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'EN COURS':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'EN ATTENTE':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      case 'EN RETARD':
        return 'text-orange-600 border-orange-200 bg-orange-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    switch(statut.toUpperCase().replace('_', ' ')) {
      case 'TERMINE':
      case 'TERMINÉ':
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'ANNULE':
      case 'ANNULÉ':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'EN COURS':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'EN ATTENTE':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'EN RETARD':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Formater la date
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Non définie';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formater le montant
  const formatMontant = (montant?: number) => {
    if (!montant) return 'N/A';
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Calculer la durée du projet
  const calculateDuration = () => {
    if (!affaire.date_debut || !affaire.date_fin_prevu) return 'Durée indéfinie';
    
    const start = new Date(affaire.date_debut);
    const end = new Date(affaire.date_fin_prevu);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  };

  // Normaliser le statut pour l'affichage
  const normalizeStatus = (statut: string) => {
    return statut.replace('_', ' ');
  };

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "transition-all duration-200 border overflow-hidden",
          onClick ? "cursor-pointer hover:shadow-md hover:border-primary/40" : "",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className={cn("pb-2", compact ? "p-3" : "")}>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={cn("rounded-md", getStatusColor(affaire.statut))}>
                  {getStatusIcon(affaire.statut)}
                  {normalizeStatus(affaire.statut)}
                </Badge>
              </div>
              <CardTitle className={cn("leading-tight", compact ? "text-base" : "text-lg")}>
                {affaire.reference}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4", compact ? "p-3 pt-0" : "")}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{affaire.client_nom}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">Début: {formatDate(affaire.date_debut)}</span>
            </div>

            {!compact && affaire.date_fin_prevu && (
              <div className="flex items-center gap-2">
                <CalendarRange className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">Fin prévue: {formatDate(affaire.date_fin_prevu)}</span>
              </div>
            )}

            {!compact && affaire.offre_reference && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">Offre: {affaire.offre_reference}</span>
              </div>
            )}
          </div>

          {!compact && (
            <>
              <Separator />
              
              {affaire.montant_total && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Montant total</span>
                  <span className="font-semibold text-primary">{formatMontant(affaire.montant_total)}</span>
                </div>
              )}
              
              {affaire.taux_avancement !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avancement</span>
                    <span>{affaire.taux_avancement}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${affaire.taux_avancement}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {affaire.date_debut && affaire.date_fin_prevu && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Durée</span>
                  <Badge variant="outline">{calculateDuration()}</Badge>
                </div>
              )}
              
              {affaire.produits_count && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Produits</span>
                  <Badge variant="secondary">{affaire.produits_count}</Badge>
                </div>
              )}
            </>
          )}
        </CardContent>

        {!compact && (onEdit || onDelete || onViewOffre || onViewDetails) && (
          <CardFooter className="flex justify-between pt-0 px-4 pb-4 gap-2">
            <div className="flex gap-2">
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer</TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex gap-2">
              {onViewOffre && affaire.offre_reference && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={(e) => { e.stopPropagation(); onViewOffre(); }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Voir l'offre
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Consulter l'offre liée</TooltipContent>
                </Tooltip>
              )}
              
              {onViewDetails && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default AffaireCard;