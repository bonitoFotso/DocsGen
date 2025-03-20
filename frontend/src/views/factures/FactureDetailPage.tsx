import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useFacture } from '@/hooks/useFacture';
import { useExportFacture } from '@/hooks/useExportFacture';
import { formatDate, formatCurrency } from '@/utils/formatters';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  CircleDashed,
  MoreHorizontal,
  Save,
  Edit,
  FileDown,
  Printer,
  Trash2,
  RefreshCw,
  FileText,
  Building,
  Mail,
  Info,
  AlertTriangle,
  Upload,
  DollarSign,
  CreditCard,
  File,
  Send,
  Eye
} from 'lucide-react';

const FactureDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    facture,
    isLoading,
    error,
    isSaving,
    isUploading,
    fetchFacture,
    updateFacture,
    deleteFacture,
    markAsPaid,
    markAsIssued,
    cancelFacture,
    uploadFile,
    downloadFile,
    exportPdf
  } = useFacture({ factureId: id ? parseInt(id) : undefined });
  const { isExporting } = useExportFacture();

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    notes: '',
    montant_ht: 0,
    taux_tva: 19.25,
    date_echeance: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Vérifier s'il faut ouvrir la boîte de dialogue de paiement depuis la navigation
  useEffect(() => {
    if (location.state?.openPaymentDialog && facture) {
      setIsPaymentDialogOpen(true);
      // Nettoyer l'état de la location pour éviter de rouvrir à chaque fois
      navigate(location.pathname, { replace: true });
    }
  }, [location, facture, navigate]);

  // Mettre à jour les données d'édition lorsque la facture est chargée
  useEffect(() => {
    if (facture) {
      setEditedData({
        notes: facture.notes || '',
        montant_ht: facture.montant_ht,
        taux_tva: facture.taux_tva,
        date_echeance: facture.date_echeance ? new Date(facture.date_echeance).toISOString().split('T')[0] : ''
      });
    }
  }, [facture]);

  // Navigation vers la liste
  const handleBackToList = () => {
    navigate('/factures');
  };

  // Modification des champs d'édition
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enregistrer les modifications
  const handleSaveChanges = async () => {
    if (!id) return;

    try {
      await updateFacture(parseInt(id), {
        notes: editedData.notes,
        montant_ht: Number(editedData.montant_ht),
        taux_tva: Number(editedData.taux_tva),
        date_echeance: editedData.date_echeance || undefined
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
    }
  };

  // Annuler les modifications
  const handleCancelEdit = () => {
    if (facture) {
      setEditedData({
        notes: facture.notes || '',
        montant_ht: facture.montant_ht,
        taux_tva: facture.taux_tva,
        date_echeance: facture.date_echeance ? new Date(facture.date_echeance).toISOString().split('T')[0] : ''
      });
    }
    setIsEditing(false);
  };

  // Supprimer la facture
  const handleDelete = async () => {
    if (!id) return;

    const success = await deleteFacture(parseInt(id));
    if (success) {
      navigate('/factures');
    }
    setIsDeleteDialogOpen(false);
  };

  // Marquer comme émise
  const handleMarkAsIssued = async () => {
    if (!id) return;

    await markAsIssued(parseInt(id));
  };

  // Marquer comme payée
  const handleMarkAsPaid = async () => {
    if (!id) return;

    const amount = paymentAmount ? parseFloat(paymentAmount) : undefined;
    await markAsPaid(parseInt(id), amount);
    setIsPaymentDialogOpen(false);
    setPaymentAmount('');
  };

  // Annuler la facture
  const handleCancel = async () => {
    if (!id) return;

    await cancelFacture(parseInt(id));
  };

  // Gérer le fichier sélectionné
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Uploader le fichier
  const handleFileUpload = async () => {
    if (!id || !selectedFile) return;

    await uploadFile(parseInt(id), selectedFile);
    setSelectedFile(null);

    // Réinitialiser l'input file
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Télécharger le fichier
  const handleDownloadFile = async () => {
    if (!id) return;

    await downloadFile(parseInt(id));
  };

  // Exporter en PDF
  const handleExportPdf = async () => {
    if (!id) return;

    await exportPdf(parseInt(id));
  };

  // Afficher le badge de statut
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'BROUILLON':
        return <Badge variant="outline" className="bg-gray-100">
          <CircleDashed className="mr-1 h-3 w-3" /> Brouillon
        </Badge>;
      case 'EMISE':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <Send className="mr-1 h-3 w-3" /> Émise
        </Badge>;
      case 'PAYEE':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Payée
        </Badge>;
      case 'ANNULEE':
        return <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" /> Annulée
        </Badge>;
      case 'IMPAYEE':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">
          <AlertTriangle className="mr-1 h-3 w-3" /> Impayée
        </Badge>;
      case 'PARTIELLEMENT_PAYEE':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
          <CreditCard className="mr-1 h-3 w-3" /> Partiellement payée
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculer le pourcentage payé
  const calculatePaymentPercentage = () => {
    if (!facture || facture.montant_ttc === 0) return 0;
    return (facture.montant_paye / facture.montant_ttc) * 100;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec bouton retour et actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isLoading ? 'Chargement...' : facture ? `Facture: ${facture.reference}` : 'Détail Facture'}
          </h1>
          {facture && renderStatusBadge(facture.statut)}
        </div>

        <div className="flex space-x-2">
          {facture && !isEditing && (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={facture.statut !== 'BROUILLON'}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>

              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Exporter PDF
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>

                  {facture.statut === 'BROUILLON' && (
                    <DropdownMenuItem onClick={handleMarkAsIssued}>
                      <Send className="mr-2 h-4 w-4" />
                      Marquer comme émise
                    </DropdownMenuItem>
                  )}

                  {(facture.statut === 'EMISE' || facture.statut === 'IMPAYEE' || facture.statut === 'PARTIELLEMENT_PAYEE') && (
                    <DropdownMenuItem onClick={() => setIsPaymentDialogOpen(true)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Enregistrer un paiement
                    </DropdownMenuItem>
                  )}

                  {facture.statut !== 'ANNULEE' && facture.statut !== 'PAYEE' && (
                    <DropdownMenuItem onClick={handleCancel}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Annuler la facture
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleExportPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exporter en PDF
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => fetchFacture(parseInt(id!))}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Actualiser
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {isEditing && (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Annuler
              </Button>

              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Enregistrer
              </Button>
            </>
          )}
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-muted-foreground" />
            <p>Chargement des détails de la facture...</p>
          </CardContent>
        </Card>
      ) : !facture ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Info className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p>Facture introuvable</p>
            <Button
              variant="outline"
              onClick={handleBackToList}
              className="mt-4"
            >
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="affaire">Affaire & Client</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
          </TabsList>

          {/* Onglet Détails */}
          <TabsContent value="details">
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
                      <div className="mt-1 font-medium">{facture.reference}</div>
                    </div>
                    <div>
                      <Label>Séquence</Label>
                      <div className="mt-1">{facture.sequence_number}</div>
                    </div>
                    <div>
                      <Label>Date de création</Label>
                      <div className="mt-1">{formatDate(facture.date_creation)}</div>
                    </div>
                    <div>
                      <Label>Date d'émission</Label>
                      <div className="mt-1">
                        {facture.date_emission ? formatDate(facture.date_emission) : 'Non émise'}
                      </div>
                    </div>
                    <div>
                      <Label>Date d'échéance</Label>
                      {isEditing ? (
                        <Input
                          name="date_echeance"
                          type="date"
                          value={editedData.date_echeance}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <div className="mt-1">
                          {facture.date_echeance ? formatDate(facture.date_echeance) : 'Non définie'}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Date de paiement</Label>
                      <div className="mt-1">
                        {facture.date_paiement ? formatDate(facture.date_paiement) : 'Non payée'}
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
                        placeholder="Notes ou commentaires sur cette facture..."
                      />
                    ) : (
                      <div className="mt-1 p-2 bg-muted/20 rounded-md min-h-[80px]">
                        {facture.notes || 'Aucune note'}
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
                        {formatCurrency(facture.montant_ht)}
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
                        {facture.taux_tva}%
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Montant TVA</Label>
                    <div className="mt-1">
                      {formatCurrency(facture.montant_tva)}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Montant TTC</Label>
                    <div className="mt-1 font-bold text-xl">
                      {formatCurrency(facture.montant_ttc)}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>État du paiement</Label>
                    <div className="space-y-2 mt-1">
                      <div className="flex justify-between">
                        <span>Payé : {formatCurrency(facture.montant_paye)}</span>
                        <span>{formatCurrency(facture.solde)} restants</span>
                      </div>
                      <Progress value={calculatePaymentPercentage()} className="h-2" />

                      {facture.est_en_retard && (
                        <div className="mt-2 p-2 bg-red-50 text-red-800 rounded-md text-sm flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Paiement en retard
                        </div>
                      )}
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
                      <Label className="text-sm text-muted-foreground">Créé par</Label>
                      <div className="mt-1">
                        {facture.created_by_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Date de création</Label>
                      <div className="mt-1">
                        {formatDate(facture.created_at, { showTime: true })}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Dernière modification par</Label>
                      <div className="mt-1">
                        {facture.updated_by_name || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Date de modification</Label>
                      <div className="mt-1">
                        {formatDate(facture.updated_at, { showTime: true })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Affaire & Client */}
          <TabsContent value="affaire">
            {typeof facture.affaire === 'object' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations du client */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-lg">{facture.client_nom}</span>
                    </div>

                    {facture.affaire.id && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{facture.affaire.id}</span>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => navigate(`/clients/${typeof facture.affaire === 'object' ? facture.id : ''}`)}
                    >
                      Voir le client
                    </Button>
                  </CardContent>
                </Card>

                {/* Informations de l'affaire */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de l'affaire</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <span className="font-semibold text-lg">{facture.affaire.reference}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-muted/30">
                        {typeof facture.affaire === 'object' ? facture.affaire.reference : 'N/A'}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-800">
                        {facture.entity_code}
                      </Badge>
                    </div>

                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => navigate(`/affaires/${typeof facture.affaire === 'object' ? facture.affaire.id : ''}`)}
                    >
                      Voir l'affaire
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center">
                  <Info className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <p>Informations client et affaire non disponibles en mode liste.</p>
                  <p className="text-sm text-muted-foreground mt-2">Actualisez pour charger les détails complets.</p>
                  <Button
                    variant="outline"
                    onClick={() => fetchFacture(parseInt(id!))}
                    className="mt-4"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Charger les détails
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Onglet Document */}
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle>Document</CardTitle>
                <CardDescription>Téléchargez ou visualisez le document de la facture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {facture.fichier ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-md flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <File className="h-10 w-10 text-blue-500" />
                        <div>
                          <p className="font-medium">{facture.fichier.split('/').pop()}</p>
                          <p className="text-sm text-muted-foreground">Document facture</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadFile}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Télécharger
                        </Button>

                        <Button size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualiser
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Remplacer le document</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <Button
                          onClick={handleFileUpload}
                          disabled={!selectedFile || isUploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Envoi...' : 'Envoyer'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-8 border rounded-md border-dashed text-center">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <h3 className="font-medium">Aucun document</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Aucun fichier n'a été téléchargé pour cette facture
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <Input
                          id="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx"
                        />
                        <Button
                          onClick={handleFileUpload}
                          disabled={!selectedFile || isUploading}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploading ? 'Envoi...' : 'Envoyer'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium text-lg">Actions de document</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleExportPdf}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Exporter en PDF
                    </Button>

                    <Button variant="outline">
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimer
                    </Button>

                    <Button variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Envoyer par email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la facture</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'enregistrement de paiement */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enregistrer un paiement</DialogTitle>
            <DialogDescription>
              Saisissez le montant payé pour cette facture. Laissez vide pour marquer la facture comme entièrement payée.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Montant du paiement</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder={`${facture?.montant_ttc || 0}`}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {facture && (
                  <>
                    Montant total: {formatCurrency(facture.montant_ttc)},
                    Déjà payé: {formatCurrency(facture.montant_paye)},
                    Restant: {formatCurrency(facture.solde)}
                  </>
                )}
              </p>
            </div>

            {facture && paymentAmount && Number(paymentAmount) > facture.solde && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Attention</AlertTitle>
                <AlertDescription>
                  Le montant saisi dépasse le solde restant à payer.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleMarkAsPaid}
              disabled={paymentAmount ? (isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0) : false}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Enregistrer le paiement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FactureDetailPage;
