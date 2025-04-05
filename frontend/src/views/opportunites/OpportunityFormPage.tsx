import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  XCircle, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { useCreateOpportunite, useOpportuniteDetail } from "@/hooks/useOpportunite";
import { useClientsLookup } from "@/hooks/useClients";
import { useContactsLookup } from "@/hooks/useContacts";
import { useProductsLookup } from "@/hooks/useProducts";
import { useEntitiesLookup } from "@/hooks/useEntities";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SuccessAlert } from "@/components/ui/SuccessAlert";
import { CreateOpportuniteDto, UpdateOpportuniteDto, OpportuniteStatut } from "@/types/opportunite.types";
import { formateDateFr } from "@/utils/formatters";

// UI Components
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

// Statuts d'opportunité avec leurs propriétés de style et d'affichage
const STATUS_CONFIG: Record<OpportuniteStatut, { display: string; colorClass: string; icon: React.ReactNode }> = {
  'PROSPECT': { 
    display: 'Prospect', 
    colorClass: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    icon: <Clock className="h-3.5 w-3.5" />
  },
  'QUALIFICATION': { 
    display: 'Qualification', 
    colorClass: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    icon: <Users className="h-3.5 w-3.5" />
  },
  'PROPOSITION': { 
    display: 'Proposition', 
    colorClass: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    icon: <FileText className="h-3.5 w-3.5" />
  },
  'NEGOCIATION': { 
    display: 'Négociation', 
    colorClass: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    icon: <Clock className="h-3.5 w-3.5" />
  },
  'GAGNEE': { 
    display: 'Gagnée', 
    colorClass: 'bg-green-100 text-green-800 hover:bg-green-200',
    icon: <CheckCircle className="h-3.5 w-3.5" />
  },
  'PERDUE': { 
    display: 'Perdue', 
    colorClass: 'bg-red-100 text-red-800 hover:bg-red-200',
    icon: <XCircle className="h-3.5 w-3.5" />
  }
};

const OpportunityFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  // States
  const [activeTab, setActiveTab] = useState("details");
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<CreateOpportuniteDto | UpdateOpportuniteDto>({
    client: 0,
    contact: 0,
    entity: 0,
    produit_principal: 0,
    produits: [],
    montant: 0,
    montant_estime: 0,
    description: '',
    besoins_client: '',
    statut: 'PROSPECT',
  });
  
  // Hooks
  const { 
    create, 
    loading: createLoading, 
    error: createError 
  } = useCreateOpportunite();
  
  const {
    opportunite,
    loading: opportuniteLoading,
    error: opportuniteError,
    update,
    qualifier,
    proposer,
    negocier,
    gagner,
    perdre,
    creerOffre
  } = useOpportuniteDetail(id ? parseInt(id) : undefined);
  
  const { 
    clients, 
    loading: clientsLoading 
  } = useClientsLookup();
  
  const { 
    contacts, 
    loading: contactsLoading,
    getContactsByClient 
  } = useContactsLookup();
  
  const { 
    products, 
    loading: productsLoading 
  } = useProductsLookup();
  
  const { 
    entities, 
    loading: entitiesLoading 
  } = useEntitiesLookup();
  
  // Filtered contacts based on selected client
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  
  // When in edit mode, load the opportunity data
  useEffect(() => {
    if (isEditMode && opportunite) {
      setFormState({
        client: opportunite.client.id,
        contact: opportunite.contact.id,
        entity: opportunite.entity.id,
        produit_principal: opportunite.produit_principal.id,
        produits: opportunite.produits.map(p => p.id),
        montant: opportunite.montant,
        montant_estime: opportunite.montant_estime,
        description: opportunite.description || '',
        besoins_client: opportunite.besoins_client || '',
        statut: opportunite.statut,
        relance: opportunite.relance ? new Date(opportunite.relance).toISOString().split('T')[0] : undefined,
      });
      
      // Update filtered contacts
      if (contacts.length > 0) {
        const clientContacts = getContactsByClient(opportunite.client.id);
        setFilteredContacts(clientContacts);
      }
    }
  }, [isEditMode, opportunite, contacts]);
  
  // When client changes, update filtered contacts
  useEffect(() => {
    if (formState.client) {
      const clientContacts = getContactsByClient(formState.client);
      setFilteredContacts(clientContacts);
      
      // Reset contact if it doesn't belong to the selected client
      if (formState.contact && !clientContacts.some(c => c.id === formState.contact)) {
        setFormState(prev => ({ ...prev, contact: 0 }));
      }
    } else {
      setFilteredContacts([]);
    }
  }, [formState.client, contacts]);
  
  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormState(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'produits') {
      // Handle multiselect for products
      const productId = parseInt(value);
      const currentProducts = formState.produits || [];
      
      if (currentProducts.includes(productId)) {
        setFormState(prev => ({
          ...prev,
          produits: currentProducts.filter(id => id !== productId)
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          produits: [...currentProducts, productId]
        }));
      }
    } else {
      // Handle other selects
      setFormState(prev => ({
        ...prev,
        [name]: name === 'statut' ? value : parseInt(value) || 0
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && id) {
        const result = await update(formState as UpdateOpportuniteDto);
        if (result) {
          setSuccessMessage("Opportunité mise à jour avec succès");
          setTimeout(() => navigate(`/opportunites/${id}`), 1500);
        }
      } else {
        const result = await create(formState as CreateOpportuniteDto);
        if (result) {
          setSuccessMessage("Opportunité créée avec succès");
          setTimeout(() => navigate(`/opportunites/${result.id}`), 1500);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  
  // Handle status transition
  const handleStatusTransition = async (action: 'qualifier' | 'proposer' | 'negocier' | 'gagner' | 'perdre') => {
    if (!id) return;
    
    let result;
    
    switch (action) {
      case 'qualifier':
        result = await qualifier();
        break;
      case 'proposer':
        result = await proposer();
        break;
      case 'negocier':
        result = await negocier();
        break;
      case 'gagner':
        result = await gagner();
        break;
      case 'perdre':
        result = await perdre();
        break;
    }
    
    if (result?.success) {
      setSuccessMessage(`Statut mis à jour: ${STATUS_CONFIG[result.statut || 'PROSPECT'].display}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };
  
  // Handle creating an offer
  const handleCreateOffer = async () => {
    if (!id) return;
    
    const result = await creerOffre();
    if (result?.success) {
      setSuccessMessage("Offre créée avec succès");
      setTimeout(() => navigate(`/offres/${result.offre_id}`), 1500);
    }
  };
  
  const isLoading = createLoading || opportuniteLoading || clientsLoading || contactsLoading || productsLoading || entitiesLoading;
  const error = createError || opportuniteError;
  
  // Render the status badge
  const renderStatusBadge = (status: OpportuniteStatut) => {
    const config = STATUS_CONFIG[status];
    return (
      <Badge variant="outline" className={`flex items-center gap-1 ${config.colorClass}`}>
        {config.icon}
        {config.display}
      </Badge>
    );
  };
  
  const renderNextStatusActions = () => {
    if (!opportunite) return null;
    
    const currentStatus = opportunite.statut;
    
    switch (currentStatus) {
      case 'PROSPECT':
        return (
          <Button
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200"
            onClick={() => handleStatusTransition('qualifier')}
          >
            <Users className="mr-2 h-4 w-4" />
            Qualifier
          </Button>
        );
      case 'QUALIFICATION':
        return (
          <Button
            variant="outline"
            className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200"
            onClick={() => handleStatusTransition('proposer')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Proposer
          </Button>
        );
      case 'PROPOSITION':
        return (
          <Button
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200"
            onClick={() => handleStatusTransition('negocier')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Négocier
          </Button>
        );
      case 'NEGOCIATION':
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
              onClick={() => handleStatusTransition('gagner')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Gagner
            </Button>
            <Button
              variant="outline"
              className="bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
              onClick={() => handleStatusTransition('perdre')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Perdre
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (isEditMode || Object.values(formState).some(val => val !== 0 && val !== '')) {
                setIsCancelDialogOpen(true);
              } else {
                navigate('/opportunites');
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? `Modifier l'opportunité` : 'Nouvelle opportunité'}
            </h1>
            {isEditMode && opportunite && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">Référence:</span>
                <span className="text-sm font-medium">{opportunite.reference}</span>
                <span className="text-sm text-gray-500 ml-2">Statut:</span>
                {renderStatusBadge(opportunite.statut)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {isEditMode && opportunite && ![
            'GAGNEE', 'PERDUE'
          ].includes(opportunite.statut) && (
            <div className="flex gap-2">
              {renderNextStatusActions()}
              <Button
                variant="outline"
                className="text-purple-800 border-purple-300 hover:bg-purple-100"
                onClick={handleCreateOffer}
              >
                <FileText className="mr-2 h-4 w-4" />
                Créer une offre
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(true)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              form="opportunity-form"
              disabled={isLoading}
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
      
      {/* Alerts */}
      {error && <ErrorAlert error={error} onDismiss={() => {}} />}
      {successMessage && <SuccessAlert message={successMessage} onDismiss={() => setSuccessMessage(null)} />}
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Form */}
        <div className="lg:col-span-2">
          <form id="opportunity-form" onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="details">Détails de l'opportunité</TabsTrigger>
                <TabsTrigger value="client">Client et produits</TabsTrigger>
              </TabsList>
              
              {/* Details Tab */}
              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations générales</CardTitle>
                    <CardDescription>Saisissez les détails de l'opportunité</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Statut */}
                    <div className="space-y-2">
                      <Label htmlFor="statut">Statut</Label>
                      <Select 
                        value={formState.statut} 
                        onValueChange={(value) => handleSelectChange('statut', value)}
                        disabled={isEditMode} // Disable in edit mode, use transitions instead
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key} className="flex items-center">
                              <div className="flex items-center">
                                {config.icon}
                                <span className="ml-2">{config.display}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Entity */}
                    <div className="space-y-2">
                      <Label htmlFor="entity">Entité</Label>
                      <Select 
                        value={formState.entity.toString()} 
                        onValueChange={(value) => handleSelectChange('entity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entité" />
                        </SelectTrigger>
                        <SelectContent>
                          {entities.map(entity => (
                            <SelectItem key={entity.id} value={entity.id.toString()}>
                              {entity.code} - {entity.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Montants */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="montant">Montant</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="montant"
                            name="montant"
                            type="number"
                            className="pl-10"
                            placeholder="0.00"
                            value={formState.montant || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="montant_estime">Montant estimé</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="montant_estime"
                            name="montant_estime"
                            type="number"
                            className="pl-10"
                            placeholder="0.00"
                            value={formState.montant_estime || ''}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Relance */}
                    <div className="space-y-2">
                      <Label htmlFor="relance">Date de relance</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="relance"
                          name="relance"
                          type="date"
                          className="pl-10"
                          value={formState.relance || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Décrivez l'opportunité..."
                        rows={4}
                        value={formState.description || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    {/* Besoins client */}
                    <div className="space-y-2">
                      <Label htmlFor="besoins_client">Besoins du client</Label>
                      <Textarea
                        id="besoins_client"
                        name="besoins_client"
                        placeholder="Décrivez les besoins du client..."
                        rows={4}
                        value={formState.besoins_client || ''}
                        onChange={handleInputChange}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Client Tab */}
              <TabsContent value="client" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Client et produits</CardTitle>
                    <CardDescription>Sélectionnez le client et les produits concernés</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Client */}
                    <div className="space-y-2">
                      <Label htmlFor="client">Client</Label>
                      <Select 
                        value={formState.client.toString()} 
                        onValueChange={(value) => handleSelectChange('client', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map(client => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Contact */}
                    <div className="space-y-2">
                      <Label htmlFor="contact">Contact</Label>
                      <Select 
                        value={formState.contact.toString()} 
                        onValueChange={(value) => handleSelectChange('contact', value)}
                        disabled={filteredContacts.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            filteredContacts.length === 0
                              ? "Sélectionnez d'abord un client"
                              : "Sélectionner un contact"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredContacts.map(contact => (
                            <SelectItem key={contact.id} value={contact.id.toString()}>
                              {contact.nom} {contact.email && `(${contact.email})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Separator />
                    
                    {/* Produit principal */}
                    <div className="space-y-2">
                      <Label htmlFor="produit_principal">Produit principal</Label>
                      <Select 
                        value={formState.produit_principal.toString()} 
                        onValueChange={(value) => handleSelectChange('produit_principal', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit principal" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map(product => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.code} - {product.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Produits associés */}
                    <div className="space-y-2">
                      <Label>Produits associés</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {products.map(product => (
                          <div
                            key={product.id}
                            className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors
                              ${formState.produits?.includes(product.id)
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30'
                              }`}
                            onClick={() => handleSelectChange('produits', product.id.toString())}
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                              checked={formState.produits?.includes(product.id) || false}
                              onChange={() => { /* handled by parent div click */ }}
                            />
                            <div className="ml-3">
                              <p className="text-sm font-medium">{product.nom}</p>
                              <p className="text-xs text-gray-500">{product.code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </div>
        
        {/* Right column - Summary & Timeline */}
        <div>
          {/* Summary Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
              <CardDescription>Aperçu de l'opportunité</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode && opportunite ? (
                <>
                  {/* Current Status */}
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Statut</span>
                    <div>{renderStatusBadge(opportunite.statut)}</div>
                  </div>
                  
                  {/* Client & Contact */}
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Client</span>
                    <p className="font-medium">{opportunite.client.nom}</p>
                    {opportunite.contact && (
                      <p className="text-sm text-gray-600">Contact: {opportunite.contact.nom}</p>
                    )}
                  </div>
                  
                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">Montant</span>
                      <p className="font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0
                        }).format(opportunite.montant)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-gray-500">Montant estimé</span>
                      <p className="font-medium">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'XAF',
                          minimumFractionDigits: 0
                        }).format(opportunite.montant_estime)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Probability */}
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Probabilité</span>
                      <span className="text-sm font-medium">{opportunite.probabilite}%</span>
                    </div>
                    <Progress value={opportunite.probabilite} className="h-2" />
                  </div>
                  
                  {/* Dates */}
                  <div className="space-y-1">
                    <span className="text-sm text-gray-500">Création</span>
                    <p className="text-sm">
                      {formateDateFr(opportunite.date_creation)}
                    </p>
                    
                    {opportunite.date_modification && (
                      <>
                        <span className="text-sm text-gray-500">Dernière modification</span>
                        <p className="text-sm">
                          {formateDateFr(opportunite.date_modification)}
                        </p>
                      </>
                    )}
                    
                    {opportunite.relance && (
                      <>
                        <span className="text-sm text-gray-500">Prochaine relance</span>
                        <p className="text-sm">
                          {formateDateFr(opportunite.relance)}
                        </p>
                      </>
                    )}
                  </div>
                </>
              ) : (
                // New opportunity mode
                <div className="text-center text-gray-500 py-6">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm">
                    Remplissez le formulaire pour voir le résumé de l'opportunité
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Required Fields Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Champs requis</CardTitle>
              <CardDescription>Informations nécessaires pour enregistrer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Client</span>
                  {formState.client ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Contact</span>
                  {formState.contact ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Entité</span>
                  {formState.entity ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Produit principal</span>
                  {formState.produit_principal ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Montant estimé</span>
                  {formState.montant_estime > 0 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle>Conseils</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">💡 <strong>Montant estimé</strong></p>
                  <p className="text-gray-500">Évaluez le montant probable de l'opportunité selon vos informations actuelles.</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">💡 <strong>Relance</strong></p>
                  <p className="text-gray-500">Définissez une date de suivi pour ne pas oublier de recontacter le client.</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600 mb-1">💡 <strong>Description détaillée</strong></p>
                  <p className="text-gray-500">Une description claire aide vos collègues à comprendre rapidement l'opportunité.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abandonner les modifications</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir abandonner ? Les modifications non enregistrées seront perdues.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Continuer l'édition
            </Button>
            <Button variant="destructive" onClick={() => navigate('/opportunites')}>
              Abandonner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportunityFormPage;