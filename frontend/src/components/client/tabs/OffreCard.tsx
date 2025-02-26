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
  FileDown,
  Eye,
  Trash2,
  Archive,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Interface pour l'objet offre
interface Offre {
  id: number;
  reference: string;
  client_nom: string;
  entity_code: string;
  statut: string;
  date_creation: string;
  montant_total?: number;
  validite_date?: string;
  produits_count?: number;
}

interface OffreCardProps {
  offre: Offre;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onArchive?: () => void;
  onViewDetails?: () => void;
  className?: string;
  compact?: boolean;
}

const OffreCard: React.FC<OffreCardProps> = ({ 
  offre,
  onClick,
  onEdit,
  onDelete,
  onDownload,
  onArchive,
  onViewDetails,
  className,
  compact = false
}) => {
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut.toUpperCase()) {
      case 'GAGNE':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'PERDU':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'EN COURS':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'EN ATTENTE':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    switch(statut.toUpperCase()) {
      case 'GAGNE':
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'PERDU':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'EN COURS':
      case 'EN ATTENTE':
        return <Clock className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Formater la date de création
  const formatDate = (dateString: string) => {
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
                <Badge className={cn("rounded-md", getStatusColor(offre.statut))}>
                  {getStatusIcon(offre.statut)}
                  {offre.statut}
                </Badge>
                <Badge variant="outline" className="rounded-md">
                  {offre.entity_code}
                </Badge>
              </div>
              <CardTitle className={cn("leading-tight", compact ? "text-base" : "text-lg")}>
                {offre.reference}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4", compact ? "p-3 pt-0" : "")}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{offre.client_nom}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">Créée le {formatDate(offre.date_creation)}</span>
            </div>

            {!compact && offre.validite_date && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">Valide jusqu'au {formatDate(offre.validite_date)}</span>
              </div>
            )}
          </div>

          {!compact && offre.montant_total && (
            <>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Montant total</span>
                <span className="font-semibold text-primary">{formatMontant(offre.montant_total)}</span>
              </div>
            </>
          )}

          {!compact && offre.produits_count && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Produits</span>
              <Badge variant="secondary">{offre.produits_count}</Badge>
            </div>
          )}
        </CardContent>

        {!compact && (onEdit || onDelete || onDownload || onArchive || onViewDetails) && (
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

              {onArchive && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Archiver</TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex gap-2">
              {onDownload && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={(e) => { e.stopPropagation(); onDownload(); }}
                    >
                      <FileDown className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Télécharger l'offre</TooltipContent>
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

export default OffreCard;