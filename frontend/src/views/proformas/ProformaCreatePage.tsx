import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useProforma } from '@/hooks/useProforma';
import { formatCurrency } from '@/utils/formatters';
import { api } from '@/services';
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  AlertTriangle,
  Building,
  FileText
} from 'lucide-react';

// Interface pour les offres
interface Offre {
  id: number;
  reference: string;
  client: {
    id: number;
    nom: string;
    c_num: string;
  };
  entity: {
    id: number;
    code: string;
    nom: string;
  };
  montant: number;
  statut: string;
}

// Schéma de validation Zod
const proformaSchema = z.object({
  offre_id: z.string().min(1, { message: "Veuillez sélectionner une offre" }),
  statut: z.string().min(1, { message: "Veuillez sélectionner un statut" }),
  montant_ht: z.string().min(1, { message: "Le montant HT est requis" })
    .refine(val => !isNaN(Number(val)), { message: "Le montant doit être un nombre valide" })
    .refine(val => Number(val) >= 0, { message: "Le montant doit être positif" }),
  taux_tva: z.string().min(1, { message: "Le taux de TVA est requis" })
    .refine(val => !isNaN(Number(val)), { message: "Le taux doit être un nombre valide" })
    .refine(val => Number(val) >= 0, { message: "Le taux doit être positif" }),
  date_expiration: z.string().optional(),
  notes: z.string().optional()
});

type ProformaFormValues = z.infer<typeof proformaSchema>;

const ProformaCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createProforma, isSaving } = useProforma();
  const [offres, setOffres] = useState<Offre[]>([]);
  const [isLoadingOffres, setIsLoadingOffres] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null);

  // Formulaire avec React Hook Form
  const form = useForm<ProformaFormValues>({
    resolver: zodResolver(proformaSchema),
    defaultValues: {
      offre_id: '',
      statut: 'BROUILLON',
      montant_ht: '',
      taux_tva: '19.25',
      date_expiration: '',
      notes: ''
    }
  });

  // Récupérer les offres disponibles
  const fetchOffres = async () => {
    try {
      setIsLoadingOffres(true);
      setLoadError(null);
      
      // Appel à l'API pour récupérer les offres disponibles
      // Note: Si nécessaire, ajustez cette requête selon votre API
      const response = await api.get('/offres/?statut=GAGNE');
      const offresData = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      setOffres(offresData);
    } catch (error) {
      console.error('Erreur lors du chargement des offres:', error);
      setLoadError('Impossible de charger les offres. Veuillez réessayer.');
      toast('Erreur', {
        description: 'Impossible de charger les offres disponibles.'
      });
    } finally {
      setIsLoadingOffres(false);
    }
  };

  useEffect(() => {
    fetchOffres();
  }, []);

  // Mettre à jour l'offre sélectionnée
  const handleOffreChange = (offreId: string) => {
    const selected = offres.find(o => o.id.toString() === offreId);
    setSelectedOffre(selected || null);
    
    // Si une offre est sélectionnée, utiliser son montant comme montant HT par défaut
    if (selected) {
      form.setValue('montant_ht', selected.montant.toString());
    }
  };

  // Calculer le montant TTC
  const calculateTTC = () => {
    const montantHT = form.watch('montant_ht');
    const tauxTVA = form.watch('taux_tva');
    
    if (!montantHT || !tauxTVA || isNaN(Number(montantHT)) || isNaN(Number(tauxTVA))) {
      return 'N/A';
    }
    
    const montantTVA = Number(montantHT) * (Number(tauxTVA) / 100);
    const montantTTC = Number(montantHT) + montantTVA;
    
    return formatCurrency(montantTTC);
  };

  // Soumettre le formulaire
  const onSubmit = async (values: ProformaFormValues) => {
    try {
      // Convertir les valeurs du formulaire
      const proformaData = {
        offre: parseInt(values.offre_id),
        statut: values.statut,
        montant_ht: Number(values.montant_ht),
        taux_tva: Number(values.taux_tva),
        date_expiration: values.date_expiration || undefined,
        notes: values.notes
      };
      
      // Créer la proforma
      const newProforma = await createProforma(proformaData);
      
      toast('Succès', {
        description: 'Proforma créée avec succès'
      });
      
      // Rediriger vers la page de détails de la nouvelle proforma
      navigate(`/proformas/${newProforma.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la proforma:', error);
      toast('Erreur', {
        description: 'Impossible de créer la proforma. Veuillez vérifier les données et réessayer.'
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/proformas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle Proforma</h1>
        </div>
      </div>
      
      {loadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Sélection de l'offre */}
          <Card>
            <CardHeader>
              <CardTitle>Sélection de l'offre</CardTitle>
              <CardDescription>
                Sélectionnez l'offre commerciale pour laquelle créer une proforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="offre_id"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Offre commerciale</FormLabel>
                    <Select
                      disabled={isLoadingOffres}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleOffreChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une offre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {offres.map((offre) => (
                          <SelectItem key={offre.id} value={offre.id.toString()}>
                            {offre.reference} - {offre.client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choisissez parmi les offres disponibles
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Informations de l'offre sélectionnée */}
              {selectedOffre && (
                <div className="mt-6 p-4 bg-muted/20 rounded-md">
                  <h3 className="font-medium mb-2">Détails de l'offre sélectionnée</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Référence:</strong> {selectedOffre.reference}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span><strong>Client:</strong> {selectedOffre.client.nom}</span>
                    </div>
                    <div>
                      <strong>Entité:</strong> {selectedOffre.entity.code} - {selectedOffre.entity.nom}
                    </div>
                    <div>
                      <strong>Montant:</strong> {formatCurrency(selectedOffre.montant)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Informations de la proforma */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de la proforma</CardTitle>
              <CardDescription>
                Définissez les paramètres de la nouvelle proforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
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
                              <SelectValue placeholder="Sélectionnez un statut" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BROUILLON">Brouillon</SelectItem>
                            <SelectItem value="EN_COURS">En cours</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Statut initial de la proforma
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="date_expiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'expiration</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          Date d'expiration de la proforma (optionnel)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormField
                    control={form.control}
                    name="montant_ht"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant HT</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Montant hors taxes en XAF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormField
                    control={form.control}
                    name="taux_tva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux TVA (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>
                          Taux de TVA applicable (19.25% par défaut)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end items-center space-x-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    form.trigger(['montant_ht', 'taux_tva']);
                  }}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculer
                </Button>
                <div className="text-sm text-muted-foreground">Montant TTC: <span className="font-medium">{calculateTTC()}</span></div>
              </div>
              
              <Separator />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Notes ou commentaires sur cette proforma..."
                        rows={4}
                      />
                    </FormControl>
                    <FormDescription>
                      Informations complémentaires (optionnel)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/proformas')}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || isLoadingOffres}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Création en cours...' : 'Créer la proforma'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default ProformaCreatePage;