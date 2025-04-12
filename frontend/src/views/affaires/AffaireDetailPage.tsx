import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAffaire } from '@/hooks/affaire-hooks';
import { format } from 'date-fns';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Icons
import { 
  ArrowLeft, 
  Check, 
  Edit, 
  FileDown, 
  FilePlus, 
  Eye,
  AlertCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import ClientInfoCard from '@/components/offre/ClientInfoCard';



const AffaireDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('informations');
  const [statut, setStatut] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Utilisation du hook pour récupérer les détails de l'affaire
  const {
    affaire,
    loading,
    error,
    changeStatut,
    genererFacture,
    marquerRapportTermine,
    exportPdf,
  } = useAffaire(id ? parseInt(id) : null);

  // Gérer le changement de statut
  const handleChangeStatut = async () => {
    const result = await changeStatut({ statut, commentaire });
    if (result && result.success) {
      setDialogOpen(false);
      setCommentaire('');
    }
  };

  // Gérer la génération de facture
  const handleGenererFacture = async () => {
    await genererFacture();
  };

  // Gérer la validation d'un rapport
  const handleValiderRapport = async (rapportId: number) => {
    await marquerRapportTermine(rapportId);
  };

  // Gérer la navigation vers la page d'édition
  const handleEdit = () => {
    navigate(`/affaires/${id}/edit`);
  };

  // Gérer l'export en PDF
  const handleExportPdf = () => {
    exportPdf();
  };

  const onViewClientProfile = () => {
    if (affaire?.offre?.client?.id) {
      navigate(`/clients/${affaire.offre.client.id}`);
    }
  };

  // Obtenir les transitions autorisées pour le statut actuel
  const getTransitionsAutorisees = (currentStatut: string): string[] => {
    const transitions: Record<string, string[]> = {
      'BROUILLON': ['VALIDE', 'ANNULEE'],
      'VALIDE': ['EN_COURS', 'ANNULEE'],
      'EN_COURS': ['EN_PAUSE', 'TERMINEE', 'ANNULEE'],
      'EN_PAUSE': ['EN_COURS', 'TERMINEE', 'ANNULEE'],
      'TERMINEE': ['EN_COURS'],
      'ANNULEE': ['BROUILLON']
    };
    
    return transitions[currentStatut] || [];
  };

  // Si chargement en cours
  if (loading && !affaire) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur lors du chargement de l'affaire</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <div className="mt-4">
            <Button onClick={() => navigate('/affaires')}>
              Retour à la liste
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Si pas d'affaire trouvée
  if (!affaire) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Affaire non trouvée</AlertTitle>
          <AlertDescription>L'affaire demandée n'existe pas ou a été supprimée.</AlertDescription>
          <div className="mt-4">
            <Button onClick={() => navigate('/affaires')}>
              Retour à la liste
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Obtenir la liste des transitions autorisées
  const transitionsAutorisees = getTransitionsAutorisees(affaire.statut);

  // Étape actuelle dans le processus
  const getCurrentStep = () => {
    const stepMap: Record<string, number> = {
      'BROUILLON': 0,
      'VALIDE': 1,
      'EN_COURS': 2,
      'EN_PAUSE': 2,
      'TERMINEE': 3,
      'ANNULEE': 4
    };
    
    return stepMap[affaire.statut] || 0;
  };

  const currentStep = getCurrentStep();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/affaires')}
          >
            <ArrowLeft size={16} />
            Retour à la liste
          </Button>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleEdit}
            >
              <Edit size={16} />
              Modifier
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={handleExportPdf}
            >
              <FileDown size={16} />
              Exporter PDF
            </Button>
            
            {affaire.montant_restant_a_facturer > 0 && (
              <Button 
                className="flex items-center gap-2"
                onClick={handleGenererFacture}
              >
                <FilePlus size={16} />
                Générer Facture
              </Button>
            )}
            
            {transitionsAutorisees.length > 0 && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    Changer le statut
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Changer le statut de l'affaire</DialogTitle>
                    <DialogDescription>
                      Sélectionnez le nouveau statut et ajoutez un commentaire si nécessaire.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nouveau statut</label>
                      <Select onValueChange={setStatut} value={statut}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {transitionsAutorisees.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s === 'BROUILLON' ? 'Brouillon' :
                               s === 'VALIDE' ? 'Validée' :
                               s === 'EN_COURS' ? 'En cours' :
                               s === 'EN_PAUSE' ? 'En pause' :
                               s === 'TERMINEE' ? 'Terminée' :
                               s === 'ANNULEE' ? 'Annulée' : s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Commentaire (optionnel)</label>
                      <Textarea
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        placeholder="Ajouter un commentaire sur ce changement de statut"
                        rows={4}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      onClick={handleChangeStatut}
                      disabled={!statut}
                    >
                      Confirmer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
        
        {/* Title and Status */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold">Affaire {affaire.reference}</h1>
          <Badge className="text-base px-3 py-1">
            {affaire.statut_display}
          </Badge>
        </div>
        
        {/* Progress Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                  .format(affaire.montant_total)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant Facturé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                  .format(affaire.montant_facture)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Montant Payé</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                  .format(affaire.montant_paye)}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">
                  {affaire.progression}%
                </p>
                <Progress value={affaire.progression} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Status Timeline */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative flex justify-between">
              {/* Progress Bar */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2"
                style={{ 
                  width: `${affaire.statut === 'ANNULEE' ? 0 : (currentStep / 3) * 100}%`,
                  backgroundColor: affaire.statut === 'ANNULEE' ? 'var(--destructive)' : undefined
                }}
              ></div>
              
              {/* Steps */}
              <div className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > 0 ? <Check size={16} /> : 1}
                </div>
                <span className="text-xs mt-1">Brouillon</span>
              </div>
              
              <div className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > 1 ? <Check size={16} /> : 2}
                </div>
                <span className="text-xs mt-1">Validée</span>
              </div>
              
              <div className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 2 
                    ? (affaire.statut === 'EN_PAUSE' 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-primary text-primary-foreground')
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {affaire.statut === 'EN_PAUSE' 
                    ? <Clock size={16} />
                    : currentStep > 2 ? <Check size={16} /> : 3
                  }
                </div>
                <span className="text-xs mt-1">
                  En cours
                  {affaire.statut === 'EN_PAUSE' && <span className="text-amber-500 ml-1">(En pause)</span>}
                </span>
              </div>
              
              <div className="relative flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > 3 ? <Check size={16} /> : 4}
                </div>
                <span className="text-xs mt-1">Terminée</span>
              </div>
              
              {/* Annulation step */}
              {affaire.statut === 'ANNULEE' && (
                <div className="absolute right-0 top-0 flex flex-col items-center z-20">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-destructive text-destructive-foreground">
                    <AlertCircle size={16} />
                  </div>
                  <span className="text-xs mt-1 text-destructive">Annulée</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
        {/* Main Content */}
        <Tabs defaultValue="informations" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
            <TabsTrigger value="informations">Informations</TabsTrigger>
            <TabsTrigger value="rapports">Rapports</TabsTrigger>
            <TabsTrigger value="factures">Factures</TabsTrigger>
          </TabsList>
          
          <TabsContent value="informations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Détails de l'affaire</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Référence</h4>
                      <p>{affaire.reference}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Client</h4>
                      <p>{affaire.client?.nom}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Date de début</h4>
                      <p>{format(new Date(affaire.date_debut), 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Date de fin prévue</h4>
                      <p>
                        {affaire.date_fin_prevue
                          ? format(new Date(affaire.date_fin_prevue), 'dd/MM/yyyy')
                          : 'Non définie'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Date de fin réelle</h4>
                      <p>
                        {affaire.date_fin_reelle
                          ? format(new Date(affaire.date_fin_reelle), 'dd/MM/yyyy')
                          : 'Non définie'}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Responsable</h4>
                      <p>{affaire.responsable_nom || 'Non assigné'}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Création</h4>
                      <p>
                        {format(new Date(affaire.date_creation), 'dd/MM/yyyy HH:mm')} par {affaire.created_by?.first_name} {affaire.created_by?.last_name}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                  <p className="whitespace-pre-line">{affaire.notes || 'Aucune note'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Informations financières</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Montant total</h4>
                      <p>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                          .format(affaire.montant_total)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Montant facturé</h4>
                      <p>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                          .format(affaire.montant_facture)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Montant payé</h4>
                      <p>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                          .format(affaire.montant_paye)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Reste à facturer</h4>
                      <p>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                          .format(affaire.montant_restant_a_facturer)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Reste à payer</h4>
                      <p>
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                          .format(affaire.montant_restant_a_payer)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rapports">
            <Card>
              <CardHeader>
                <CardTitle>Liste des rapports</CardTitle>
              </CardHeader>
              <CardContent>
                {affaire.rapports && affaire.rapports.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produit</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Formation</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affaire.rapports.map((rapport) => (
                        <TableRow key={rapport.id}>
                          <TableCell className="font-medium">{rapport.produit_nom}</TableCell>
                          <TableCell>
                            <Badge variant={rapport.produit_category === 'FOR' ? 'destructive' : 'secondary'}>
                              {rapport.produit_category === 'FOR' ? 'Formation' : 'Prestation'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              rapport.statut === 'BROUILLON' ? 'outline' :
                              rapport.statut === 'VALIDE' ? 'default' : 'secondary'
                            }>
                              {rapport.statut_display}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={rapport.has_formation ? 'default' : 'outline'}>
                              {rapport.has_formation ? 'Oui' : 'Non'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {rapport.statut === 'BROUILLON' && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleValiderRapport(rapport.id)}
                                      >
                                        <CheckCircle2 size={16} />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Marquer comme terminé</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun rapport disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="factures">
            <Card>
              <CardHeader>
                <CardTitle>Liste des factures</CardTitle>
              </CardHeader>
              <CardContent>
                {affaire.factures && affaire.factures.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Référence</TableHead>
                        <TableHead>Montant HT</TableHead>
                        <TableHead>Montant TTC</TableHead>
                        <TableHead>Date de création</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {affaire.factures.map((facture) => (
                        <TableRow key={facture.id}>
                          <TableCell className="font-medium">{facture.reference}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                              .format(facture.montant_ht)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
                              .format(facture.montant_ttc)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(facture.date_creation), 'dd/MM/yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              facture.statut === 'BROUILLON' ? 'outline' :
                              facture.statut === 'EMISE' ? 'secondary' :
                              facture.statut === 'PAYEE' ? 'default' :
                              facture.statut === 'ANNULEE' ? 'destructive' : 'outline'
                            }>
                              {facture.statut_display}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => navigate(`/factures/${facture.id}`)}
                                  >
                                    <Eye size={16} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Voir la facture</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune facture disponible</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        </div>
        <div className="col-span-1 space-y-6">
          {/* Informations client */}
          <ClientInfoCard 
            client={affaire.offre.client} 
            contact={affaire.offre.contact}
            onViewClientProfile={onViewClientProfile}
          />

        </div>
        </div>
        
        
      </div>
    </div>
  );
};

export default AffaireDetailPage;