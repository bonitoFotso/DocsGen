import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart4, 
  Building,
  Calendar,
  CheckCircle2, 
  XCircle,
  HelpCircle,
  Edit,
  FileText,
  Eye,
  Trash2,
  PenTool,
  Package
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Interface pour l'objet opportunité
interface Opportunite {
  id: number;
  reference: string;
  client_nom: string;
  produit_name: string;
  statut: string;
  date_detection: string;
  montant_estime: number;
  probabilite: number;
  description?: string;
}

interface OpportuniteCardProps {
  opportunite: Opportunite;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateOffre?: () => void;
  onViewDetails?: () => void;
  className?: string;
  compact?: boolean;
}

export const OpportuniteCard: React.FC<OpportuniteCardProps> = ({ 
  opportunite,
  onClick,
  onEdit,
  onDelete,
  onCreateOffre,
  onViewDetails,
  className,
  compact = false
}) => {
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut.toUpperCase()) {
      case 'GAGNEE':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'PERDUE':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'PROSPECT':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'QUALIFICATION':
        return 'text-indigo-600 border-indigo-200 bg-indigo-50';
      case 'PROPOSITION':
        return 'text-purple-600 border-purple-200 bg-purple-50';
      case 'NEGOCIATION':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    switch(statut.toUpperCase()) {
      case 'GAGNEE':
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case 'PERDUE':
        return <XCircle className="h-3 w-3 mr-1" />;
      case 'PROSPECT':
        return <HelpCircle className="h-3 w-3 mr-1" />;
      case 'QUALIFICATION':
        return <PenTool className="h-3 w-3 mr-1" />;
      case 'PROPOSITION':
        return <FileText className="h-3 w-3 mr-1" />;
      case 'NEGOCIATION':
        return <BarChart4 className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formater le montant
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Obtenir la classe de couleur pour la progression
  const getProgressColor = (probabilite: number) => {
    if (probabilite >= 75) return 'bg-green-500';
    if (probabilite >= 50) return 'bg-blue-500';
    if (probabilite >= 25) return 'bg-amber-500';
    return 'bg-red-500';
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
                <Badge className={cn("rounded-md", getStatusColor(opportunite.statut))}>
                  {getStatusIcon(opportunite.statut)}
                  {opportunite.statut}
                </Badge>
                <Badge variant="outline" className="rounded-md flex items-center">
                  <Package className="h-3 w-3 mr-1" />
                  {opportunite.produit_name}
                </Badge>
              </div>
              <CardTitle className={cn("leading-tight", compact ? "text-base" : "text-lg")}>
                {opportunite.reference}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4", compact ? "p-3 pt-0" : "")}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{opportunite.client_nom}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">Détectée le {formatDate(opportunite.date_detection)}</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Probabilité</span>
              <span className="text-sm font-medium">{opportunite.probabilite}%</span>
            </div>
            <Progress 
              value={opportunite.probabilite} 
              className="h-2" 
              indicatorClassName={getProgressColor(opportunite.probabilite)}
            />
          </div>

          {!compact && (
            <>
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Montant estimé</span>
                <span className="font-semibold text-primary">{formatMontant(opportunite.montant_estime)}</span>
              </div>
              
              {opportunite.description && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm mt-1 line-clamp-2">{opportunite.description}</p>
                </div>
              )}
            </>
          )}
        </CardContent>

        {!compact && (onEdit || onDelete || onCreateOffre || onViewDetails) && (
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
              {onCreateOffre && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      onClick={(e) => { e.stopPropagation(); onCreateOffre(); }}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Créer une offre
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Créer une offre à partir de cette opportunité</TooltipContent>
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