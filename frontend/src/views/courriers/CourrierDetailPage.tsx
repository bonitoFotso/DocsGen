import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  ArrowLeft, 
  ChevronRight, 
  Edit, 
  FileText, 
  Mail, 
  Trash2, 
  User, 
  Calendar, 
  Clock, 
  Tag, 
  MessageSquare,
  CheckCircle,
  ChevronDown,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCourrier } from '@/hooks/useCourriers';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import DocumentsTab from '@/components/DocumentsTab';

const CourrierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('informations');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Récupérer les détails du courrier
  const { courrier, isLoading, error, deleteCourrier, markAsProcessed, markAsSent } = useCourrier(id ? parseInt(id) : undefined);

  // Gérer la redirection après suppression
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteCourrier(parseInt(id));
      toast("Courrier supprimé",{
        description: "Le courrier a été supprimé avec succès",
      });
      navigate('/courriers');
    } catch (error) {
        console.log(error)
      toast("Erreur",{
        description: "Impossible de supprimer le courrier",
      });
    }
  };

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-200 text-gray-800';
      case 'SENT': return 'bg-blue-100 text-blue-800';
      case 'RECEIVED': return 'bg-purple-100 text-purple-800';
      case 'PROCESSED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-amber-100 text-amber-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour traduire le statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'SENT': return 'Envoyé';
      case 'RECEIVED': return 'Reçu';
      case 'PROCESSED': return 'Traité';
      case 'ARCHIVED': return 'Archivé';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="full">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/courriers')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Container>
    );
  }

  if (error || !courrier) {
    return (
      <Container maxWidth="xl" className="py-8">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/courriers')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Impossible de charger les détails du courrier. Veuillez réessayer ou contacter le support.
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/courriers')}>
          Retourner à la liste des courriers
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="full" className="py-8">
      {/* En-tête avec navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/courriers')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>Courriers</span>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="font-medium text-foreground">{courrier.reference || 'Détails'}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="gap-1"
            >
              Actions
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            
            {showMoreActions && (
              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10 bg-white border border-slate-200">
                <div className="py-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-3 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                        // Action pour marquer comme envoyé
                        markAsSent({ id: courrier.id });
                      
                      setShowMoreActions(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme envoyer
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-3 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                        // Action pour marquer comme envoyé
                        markAsProcessed(courrier.id);
                      
                      setShowMoreActions(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Marquer comme traité
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-3 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      // Action pour ajouter un commentaire
                      setShowMoreActions(false);
                    }}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ajouter un commentaire
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-3 text-sm text-slate-700 hover:bg-slate-100"
                    onClick={() => {
                      // Action pour ajouter un document
                      setShowMoreActions(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un document
                  </Button>
                  <Separator className="my-1" />
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start pl-3 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                      setShowMoreActions(false);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button 
            variant="default"
            onClick={() => navigate(`/courriers/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </div>

      {/* Carte d'en-tête avec les infos principales */}
      <Card className="mb-6 border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                {courrier.reference || 'Sans référence'}
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                {courrier.objet}
              </CardDescription>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={`${getStatusColor(courrier.statut)} px-3 py-1`}>
                  {getStatusLabel(courrier.statut)}
                </Badge>
                
                {courrier.est_urgent && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Urgent
                  </Badge>
                )}
                
                {courrier.is_overdue && (
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                    En retard
                  </Badge>
                )}
                
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200">
                  {courrier.direction === 'IN' ? 'Entrant' : 'Sortant'}
                </Badge>
                
                <Badge variant="outline">
                  {courrier.doc_type_display}
                </Badge>
              </div>
            </div>
            
            <div className="mt-3 md:mt-0 flex flex-col gap-2">
              <div className="bg-slate-50 p-3 rounded-md text-sm">
                <p className="text-xs uppercase font-semibold text-slate-500 mb-1">
                  Correspondant
                </p>
                <p className="font-medium">{courrier.correspondant?.nom || 'Non renseigné'}</p>
                <p className="text-slate-600 text-xs mt-1">
                  {courrier.correspondant?.organisation && (
                    <>{courrier.correspondant.organisation}<br /></>
                  )}
                  {courrier.correspondant?.email && (
                    <>{courrier.correspondant.email}<br /></>
                  )}
                  {courrier.correspondant?.telephone && (
                    <>{courrier.correspondant.telephone}</>
                  )}
                </p>
              </div>
              
              <div className="bg-slate-50 p-3 rounded-md text-sm">
                <p className="text-xs uppercase font-semibold text-slate-500 mb-1">
                  Dates
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="text-xs text-slate-500">Envoi:</p>
                  <p className="text-xs font-medium">
                    {courrier.date_envoi 
                      ? format(new Date(courrier.date_envoi), 'dd/MM/yyyy', { locale: fr })
                      : '-'}
                  </p>
                  
                  <p className="text-xs text-slate-500">Réception:</p>
                  <p className="text-xs font-medium">
                    {courrier.date_reception 
                      ? format(new Date(courrier.date_reception), 'dd/MM/yyyy', { locale: fr })
                      : '-'}
                  </p>
                  
                  <p className="text-xs text-slate-500">Échéance:</p>
                  <p className={`text-xs font-medium ${courrier.is_overdue ? 'text-red-600' : ''}`}>
                    {courrier.date_echeance 
                      ? format(new Date(courrier.date_echeance), 'dd/MM/yyyy', { locale: fr })
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contenu principal avec les onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="informations">Informations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
          <TabsTrigger value="commentaires">Commentaires</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="mt-0">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Détails du courrier</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Informations générales
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Référence</p>
                        <p className="font-medium">{courrier.reference || 'Non renseigné'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Type</p>
                        <p className="font-medium">{courrier.doc_type_display}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Direction</p>
                        <p className="font-medium">{courrier.direction === 'IN' ? 'Entrant' : 'Sortant'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Statut</p>
                        <Badge className={`${getStatusColor(courrier.statut)}`}>
                          {getStatusLabel(courrier.statut)}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Priorité</p>
                        <p className="font-medium">{courrier.est_urgent ? 'Urgent' : 'Normal'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Créé par</p>
                        <p className="font-medium">{courrier.created_by || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 mt-8 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Dates
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Date d'envoi</p>
                        <p className="font-medium">
                          {courrier.date_envoi 
                            ? format(new Date(courrier.date_envoi), 'PPP', { locale: fr })
                            : 'Non renseigné'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Date de réception</p>
                        <p className="font-medium">
                          {courrier.date_reception 
                            ? format(new Date(courrier.date_reception), 'PPP', { locale: fr })
                            : 'Non renseigné'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Date d'échéance</p>
                        <p className={`font-medium ${courrier.is_overdue ? 'text-red-600' : ''}`}>
                          {courrier.date_echeance 
                            ? format(new Date(courrier.date_echeance), 'PPP', { locale: fr })
                            : 'Non renseigné'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Date de traitement</p>
                        <p className="font-medium">
                          {courrier.date_traitement 
                            ? format(new Date(courrier.date_traitement), 'PPP', { locale: fr })
                            : 'Non renseigné'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Date de création</p>
                        <p className="font-medium">
                          {courrier.created_at 
                            ? format(new Date(courrier.created_at), 'PPP', { locale: fr })
                            : 'Non renseigné'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Dernière modification</p>
                        <p className="font-medium">
                          {courrier.updated_at 
                            ? format(new Date(courrier.updated_at), 'PPP', { locale: fr })
                            : 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Informations du correspondant
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Nom</p>
                        <p className="font-medium">{courrier.correspondant?.nom || 'Non renseigné'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Organisation</p>
                        <p className="font-medium">{courrier.correspondant?.organisation || 'Non renseigné'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-medium">{courrier.correspondant?.email || 'Non renseigné'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Téléphone</p>
                        <p className="font-medium">{courrier.correspondant?.telephone || 'Non renseigné'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-slate-500">Adresse</p>
                        <p className="font-medium">{courrier.correspondant?.adresse || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-sm font-semibold text-muted-foreground mb-4 mt-8 flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    Description / Notes
                  </h3>
                  
                  <div className="bg-slate-50 p-4 rounded-md min-h-32">
                    {courrier.description ? (
                      <p className="whitespace-pre-line">{courrier.description}</p>
                    ) : (
                      <p className="text-slate-500 italic">Aucune description fournie.</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <DocumentsTab courrier={{
                  fichier: courrier.fichier,
                  fichier_taille: undefined
              }} />

        <TabsContent value="historique" className="mt-0">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Historique des actions</CardTitle>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              <ScrollArea className="h-[500px] pr-4">
                {courrier.historique && courrier.historique.length > 0 ? (
                  <div className="relative pl-6">
                    {/* Ligne verticale pour connecter les événements */}
                    <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200"></div>
                    
                    <ul className="space-y-6">
                      
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-slate-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Aucun historique disponible</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      L'historique des actions pour ce courrier n'est pas encore disponible.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commentaires" className="mt-0">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Commentaires</CardTitle>
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ajouter un commentaire
              </Button>
            </CardHeader>
            <Separator />
            <CardContent className="p-6">
              {courrier.commentaires && courrier.commentaires.length > 0 ? (
                <div className="space-y-4">
                  
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-slate-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Aucun commentaire</h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Il n'y a pas encore de commentaires pour ce courrier. Ajoutez un commentaire pour communiquer avec l'équipe.
                  </p>
                  <Button>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ajouter un commentaire
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Boîte de dialogue de confirmation de suppression */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer le courrier"
        description="Êtes-vous sûr de vouloir supprimer ce courrier ? Cette action est irréversible et toutes les données associées seront perdues."
      />
    </Container>
  );
};

export default CourrierDetailPage;