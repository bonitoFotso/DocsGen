import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contact, OpportuniteEdition } from '@/types/contact';

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
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge";
import { useServices } from '@/AppHooks';
import { Entity } from '@/affaireType';

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


const OpportuniteCreation: React.FC = () => {
  const navigate = useNavigate();
  
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
  
  // État pour les erreurs de formulaire
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

    const { opportuniteService, clientService, productService, contactService, entityService } = useServices();
  

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ces appels seraient remplacés par vos propres appels API
        const clientsResponse = await clientService.getAll();
        setClients(clientsResponse);

        const entitiesResponse = await entityService.getAll();
        setEntities(entitiesResponse);
        
        const contactsResponse = await contactService.getAll();
        setContacts(contactsResponse);
        
        const productsResponse = await productService.getAll();
        setProducts(productsResponse);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast("Erreur",{
          description: "Impossible de charger les données nécessaires.",
        });
      }
    };
    
    fetchData();
  }, [clientService, contactService, entityService, productService]);
  
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
    if (!formData.entity) newErrors.entity = 'Veuillez sélectionner une entite';
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
    
    setIsLoading(true);
    
    try {
      const response = await opportuniteService.create(formData);
      
      
          
      toast("Succès",
        {
    description: "Opportunité créée avec succès",
      });
      
      // Rediriger vers la page de détail après un court délai
      setTimeout(() => {
        navigate(`/opportunites/${response.id}`);
      }, 1500);
      
    } catch (error) {
      console.error('Erreur lors de la création de l\'opportunité:', error);
      toast("Erreur",{
        description: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Création d'une nouvelle opportunité</CardTitle>
          <CardDescription>
            Renseignez les informations pour créer une nouvelle opportunité commerciale
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Informations principales */}
            <div className="space-y-2">
              <Label htmlFor="entity" className={errors.entity ? "text-destructive" : ""}>
                Entité <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.entity.toString()}
                onValueChange={(value) => handleSelectChange('entity', parseInt(value))}
                disabled={isLoading}
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
                  disabled={isLoading}
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
                  <p className="text-sm text-destructive">{errors.client_id}</p>
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
                  disabled={!formData.client || isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                      className="cursor-pointer"
                      onClick={() => handleProductsChange(product.id)}
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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/opportunites')}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Création en cours..." : "Créer l'opportunité"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default OpportuniteCreation;