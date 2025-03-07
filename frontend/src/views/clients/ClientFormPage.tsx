// pages/ClientFormPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Save } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Hook form pour la validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/AppHooks';
import { EntityBase } from '@/interfaces';
import { Region, Ville } from '@/itf';


// Schéma de validation pour le formulaire
const clientSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("L'email n'est pas valide").optional().or(z.literal('')),
  telephone: z.string().optional(),
  ville: z.number().optional(),
  region: z.number().optional(),
  secteur_activite: z.string().optional(),
  agreer: z.boolean().default(false),
  agreement_fournisseur: z.boolean().default(false),
  bp: z.string().optional(),
  quartier: z.string().optional(),
  matricule: z.string().optional(),
  entite: z.number().optional(),
  notes: z.string().optional(),
  is_client: z.boolean().default(true),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const ClientFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = id ? parseInt(id) : undefined;
  const isEditMode = !!clientId;
  const [entities, setEntities] = useState<EntityBase[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [isLoadingClient, setIsLoadingClient] = useState<boolean>(false);
  const [clientLoaded, setClientLoaded] = useState<boolean>(false);

  const { entityService, regionService, villeService } = useServices();

  // Hook client
  const {
    isLoading,
    createClient,
    updateClient,
    getClientById
  } = useClients();

  // Configuration du formulaire avec react-hook-form
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      nom: '',
      email: '',
      telephone: '',
      ville: undefined,
      region: undefined,
      secteur_activite: '',
      agreer: false,
      agreement_fournisseur: false,
      bp: '',
      quartier: '',
      matricule: '',
      entite: undefined,
      notes: '',
      is_client: true
    },
  });
  
  // Function to handle region change
  const handleRegionChange = useCallback((regionId: number) => {
    if (regionId) {
      villeService.getByRegion(regionId).then((data) => setVilles(data));
    } else {
      setVilles([]);
    }
  }, [villeService]);

  // Charger les entités, regions et villes
  useEffect(() => {
    Promise.all([
      entityService.getAll().then(data => setEntities(data)),
      regionService.getAll().then(data => setRegions(data))
    ]);
  }, [entityService, regionService]);

  // Load client data if in edit mode - ONCE
  useEffect(() => {
    if (clientId && !clientLoaded) {
      setIsLoadingClient(true);
      getClientById(clientId)
        .then((client) => {
          if (client) {
            form.reset({
              nom: client.nom,
              email: client.email || '',
              telephone: client.telephone || '',
              ville: client.ville,
              region: client.region,
              secteur_activite: client.secteur_activite || '',
              agreer: client.agreer || false,
              agreement_fournisseur: client.agreement_fournisseur || false,
              bp: client.bp || '',
              quartier: client.quartier || '',
              matricule: client.matricule || '',
              entite: client.entite,
              notes: client.notes || '',
              is_client: client.is_client || true
            });

            // Load cities if region is selected
            if (client.region) {
              handleRegionChange(client.region);
            }
            setClientLoaded(true);
          }
        })
        .finally(() => {
          setIsLoadingClient(false);
        });
    }
  }, [clientId, getClientById, form, handleRegionChange, clientLoaded]);

  // Watch for region changes to update city list
  const regionId = form.watch('region');
  
  useEffect(() => {
    // Only update cities when region changes and we're not in the initial loading phase
    if (regionId && clientLoaded) {
      handleRegionChange(regionId);
    }
  }, [regionId, handleRegionChange, clientLoaded]);

  // Soumission du formulaire
  const onSubmit = async (data: ClientFormValues) => {
    try {
      if (isEditMode && clientId) {
        await updateClient(clientId, data);
        toast.success('Client mis à jour', {
          description: 'Les informations du client ont été mises à jour avec succès.'
        });
        navigate(`/clients/${clientId}`);
      } else {
        const newClient = await createClient(data);
        if (newClient) {
          toast.success('Client créé', {
            description: 'Le nouveau client a été créé avec succès.'
          });
          navigate(`/clients/${newClient.id}`);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error('Erreur', {
        description: 'Une erreur est survenue. Veuillez réessayer.'
      });
    }
  };

  const handleCancel = () => {
    if (isEditMode && clientId) {
      navigate(`/clients/${clientId}`);
    } else {
      navigate('/clients');
    }
  };

  if (isLoading || isLoadingClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Modifier le client' : 'Nouveau client'}
        </h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>
            {isEditMode ? `Modifier ${clientId}` : 'Informations du client'}
          </CardTitle>
          <CardDescription>
            Remplissez les informations ci-dessous pour {isEditMode ? 'mettre à jour' : 'créer'} un client.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Section - Informations principales */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations principales</h3>
                
                <FormField
                  control={form.control}
                  name="nom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nom de l'entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@entreprise.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+237 123 456 789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="matricule"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matricule</FormLabel>
                        <FormControl>
                          <Input placeholder="Matricule" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

<FormField
  control={form.control}
  name="entite"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Entité</FormLabel>
      <Select
        onValueChange={(value) => {
          // Si la valeur est 'null' ou un espace, définir à null/undefined
          if (value === 'null' || value === ' ') {
            field.onChange(undefined);
          } else {
            field.onChange(parseInt(value));
          }
        }}
        value={field.value?.toString() || ''}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une entité" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="null">
            Aucune
          </SelectItem>
          {entities.map((entite) => (
            <SelectItem key={entite.id} value={entite.id.toString()}>
              {entite.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
                </div>
              </div>

              <Separator />

              {/* Section - Localisation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Localisation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Région</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une région" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem key={region.id} value={region.id.toString()}>
                                {region.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ville"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                          disabled={!villes.length}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={villes.length ? "Sélectionner une ville" : "Sélectionnez d'abord une région"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {villes.map((ville) => (
                              <SelectItem key={ville.id} value={ville.id.toString()}>
                                {ville.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="bp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Boîte Postale</FormLabel>
                        <FormControl>
                          <Input placeholder="BP 1234" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quartier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quartier</FormLabel>
                        <FormControl>
                          <Input placeholder="Quartier" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Section - Informations additionnelles */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Informations additionnelles</h3>

                <FormField
                  control={form.control}
                  name="secteur_activite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secteur d'activité</FormLabel>
                      <FormControl>
                        <Input placeholder="AgroAlimentaire" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col space-y-2">
                  <FormField
                    control={form.control}
                    name="agreer"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Agréé</FormLabel>
                          <FormDescription>
                            Ce client est agréé par notre entreprise
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreement_fournisseur"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-md">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Fournisseur</FormLabel>
                          <FormDescription>
                            Ce client est également un fournisseur
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes et informations supplémentaires..."
                          className="min-h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between border-t p-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Annuler
              </Button>
              <Button 
                type="submit"
                disabled={isLoading || isLoadingClient}
              >
                {(isLoading || isLoadingClient) && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                <Save className="h-4 w-4 mr-2" />
                {isEditMode ? 'Mettre à jour' : 'Créer le client'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ClientFormPage;