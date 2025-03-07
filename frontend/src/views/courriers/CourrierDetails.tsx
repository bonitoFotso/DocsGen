// components/CourrierDetails.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Calendar, 
  Building, 
  User, 
  FileText, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  Archive,
  Edit,
  Trash2,
  AlertTriangle,
  FileDown,
  History,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Courrier, CourrierHistory } from '@/services/CourrierService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import DatePickerWithButton from './DatePickerWithButton';

interface CourrierDetailsProps {
  courrier: Courrier;
  history: CourrierHistory[];
  isHistoryLoading: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onMarkAsSent: (date?: string) => void;
  onMarkAsReceived: (date?: string) => void;
  onMarkAsProcessed: () => void;
  isProcessing: boolean;
  isSending: boolean;
  isReceiving: boolean;
  isArchiving: boolean;
}

const CourrierDetails: React.FC<CourrierDetailsProps> = ({
  courrier,
  history,
  isHistoryLoading,
  onBack,
  onEdit,
  onDelete,
  onArchive,
  onMarkAsSent,
  onMarkAsReceived,
  onMarkAsProcessed,
  isProcessing,
  isSending,
  isReceiving,
  isArchiving,
}) => {
  // Fonction pour obtenir la couleur du badge en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut.toUpperCase()) {
      case 'DRAFT':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      case 'SENT':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'RECEIVED':
        return 'text-violet-600 border-violet-200 bg-violet-50';
      case 'PROCESSED':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'ARCHIVED':
        return 'text-gray-600 border-gray-200 bg-gray-50';
      case 'CANCELLED':
        return 'text-red-600 border-red-200 bg-red-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut: string) => {
    switch(statut.toUpperCase()) {
      case 'DRAFT':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'SENT':
        return <ArrowUpRight className="h-4 w-4 mr-1" />;
      case 'RECEIVED':
        return <ArrowDownLeft className="h-4 w-4 mr-1" />;
      case 'PROCESSED':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'ARCHIVED':
        return <Archive className="h-4 w-4 mr-1" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  // Générer les actions basées sur le statut actuel
  const renderActionButtons = () => {
    const actions = [];
    
    // Si le courrier n'est pas archivé ou annulé, on peut le modifier
    if (!['ARCHIVED', 'CANCELLED'].includes(courrier.statut)) {
      actions.push(
        <Button 
          key="edit" 
          variant="outline"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      );
    }
    
    // Actions spécifiques selon le statut
    if (courrier.statut === 'DRAFT') {
      if (courrier.direction === 'OUT') {
        actions.push(
          <Dialog key="send-dialog">
            <DialogTrigger asChild>
              <Button variant="default">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Marquer comme envoyé
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Marquer comme envoyé</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-4">Veuillez sélectionner la date d'envoi :</p>
                <DatePickerWithButton 
                  onConfirm={(date) => onMarkAsSent(date ? format(date, 'yyyy-MM-dd') : undefined)}
                  isLoading={isSending}
                  buttonText="Confirmer l'envoi"
                  defaultDate={new Date()}
                />
              </div>
            </DialogContent>
          </Dialog>
        );
      } else if (courrier.direction === 'IN') {
        actions.push(
          <Dialog key="receive-dialog">
            <DialogTrigger asChild>
              <Button variant="default">
                <ArrowDownLeft className="h-4 w-4 mr-2" />
                Marquer comme reçu
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Marquer comme reçu</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="mb-4">Veuillez sélectionner la date de réception :</p>
                <DatePickerWithButton 
                  onConfirm={(date) => onMarkAsReceived(date ? format(date, 'yyyy-MM-dd') : undefined)}
                  isLoading={isReceiving}
                  buttonText="Confirmer la réception"
                  defaultDate={new Date()}
                />
              </div>
            </DialogContent>
          </Dialog>
        );
      }
    } else if (['SENT', 'RECEIVED'].includes(courrier.statut)) {
      actions.push(
        <Button 
          key="process" 
          variant="default"
          onClick={onMarkAsProcessed}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Marquer comme traité
            </>
          )}
        </Button>
      );
    }
    
    // Si le courrier n'est pas déjà archivé, on peut l'archiver
    if (courrier.statut !== 'ARCHIVED') {
      actions.push(
        <Button 
          key="archive" 
          variant="outline"
          onClick={onArchive}
          disabled={isArchiving}
        >
          {isArchiving ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Archivage...
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 mr-2" />
              Archiver
            </>
          )}
        </Button>
      );
    }
    
    // Si le courrier a un fichier, on peut le télécharger
    if (courrier.fichier) {
      actions.push(
        <Button 
          key="download" 
          variant="outline"
          onClick={() => window.open(courrier.fichier, '_blank')}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Télécharger
        </Button>
      );
    }
    
    // On peut toujours supprimer un courrier
    actions.push(
      <Button 
        key="delete" 
        variant="destructive"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Supprimer
      </Button>
    );
    
    return actions;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack}>
          <ArrowDownLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Détail du Courrier</h1>
      </div>

      <Card className="relative overflow-hidden">
        {courrier.est_urgent && (
          <div className="absolute top-0 left-0 w-2 h-full bg-red-500" />
        )}
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getStatusColor(courrier.statut)}>
                  {getStatusIcon(courrier.statut)}
                  {courrier.statut_display || courrier.statut}
                </Badge>
                
                <Badge variant="outline">
                  {courrier.direction === 'IN' ? 
                    <ArrowDownLeft className="h-3 w-3 mr-1" /> :
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  }
                  {courrier.direction_display || (courrier.direction === 'IN' ? 'Entrant' : 'Sortant')}
                </Badge>
                
                <Badge variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  {courrier.doc_type_display || courrier.doc_type}
                </Badge>
                
                {courrier.est_urgent && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
                
                {courrier.is_overdue && (
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    En retard
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl">{courrier.reference}</CardTitle>
              <CardDescription className="mt-2 text-base">
                {courrier.objet}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                Historique
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Informations de base</h3>
                    <Separator />
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Client:</span>
                        <span className="ml-2">{courrier.client_nom || courrier.client?.nom || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Entité:</span>
                        <span className="ml-2">{courrier.entite_nom || courrier.entite?.nom || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Créé par:</span>
                        <span className="ml-2">{courrier.created_by_name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {courrier.notes && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-muted-foreground">Notes</h3>
                      <Separator />
                      <p className="text-sm whitespace-pre-wrap">{courrier.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-muted-foreground">Dates</h3>
                    <Separator />
                    
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">Date de création:</span>
                        <span className="ml-2">{formatDate(courrier.date_creation)}</span>
                      </div>
                      
                      {courrier.date_envoi && (
                        <div className="flex items-center">
                          <ArrowUpRight className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Date d'envoi:</span>
                          <span className="ml-2">{formatDate(courrier.date_envoi)}</span>
                        </div>
                      )}
                      
                      {courrier.date_reception && (
                        <div className="flex items-center">
                          <ArrowDownLeft className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">Date de réception:</span>
                          <span className="ml-2">{formatDate(courrier.date_reception)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {courrier.fichier && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm text-muted-foreground">Document</h3>
                      <Separator />
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => window.open(courrier.fichier, '_blank')}
                      >
                        <FileDown className="h-4 w-4 mr-2" />
                        Télécharger le document
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <ScrollArea className="h-[400px] pr-4">
                {isHistoryLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-30" />
                    <p>Aucun historique disponible</p>
                  </div>
                ) : (
                  <div className="relative space-y-0">
                    {history.map((item, index) => (
                      <div key={item.id} className="mb-4 relative pl-6">
                        {index < history.length - 1 && (
                          <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-muted" />
                        )}
                        
                        <div className="absolute left-0 top-1 h-5 w-5 rounded-full border-2 border-primary bg-background" />
                        
                        <div className="space-y-1">
                          <div className="font-medium">{item.action_display}</div>
                          <div className="text-sm text-muted-foreground">
                            Par {item.user_name} • {formatDate(item.date_action)}
                          </div>
                          {item.details && (
                            <div className="text-sm mt-1 bg-muted/30 p-2 rounded">
                              {item.details}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-wrap justify-end gap-2">
          {renderActionButtons()}
        </CardFooter>
      </Card>
    </div>
  );
};

export default CourrierDetails;