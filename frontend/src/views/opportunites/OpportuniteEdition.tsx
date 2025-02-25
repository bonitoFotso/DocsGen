import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Contact, Opportunite, OpportuniteEdition } from '@/types/contact';
import { Entity } from '@/affaireType';
import { useServices } from '@/AppHooks';

// Composants Shadcn/UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  FileText, 
} from 'lucide-react';



interface Product {
  id: number;
  name: string;
  code: string;
}

interface Client {
  id: number;
  nom: string;
  c_num: string;
}

// Composant pour afficher le statut avec style adapté
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PROSPECT': return "secondary";
      case 'QUALIFICATION': return "default";
      case 'PROPOSITION': return "outline";
      case 'NEGOCIATION': return "destructive";
      case 'GAGNEE': return "secondary";
      case 'PERDUE': return "destructive";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'PROSPECT': 'Prospect',
      'QUALIFICATION': 'Qualification',
      'PROPOSITION': 'Proposition',
      'NEGOCIATION': 'Négociation',
      'GAGNEE': 'Gagnée',
      'PERDUE': 'Perdue'
    };
    return statusMap[status] || status;
  };

  return (
    <Badge variant={getStatusVariant(status)}>
      {getStatusLabel(status)}
    </Badge>
  );
};

const OpportuniteEditionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportuniteService, clientService, productService, contactService, entityService } = useServices();
  
  // État pour l'opportunité complète
  const [opportunite, setOpportunite] = useState<Opportunite | null>(null);
  
  // État pour les données du formulaire
  const [formData, setFormData] = useState<OpportuniteEdition>({
    produits: [],
    produit_principal: 0,
    client: 0,
    contact: 0,
    montant_estime: 0,
    description: '',
    besoins_client: '',
    entity: 0,
  });
  
  // États pour les données de référence
  const [clients, setClients] = useState<Client[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [availableContacts, setAvailableContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  
  // État pour le chargement
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // État pour les erreurs de formulaire
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // État pour le dialogue de confirmation
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: '',
    confirmAction: () => {}
  });

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger les données de référence
        const [clientsData, contactsData, productsData, entitiesData, opportuniteData] = await Promise.all([
          clientService.getAll(),
          contactService.getAll(),
          productService.getAll(),
          entityService.getAll(),
          opportuniteService.getById(Number(id))
        ]);
        
        setClients(clientsData);
        setContacts(contactsData);
        setProducts(productsData);
        setEntities(entitiesData);
        
        setOpportunite(opportuniteData);
        
        // Initialiser le formulaire avec les données de l'opportunité
        setFormData({
          produits: opportuniteData.produits,
          produit_principal: opportuniteData.produit_principal,
          client: opportuniteData.client,
          contact: opportuniteData.contact,
          montant_estime: opportuniteData.montant_estime,
          description: opportuniteData.description,
          besoins_client: opportuniteData.besoins_client,
          entity: opportuniteData.entity,
        });
        
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast("Erreur", {
          description: error instanceof Error ? error.message : 'Erreur lors du chargement des données',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, clientService, contactService, entityService, opportuniteService, productService]);
  
  // Filtrer les contacts par client sélectionné
  useEffect(() => {
    if (formData.client) {
      const clientContacts = contacts.filter(contact => Number(contact.client_id) === formData.client);
      setAvailableContacts(clientContacts);
      
      // Réinitialiser le contact si le client change et que le contact actuel n'appartient pas au nouveau client
      if (formData.contact && !clientContacts.some(c => c.id === formData.contact)) {
        setFormData(prev => ({ ...prev, contact: 0 }));
      }
    } else {
      setAvailableContacts([]);
    }
  }, [formData.client, contacts, formData.contact]);
  
  // Gérer les changements dans le formulaire pour les champs texte et nombre
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (e.target.type === 'number') {
      processedValue = (parseFloat(value) || 0).toString();
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gérer les changements dans les sélecteurs
  const handleSelectChange = (name: string, value: number) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Gérer la sélection multiple de produits
  const handleProductsChange = (productId: number) => {
    setFormData(prev => {
      // Vérifier si le produit est déjà sélectionné
      const isSelected = prev.produits.includes(productId);
      
      // Si sélectionné, le retirer, sinon l'ajouter
      const updatedProduits = isSelected
        ? prev.produits.filter(id => id !== productId)
        : [...prev.produits, productId];
      
      return { ...prev, produits: updatedProduits };
    });
    
    // Effacer l'erreur pour ce champ si elle existe
    if (errors.produits) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.produits;
        return newErrors;
      });
    }
  };
  
  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.entity) newErrors.entity = 'Veuillez sélectionner une entité';
    if (!formData.client) newErrors.client = 'Veuillez sélectionner un client';
    if (!formData.contact) newErrors.contact = 'Veuillez sélectionner un contact';
    if (!formData.produit_principal) newErrors.produit_principal = 'Veuillez sélectionner un produit principal';
    if (formData.produits.length === 0) newErrors.produits = 'Veuillez sélectionner au moins un produit';
    if (formData.montant_estime <= 0) newErrors.montant_estime = 'Le montant estimé doit être supérieur à 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const updatedOpportunite = await opportuniteService.update(Number(id), formData);
      setOpportunite(updatedOpportunite);
      
      toast("Succès", {
        description: "Opportunité mise à jour avec succès",
      });
      
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'opportunité:', error);
      toast("Erreur", {
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // Fonction pour avancer l'opportunité dans le processus de vente
  const handleAdvanceStatus = (newStatus: string) => {
    if (!opportunite) return;
    
    const statusTransitionMap: Record<string, { action: string, title: string }> = {
      'PROSPECT': { action: 'qualifier', title: 'Qualifier' },
      'QUALIFICATION': { action: 'proposer', title: 'Proposer' },
      'PROPOSITION': { action: 'negocier', title: 'Négocier' },
      'NEGOCIATION': { action: 'gagner', title: 'Gagner' }
    };
    
    const transition = statusTransitionMap[opportunite.statut];
    if (!transition) return;
    
    setConfirmDialog({
      open: true,
      title: `${transition.title} cette opportunité ?`,
      message: `Souhaitez-vous faire passer cette opportunité au statut "${newStatus}" ?`,
      action: 'advance',
      confirmAction: async () => {
        try {
          setSubmitting(true);
          const updatedOpportunite = await opportuniteService.qualifier(Number(id));
          setOpportunite(updatedOpportunite);
          
          toast("Succès", {
            description: `Statut mis à jour avec succès`,
          });
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut:', error);
          toast("Erreur", {
            description: error instanceof Error ? error.message : 'Une erreur est survenue',
          });
        } finally {
          setSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  // Fonction pour marquer l'opportunité comme perdue
  const handleMarkAsLost = () => {
    if (!opportunite) return;
    
    setConfirmDialog({
      open: true,
      title: "Marquer comme perdue ?",
      message: "Souhaitez-vous marquer cette opportunité comme perdue ? Cette action est irréversible.",
      action: 'lose',
      confirmAction: async () => {
        try {
          setSubmitting(true);
          const updatedOpportunite = await opportuniteService.perdre(
            Number(id)
          );
          setOpportunite(updatedOpportunite);
          
          toast("Succès", {
            description: "Opportunité marquée comme perdue",
          });
        } catch (error) {
          console.error('Erreur lors du marquage comme perdue:', error);
          toast("Erreur", {
            description: error instanceof Error ? error.message : 'Une erreur est survenue',
          });
        } finally {
          setSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  // Fonction pour créer une offre à partir de l'opportunité
  const handleCreateOffer = () => {
    if (!opportunite) return;
    
    setConfirmDialog({
      open: true,
      title: "Créer une offre ?",
      message: "Souhaitez-vous créer une offre à partir de cette opportunité ?",
      action: 'createOffer',
      confirmAction: async () => {
        try {
          setSubmitting(true);
          const newOffer = await opportuniteService.creerOffre(Number(id));
          
          toast("Succès", {
            description: `Offre créée avec succès`,
          });
          
          // Optionnel : rediriger vers la page de l'offre
          setTimeout(() => {
            navigate(`/offres/${newOffer.id}`);
          }, 1500);
        } catch (error) {
          console.error('Erreur lors de la création de l\'offre:', error);
          toast("Erreur", {
            description: error instanceof Error ? error.message : 'Une erreur est survenue',
          });
        } finally {
          setSubmitting(false);
          setConfirmDialog(prev => ({ ...prev, open: false }));
        }
      }
    });
  };
  
  // Déterminer si l'opportunité est modifiable (statut différent de GAGNEE ou PERDUE)
  const isEditable = opportunite && !['GAGNEE', 'PERDUE'].includes(opportunite.statut);
  
  if (loading) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <div className="w-2/3">
              <Skeleton className="h-8 w-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!opportunite) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>Opportunité non trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>L'opportunité demandée n'existe pas ou a été supprimée.</AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/opportunites')}>
              Retour à la liste
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">{opportunite.reference}</CardTitle>
              <CardDescription>
                {opportunite.client ? clients.find(c => c.id === opportunite.client)?.nom : ''}
              </CardDescription>
            </div>
            <StatusBadge status={opportunite.statut} />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-6">
          {/* Info panel */}
          <div className="bg-muted/40 p-4 rounded-md">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                <p>{new Date(opportunite.date_detection).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dernière modification</p>
                <p>{new Date(opportunite.date_modification).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prochaine relance</p>
                <p>{opportunite.relance ? new Date(opportunite.relance).toLocaleDateString() : '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Probabilité</p>
                <p>{opportunite.probabilite}%</p>
              </div>
              {opportunite.date_cloture && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date de clôture</p>
                  <p>{new Date(opportunite.date_cloture).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations principales */}
            <div className="space-y-2">
              <Label htmlFor="entity" className={errors.entity ? "text-destructive" : ""}>
                Entité <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.entity.toString()}
                onValueChange={(value) => handleSelectChange('entity', parseInt(value))}
                disabled={!isEditable || submitting}
              >
                <SelectTrigger id="entity" className={errors.entity ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionnez une entité" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id.toString()}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.entity && (
                <p className="text-sm text-destructive">{errors.entity}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client */}
              <div className="space-y-2">
                <Label htmlFor="client" className={errors.client ? "text-destructive" : ""}>
                  Client <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.client.toString()}
                  onValueChange={(value) => handleSelectChange('client', parseInt(value))}
                  disabled={!isEditable || submitting}
                >
                  <SelectTrigger id="client" className={errors.client ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionnez un client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.nom} ({client.c_num})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client && (
                  <p className="text-sm text-destructive">{errors.client}</p>
                )}
              </div>
              
              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact" className={errors.contact ? "text-destructive" : ""}>
                  Contact <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.contact.toString()}
                  onValueChange={(value) => handleSelectChange('contact', parseInt(value))}
                  disabled={!formData.client || !isEditable || submitting}
                >
                  <SelectTrigger id="contact" className={errors.contact ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionnez un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id.toString()}>
                        {contact.prenom} {contact.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.contact && (
                  <p className="text-sm text-destructive">{errors.contact}</p>
                )}
              </div>
              
              {/* Produit principal */}
              <div className="space-y-2">
                <Label htmlFor="produit_principal" className={errors.produit_principal ? "text-destructive" : ""}>
                  Produit principal <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.produit_principal.toString()}
                  onValueChange={(value) => handleSelectChange('produit_principal', parseInt(value))}
                  disabled={!isEditable || submitting}
                >
                  <SelectTrigger id="produit_principal" className={errors.produit_principal ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionnez un produit principal" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.produit_principal && (
                  <p className="text-sm text-destructive">{errors.produit_principal}</p>
                )}
              </div>
              
              {/* Montant estimé */}
              <div className="space-y-2">
                <Label htmlFor="montant_estime" className={errors.montant_estime ? "text-destructive" : ""}>
                  Montant estimé (€) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="montant_estime"
                  name="montant_estime"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.montant_estime}
                  onChange={handleInputChange}
                  className={errors.montant_estime ? "border-destructive" : ""}
                  disabled={!isEditable || submitting}
                />
                {errors.montant_estime && (
                  <p className="text-sm text-destructive">{errors.montant_estime}</p>
                )}
              </div>
            </div>
            
            {/* Produits associés */}
            <div className="space-y-2">
              <Label className={errors.produits ? "text-destructive" : ""}>
                Produits associés <span className="text-destructive">*</span>
              </Label>
              <div className="border rounded-md p-4">
                <div className="flex flex-wrap gap-2">
                  {products.map((product) => (
                    <Badge
                      key={product.id}
                      variant={formData.produits.includes(product.id) ? "default" : "outline"}
                      className={isEditable && !submitting ? "cursor-pointer" : ""}
                      onClick={() => {
                        if (isEditable && !submitting) handleProductsChange(product.id);
                      }}
                    >
                      {product.name} ({product.code})
                    </Badge>
                  ))}
                </div>
              </div>
              {errors.produits && (
                <p className="text-sm text-destructive">{errors.produits}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={4}
                disabled={!isEditable || submitting}
              />
            </div>
            
            {/* Besoins client */}
            <div className="space-y-2">
              <Label htmlFor="besoins_client">Besoins du client</Label>
              <Textarea
                id="besoins_client"
                name="besoins_client"
                value={formData.besoins_client || ''}
                onChange={handleInputChange}
                rows={4}
                disabled={!isEditable || submitting}
              />
            </div>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
              {/* Actions de statut */}
              <div className="flex flex-wrap gap-2">
                {opportunite.statut === 'PROSPECT' && (
                  <Button 
                    type="button"
                    onClick={() => handleAdvanceStatus('QUALIFICATION')}
                    disabled={submitting}
                  >
                    Qualifier
                  </Button>
                )}
                
                {opportunite.statut === 'QUALIFICATION' && (
                  <>
                    <Button 
                      type="button"
                      onClick={() => handleAdvanceStatus('PROPOSITION')}
                      disabled={submitting}
                    >
                      Proposer
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleCreateOffer}
                      disabled={submitting}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Créer une offre
                    </Button>
                  </>
                )}
                
                {opportunite.statut === 'PROPOSITION' && (
                  <>
                    <Button 
                      type="button"
                      onClick={() => handleAdvanceStatus('NEGOCIATION')}
                      disabled={submitting}
                    >
                      Négocier
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleCreateOffer}
                      disabled={submitting}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Créer une offre
                    </Button>
                  </>
                )}
                
                {opportunite.statut === 'NEGOCIATION' && (
                  <>
                    <Button 
                      type="button"
                      variant="secondary"
                      onClick={() => handleAdvanceStatus('GAGNEE')}
                      disabled={submitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marquer comme gagnée
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleCreateOffer}
                      disabled={submitting}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Créer une offre
                    </Button>
                  </>
                )}
                
                {['PROSPECT', 'QUALIFICATION', 'PROPOSITION', 'NEGOCIATION'].includes(opportunite.statut) && (
                  <Button 
                    type="button"
                    variant="destructive"
                    onClick={handleMarkAsLost}
                    disabled={submitting}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Marquer comme perdue
                  </Button>
                )}
              </div>
              
              {/* Actions de formulaire */}
              <div className="flex gap-2 self-end">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/opportunites')}
                  disabled={submitting}
                >
                  Retour
                </Button>
                
                {isEditable && (
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      
      {/* Dialogue de confirmation */}
      <Dialog 
        open={confirmDialog.open} 
        onOpenChange={(isOpen) => setConfirmDialog(prev => ({ ...prev, open: isOpen }))}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
              disabled={submitting}
            >
              Annuler
            </Button>
            <Button 
              type="button"
              variant={confirmDialog.action === 'lose' ? "destructive" : "default"}
              onClick={confirmDialog.confirmAction}
              disabled={submitting}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OpportuniteEditionPage;