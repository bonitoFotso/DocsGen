import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { useFacture } from '@/hooks/useFacture';
import { api } from '@/services';
import { formatCurrency } from '@/utils/formatters';
import { 
  ArrowLeft, 
  Save, 
  Calculator, 
  AlertTriangle,
  Building,
  Briefcase,
  Calendar,
  DollarSign
} from 'lucide-react';

// Interface pour les affaires
interface Affaire {
  id: number;
  reference: string;
  offre: {
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
    produit: {
      id: number;
      code: string;
      nom: string;
    };
  };
  statut: string;
  montant_total: number;
}

// Schéma de validation Zod
const factureSchema = z.object({
  affaire_id: z.string().min(1, { message: "Veuillez sélectionner une affaire" }),
  statut: z.string().min(1, { message: "Veuillez sélectionner un statut" }),
  montant_ht: z.string().min(1, { message: "Le montant HT est requis" })
    .refine(val => !isNaN(Number(val)), { message: "Le montant doit être un nombre valide" })
    .refine(val => Number(val) >= 0, { message: "Le montant doit être positif" }),
  taux_tva: z.string().min(1, { message: "Le taux de TVA est requis" })
    .refine(val => !isNaN(Number(val)), { message: "Le taux doit être un nombre valide" })
    .refine(val => Number(val) >= 0, { message: "Le taux doit être positif" }),
  date_echeance: z.string().optional(),
  notes: z.string().optional()
});

type FactureFormValues = z.infer<typeof factureSchema>;

interface FactureCreatePageProps {
  isEdit?: boolean;
}

const FactureCreatePage: React.FC<FactureCreatePageProps> = ({ isEdit = false }) => {
  const { factureId } = useParams<{ factureId: string }>();
  const navigate = useNavigate();
  const { facture, isLoading: isLoadingFacture, createFacture, updateFacture, fetchFacture } = useFacture({ 
    factureId: isEdit && factureId ? parseInt(factureId) : undefined 
  });
  
  const [affaires, setAffaires] = useState<Affaire[]>([]);
  const [isLoadingAffaires, setIsLoadingAffaires] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedAffaire, setSelectedAffaire] = useState<Affaire | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedTTC, setCalculatedTTC] = useState<number | null>(null);

  // Formulaire avec React Hook Form
  const form = useForm<FactureFormValues>({
    resolver: zodResolver(factureSchema),
    defaultValues: {
      affaire_id: '',
      statut: isEdit ? '' : 'BROUILLON',
      montant_ht: '',
      taux_tva: '19.25',
      date_echeance: '',
      notes: ''
    }
  });

  // Récupérer les affaires disponibles
  const fetchAffaires = async () => {
    try {
      setIsLoadingAffaires(true);
      setLoadError(null);
      
      // Appel à l'API pour récupérer les affaires disponibles
      const response = await api.get('/affaires/?statut=BROUILLON');
      const affairesData = Array.isArray(response.data) ? response.data : response.data.results || [];
      
      // Filtrer les affaires qui n'ont pas déjà une facture si ce n'est pas un mode édition
      if (!isEdit) {
        const affairesFiltered = await Promise.all(
          affairesData.map(async (affaire: Affaire) => {
            try {
              const hasFacResponse = await api.get(`/factures/?affaire=${affaire.id}`);
              const hasFac = hasFacResponse.data.count > 0 || hasFacResponse.data.length > 0;
              return !hasFac ? affaire : null;
            } catch (error) {
              console.error(`Erreur lors de la vérification des factures pour l'affaire ${affaire.id}:`, error);
              return null; // On exclut l'affaire en cas d'erreur pour éviter les doublons
            }
          })
        );
        setAffaires(affairesFiltered.filter(Boolean) as Affaire[]);
      } else {
        setAffaires(affairesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des affaires:', error);
      setLoadError('Impossible de charger les affaires. Veuillez réessayer.');
      toast("Erreur",{
        description: 'Impossible de charger les affaires disponibles.'
      });
    } finally {
      setIsLoadingAffaires(false);
    }
  };

  // Initier le chargement des affaires et/ou des données de la facture
  useEffect(() => {
    fetchAffaires();
    
    if (isEdit && factureId) {
      fetchFacture(parseInt(factureId));
    }
  }, [isEdit, factureId]);

  

  // Mettre à jour l'affaire sélectionnée
  const handleAffaireChange = (affaireId: string) => {
    const selected = affaires.find(a => a.id.toString() === affaireId);
    setSelectedAffaire(selected || null);
    
    // Si une affaire est sélectionnée, utiliser son montant comme montant HT par défaut
    if (selected) {
      form.setValue('montant_ht', selected.montant_total.toString());
      calculateTTC();
    }
  };

  // Calculer le montant TTC
  const calculateTTC = useCallback(() => {
    const montantHT = form.watch('montant_ht');
    const tauxTVA = form.watch('taux_tva');
    
    if (!montantHT || !tauxTVA || isNaN(Number(montantHT)) || isNaN(Number(tauxTVA))) {
      setCalculatedTTC(null);
      return;
    }
    
    const montantTVA = Number(montantHT) * (Number(tauxTVA) / 100);
    const montantTTC = Number(montantHT) + montantTVA;
    
    setCalculatedTTC(montantTTC);
  },[form]);


  // Mettre à jour le formulaire quand les données de la facture sont chargées (en mode édition)
  useEffect(() => {
    if (isEdit && facture) {
      // Trouver l'affaire associée à cette facture
      const factureAffaire = typeof facture.affaire === 'object' ? facture.affaire : null;
      
      if (factureAffaire) {
        setSelectedAffaire(factureAffaire as unknown as Affaire);
      }
      
      form.reset({
        affaire_id: factureAffaire ? String(factureAffaire.id) : '',
        statut: facture.statut,
        montant_ht: String(facture.montant_ht),
        taux_tva: String(facture.taux_tva),
        date_echeance: facture.date_echeance ? new Date(facture.date_echeance).toISOString().split('T')[0] : '',
        notes: facture.notes || ''
      });
      
      calculateTTC();
    }
  }, [isEdit, facture, form, calculateTTC]);

  // Soumettre le formulaire
  const onSubmit = async (values: FactureFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convertir les valeurs du formulaire
      const factureData = {
        affaire: parseInt(values.affaire_id),
        statut: values.statut,
        montant_ht: Number(values.montant_ht),
        taux_tva: Number(values.taux_tva),
        date_echeance: values.date_echeance || undefined,
        notes: values.notes
      };
      
      let result;
      
      if (isEdit && factureId) {
        // Mettre à jour la facture existante
        result = await updateFacture(parseInt(factureId), factureData);
        toast('Succès', {
          description: 'Facture mise à jour avec succès'
        });
      } else {
        // Créer une nouvelle facture
        result = await createFacture(factureData);
        toast('Succès', {
          description: 'Facture créée avec succès'
        });
      }
      
      // Rediriger vers la page de détails de la facture
      navigate(`/factures/${result.id}`);
    } catch (error) {
      console.error('Erreur lors de la création/modification de la facture:', error);
      toast('Erreur', {
        description: `Impossible de ${isEdit ? 'modifier' : 'créer'} la facture. Veuillez vérifier les données et réessayer.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête avec bouton retour */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/factures')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEdit ? 'Modifier la facture' : 'Nouvelle Facture'}
          </h1>
        </div>
      </div>
      
      {loadError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      )}
      
      {isEdit && isLoadingFacture ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p>Chargement des détails de la facture...</p>
          </CardContent>
        </Card>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sélection de l'affaire */}
            <Card>
              <CardHeader>
                <CardTitle>Informations de base</CardTitle>
                <CardDescription>
                  {isEdit 
                    ? "Modifiez les informations de la facture" 
                    : "Sélectionnez l'affaire pour laquelle créer une facture"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="affaire_id"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Affaire</FormLabel>
                      <Select
                        disabled={isLoadingAffaires || isEdit}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleAffaireChange(value);
                        }}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une affaire" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {affaires.map((affaire) => (
                            <SelectItem key={affaire.id} value={affaire.id.toString()}>
                              {affaire.reference} - {affaire.offre.client.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {isEdit 
                          ? "L'affaire associée à cette facture" 
                          : "Choisissez parmi les affaires en cours ou terminées"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Statut */}
                <FormField
                  control={form.control}
                  name="statut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BROUILLON">Brouillon</SelectItem>
                          <SelectItem value="EMISE">Émise</SelectItem>
                          {isEdit && (
                            <>
                              <SelectItem value="PAYEE">Payée</SelectItem>
                              <SelectItem value="IMPAYEE">Impayée</SelectItem>
                              <SelectItem value="PARTIELLEMENT_PAYEE">Partiellement payée</SelectItem>
                              <SelectItem value="ANNULEE">Annulée</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Statut initial de la facture
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Date d'échéance */}
                <FormField
                  control={form.control}
                  name="date_echeance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date d'échéance</FormLabel>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Date limite de paiement de la facture (optionnel)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Informations de l'affaire sélectionnée */}
                {selectedAffaire && (
                  <div className="mt-6 p-4 bg-muted/20 rounded-md">
                    <h3 className="font-medium mb-2">Détails de l'affaire sélectionnée</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Référence:</strong> {selectedAffaire.reference}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span><strong>Client:</strong> {selectedAffaire.offre.client.nom}</span>
                      </div>
                      <div>
                        <strong>Entité:</strong> {selectedAffaire.offre.entity.code} - {selectedAffaire.offre.entity.nom}
                      </div>
                      <div>
                        <Badge variant="outline">
                          {selectedAffaire.statut}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Informations financières */}
            <Card>
              <CardHeader>
                <CardTitle>Informations financières</CardTitle>
                <CardDescription>
                  Définissez les montants et les conditions de paiement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Montant HT */}
                  <FormField
                    control={form.control}
                    name="montant_ht"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant HT</FormLabel>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                calculateTTC();
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Montant hors taxes en XAF
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Taux TVA */}
                  <FormField
                    control={form.control}
                    name="taux_tva"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Taux TVA (%)</FormLabel>
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                calculateTTC();
                              }}
                            />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Taux de TVA applicable (19.25% par défaut)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      form.trigger(['montant_ht', 'taux_tva']);
                      calculateTTC();
                    }}
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Calculer
                  </Button>
                  <div className="text-sm">
                    Montant TVA: <span className="font-medium">
                      {calculatedTTC !== null && form.watch('montant_ht') && form.watch('taux_tva')
                        ? formatCurrency(Number(form.watch('montant_ht')) * (Number(form.watch('taux_tva')) / 100))
                        : 'N/A'}
                    </span>
                  </div>
                  <div className="text-lg font-semibold">
                    Montant TTC: <span>{calculatedTTC !== null ? formatCurrency(calculatedTTC) : 'N/A'}</span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Notes ou commentaires sur cette facture..."
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
                  onClick={() => navigate('/factures')}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isLoadingAffaires}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? (isEdit ? 'Mise à jour...' : 'Création...') : (isEdit ? 'Mettre à jour' : 'Créer la facture')}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}
    </div>
  );
};

export default FactureCreatePage;