// components/CourrierCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Mail, 
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle2, 
  XCircle,
  Clock,
  Edit,
  FileDown,
  Eye,
  Trash2,
  Archive,
  AlertCircle,
  User,
  FileText,
  Building
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Courrier } from '@/types/courrier';
import { useCourrier } from '@/hooks/useCourriers';

interface CourrierCardProps {
  courrier: Courrier;
  onClick?: () => void;
  compact?: boolean;
}

const STATUS_STYLES = {
  'DRAFT': 'text-amber-600 border-amber-200 bg-amber-50',
  'SENT': 'text-blue-600 border-blue-200 bg-blue-50',
  'RECEIVED': 'text-violet-600 border-violet-200 bg-violet-50',
  'PROCESSED': 'text-green-600 border-green-200 bg-green-50',
  'ARCHIVED': 'text-gray-600 border-gray-200 bg-gray-50',
  'CANCELLED': 'text-red-600 border-red-200 bg-red-50',
  'DEFAULT': 'text-gray-600 border-gray-200 bg-gray-50'
};

const DOC_TYPE_STYLES = {
  'LETTER': 'text-blue-600 border-blue-200 bg-blue-50',
  'INVOICE': 'text-green-600 border-green-200 bg-green-50',
  'CONTRACT': 'text-purple-600 border-purple-200 bg-purple-50',
  'NOTICE': 'text-yellow-600 border-yellow-200 bg-yellow-50',
  'REPORT': 'text-teal-600 border-teal-200 bg-teal-50',
  'OTHER': 'text-gray-600 border-gray-200 bg-gray-50',
  'DEFAULT': 'text-gray-600 border-gray-200 bg-gray-50'
};

const STATUS_ICONS = {
  'DRAFT': <Clock className="h-3 w-3 mr-1" />,
  'SENT': <ArrowUpRight className="h-3 w-3 mr-1" />,
  'RECEIVED': <ArrowDownLeft className="h-3 w-3 mr-1" />,
  'PROCESSED': <CheckCircle2 className="h-3 w-3 mr-1" />,
  'ARCHIVED': <Archive className="h-3 w-3 mr-1" />,
  'CANCELLED': <XCircle className="h-3 w-3 mr-1" />
};

const CourrierCard: React.FC<CourrierCardProps> = ({ 
  courrier,
  onClick,
  compact = false
}) => {
  const { isLoading, error, deleteCourrier, markAsProcessed, markAsSent, markAsReceived, archiveCourrier } = useCourrier(courrier.id ? parseInt(courrier.id.toString()) : undefined);
  
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (statut: string) => {
    const statusKey = statut.toUpperCase() as keyof typeof STATUS_STYLES;
    return STATUS_STYLES[statusKey] || STATUS_STYLES.DEFAULT;
  };

  // Fonction pour obtenir la couleur du badge en fonction du type de document
  const getDocTypeColor = (docType: string) => {
    const docTypeKey = docType.toUpperCase() as keyof typeof DOC_TYPE_STYLES;
    return DOC_TYPE_STYLES[docTypeKey] || DOC_TYPE_STYLES.DEFAULT;
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    const statusKey = statut.toUpperCase() as keyof typeof STATUS_ICONS;
    return STATUS_ICONS[statusKey] || null;
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      console.error('Erreur de formatage de date:', e);
      return dateString;
    }
  };

  const getActionButtons = () => {
    const actions: JSX.Element[] = [];
    
    // Actions basées sur le statut du courrier
    switch (courrier.statut.toUpperCase()) {
      case 'DRAFT':
        if (courrier.direction === 'OUT') {
          actions.push(
            <Button 
              key="send"
              variant="outline" 
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              onClick={handleMarkAsSent}
              disabled={isLoading}
            >
              <ArrowUpRight className="h-4 w-4 mr-1" />
              Marquer comme envoyé
            </Button>
          );
        }
        if (courrier.direction === 'IN') {
          actions.push(
            <Button 
              key="receive"
              variant="outline" 
              size="sm"
              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50 border-violet-200"
              onClick={handleMarkAsReceived}
              disabled={isLoading}
            >
              <ArrowDownLeft className="h-4 w-4 mr-1" />
              Marquer comme reçu
            </Button>
          );
        }
        break;
      case 'SENT':
      case 'RECEIVED':
        actions.push(
          <Button 
            key="process"
            variant="outline" 
            size="sm"
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
            onClick={handleMarkAsProcessed}
            disabled={isLoading}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Marquer comme traité
          </Button>
        );
        break;
    }
    
    // Action détails disponible pour tous les statuts
    actions.push(
      <Button 
        key="details"
        variant="default" 
        size="sm"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <Eye className="h-4 w-4 mr-1" />
        Détails
      </Button>
    );
    
    return actions;
  };

  // Gestion des actions avec les hooks fournis par useCourrier
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteCourrier && courrier.id) {
      deleteCourrier(courrier.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (archiveCourrier && courrier.id) {
      archiveCourrier(courrier.id);
    }
  };

  const handleMarkAsProcessed = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (markAsProcessed && courrier.id) {
      markAsProcessed(courrier.id);
    }
  };

  const handleMarkAsSent = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (markAsSent && courrier.id) {
      markAsSent({ id: courrier.id });
    }
  };

  const handleMarkAsReceived = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (markAsReceived && courrier.id) {
      markAsReceived({ id: courrier.id });
    }
  };

  // Composant ActionButton interne
  const ActionButton = ({ 
    icon, 
    label, 
    onClick, 
    variant = "outline" as "outline" | "default", 
    className = "", 
    disabled = false 
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    variant?: "outline" | "default";
    className?: string;
    disabled?: boolean;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant={variant} 
          size="icon"
          className={className}
          onClick={onClick}
          disabled={disabled || isLoading}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "transition-all duration-200 border overflow-hidden",
          onClick ? "cursor-pointer hover:shadow-md hover:border-primary/40" : "",
          courrier.is_overdue ? "border-red-300" : "",
          courrier.est_urgent ? "border-l-4 border-l-red-500" : ""
        )}
        onClick={onClick}
      >
        <CardHeader className={cn("pb-2", compact ? "p-3" : "")}>
          {error && (
            <div className="mb-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
              Une erreur est survenue: {error?.message || String(error)}
            </div>
          )}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("rounded-md", getStatusColor(courrier.statut))}>
                  {isLoading ? (
                    <span className="animate-pulse h-3 w-3 mr-1 bg-current rounded-full"></span>
                  ) : (
                    getStatusIcon(courrier.statut)
                  )}
                  {courrier.statut_display || courrier.statut}
                </Badge>
                
                <Badge variant="outline" className={cn("rounded-md", getDocTypeColor(courrier.doc_type))}>
                  <FileText className="h-3 w-3 mr-1" />
                  {courrier.doc_type_display || courrier.doc_type}
                </Badge>
                
                <Badge variant="outline" className="rounded-md">
                  {courrier.direction === 'IN' ? 
                    <ArrowDownLeft className="h-3 w-3 mr-1" /> :
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  }
                  {courrier.direction_display || (courrier.direction === 'IN' ? 'Entrant' : 'Sortant')}
                </Badge>
                
                {courrier.est_urgent && (
                  <Badge variant="outline" className="rounded-md text-red-600 border-red-200 bg-red-50">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>
              
              <CardTitle className={cn("leading-tight", compact ? "text-base" : "text-lg")}>
                {courrier.reference}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4", compact ? "p-3 pt-0" : "")}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{courrier.client_nom || (courrier.client?.nom || 'N/A')}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="font-medium truncate">{courrier.objet}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">Créé le {formatDate(courrier.date_creation)}</span>
            </div>

            {!compact && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {courrier.date_envoi && (
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">Envoyé le {formatDate(courrier.date_envoi)}</span>
                  </div>
                )}
                
                {courrier.date_reception && (
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm">Reçu le {formatDate(courrier.date_reception)}</span>
                  </div>
                )}
              </div>
            )}
            
            {!compact && courrier.created_by_name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">Créé par {courrier.created_by_name}</span>
              </div>
            )}
          </div>

          {!compact && courrier.notes && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-2">{courrier.notes}</p>
              </div>
            </>
          )}
        </CardContent>

        {!compact && (
          <CardFooter className="flex justify-between pt-0 px-4 pb-4 gap-2 flex-wrap">
            <div className="flex gap-2">
              <ActionButton 
                icon={<Edit className="h-4 w-4" />} 
                label="Modifier" 
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
              
              <ActionButton 
                icon={<Trash2 className="h-4 w-4" />} 
                label="Supprimer" 
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                disabled={isLoading}
              />

              {courrier.statut !== 'ARCHIVED' && (
                <ActionButton 
                  icon={<Archive className="h-4 w-4" />} 
                  label="Archiver" 
                  onClick={handleArchive}
                  disabled={isLoading}
                />
              )}
              
              {courrier.fichier && (
                <ActionButton 
                  icon={<FileDown className="h-4 w-4" />} 
                  label="Télécharger" 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-200"
                />
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {getActionButtons()}
            </div>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default CourrierCard;