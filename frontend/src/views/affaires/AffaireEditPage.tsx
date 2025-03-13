import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUpdateAffaire, useCreateAffaire, useAffaire } from '@/hooks/affaire-hooks';
import { IAffaireCreate, IOffre } from '@/services/AffaireService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Services pour les offres et les utilisateurs


// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Calendar as CalendarIcon, Save, ArrowLeft } from 'lucide-react';

// Zod pour la validation
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';

// Définition du schéma de validation
const formSchema = z.object({
  offre: z.number({
    required_error: "Veuillez sélectionner une offre",
  }),
  date_debut: z.date({
    required_error: "Veuillez sélectionner une date de début",
  }),
  date_fin_prevue: z.date().optional(),
  responsable_id: z.number().optional().nullable(),
  notes: z.string().optional(),
  statut: z.string({
    required_error: "Veuillez sélectionner un statut",
  }),
});

// Types pour les offres et utilisateurs

interface IUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

const AffaireEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  // const [errorOffres, setErrorOffres] = useState<string | null>(null);
  // const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Hooks pour les opérations sur l'affaire
  const { affaire, loading: loadingAffaire, error: errorAffaire } = useAffaire(id ? parseInt(id) : null);
  const { updateAffaire, loading: updating, error: updateError, success: updateSuccess } = useUpdateAffaire(id ? parseInt(id) : null);
  const { createAffaire, loading: creating, error: createError, success: createSuccess, newAffaire } = useCreateAffaire();

  // Initialiser le formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      statut: 'BROUILLON',
      notes: '',
    },
  });

// La seule dépendance est fetchInitData lui-même
  
  
  // Initialisation du formulaire pour l'édition
  useEffect(() => {
    if (isEditing && affaire) {
      form.reset({
        offre: typeof affaire.offre === 'number' ? affaire.offre : (affaire.offre as unknown as IOffre)?.id,
        date_debut: affaire.date_debut ? new Date(affaire.date_debut) : new Date(),
        date_fin_prevue: affaire.date_fin_prevue ? new Date(affaire.date_fin_prevue) : undefined,
        responsable_id: affaire.responsable ? (typeof affaire.responsable === 'number' ? affaire.responsable : (affaire.responsable as unknown as IUser)?.id) : null,
        notes: affaire.notes || '',
        statut: affaire.statut,
      });
    }
  }, [isEditing, affaire, form]);

  // Redirection après succès
  useEffect(() => {
    if (updateSuccess) {
      navigate(`/affaires/${id}`);
    }
    
    if (createSuccess && newAffaire) {
      navigate(`/affaires/${newAffaire.id}`);
    }
  }, [updateSuccess, createSuccess, newAffaire, navigate, id]);

  // Soumission du formulaire
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedValues: Partial<IAffaireCreate> = {
      ...values,
      date_debut: format(values.date_debut, 'yyyy-MM-dd'),
      date_fin_prevue: values.date_fin_prevue ? format(values.date_fin_prevue, 'yyyy-MM-dd') : undefined,
      responsable_id: values.responsable_id || undefined
    };
    
    if (isEditing) {
      updateAffaire(formattedValues);
    } else {
      createAffaire(formattedValues as IAffaireCreate);
    }
  };

  // Confirmation avant annulation
  const handleCancel = () => {
    if (form.formState.isDirty) {
      setConfirmDialogOpen(true);
    } else {
      navigateBack();
    }
  };
  
  const navigateBack = () => {
    if (isEditing) {
      navigate(`/affaires/${id}`);
    } else {
      navigate('/affaires');
    }
  };

  // Si chargement en cours pour l'édition
  if (isEditing && loadingAffaire && !affaire) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si erreur pour l'édition
  if (isEditing && errorAffaire) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur lors du chargement de l'affaire</AlertTitle>
          <AlertDescription>{errorAffaire}</AlertDescription>
          <div className="mt-4">
            <Button onClick={() => navigate('/affaires')}>
              Retour à la liste
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCancel}
          >
            <ArrowLeft size={16} />
            Retour
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? `Modifier l'affaire ${affaire?.reference}` : 'Nouvelle affaire'}
          </h1>
        </div>
        
        {/* Erreurs */}
        {(updateError || createError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>
              {isEditing ? "Erreur lors de la modification" : "Erreur lors de la création"}
            </AlertTitle>
            <AlertDescription>
              {updateError || createError}
            </AlertDescription>
          </Alert>
        )}
        
        {/* Formulaire */}
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="date_debut"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de début</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              locale={fr}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="date_fin_prevue"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date de fin prévue</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Sélectionner une date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value || undefined}
                              onSelect={field.onChange}
                              initialFocus
                              locale={fr}
                              disabled={(date) => {
                                const startDate = form.getValues("date_debut");
                                return startDate ? date < startDate : false;
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          Optionnel. Doit être postérieure à la date de début.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BROUILLON">Brouillon</SelectItem>
                          <SelectItem value="VALIDE">Validée</SelectItem>
                          {isEditing && (
                            <>
                              <SelectItem value="EN_COURS">En cours</SelectItem>
                              <SelectItem value="EN_PAUSE">En pause</SelectItem>
                              <SelectItem value="TERMINEE">Terminée</SelectItem>
                              <SelectItem value="ANNULEE">Annulée</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Notes ou commentaires sur l'affaire"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2"
                    disabled={updating || creating}
                  >
                    <Save size={16} />
                    {isEditing ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Dialog de confirmation */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmez l'annulation</DialogTitle>
            <DialogDescription>
              Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir quitter sans enregistrer ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Continuer l'édition
            </Button>
            <Button variant="destructive" onClick={navigateBack}>
              Quitter sans enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffaireEditPage;

