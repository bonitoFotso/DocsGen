// components/CourrierForm.tsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DatePicker from '@/components/ui/DatePicker';
import { Label } from '@/components/ui/label';
import { useServices } from '@/AppHooks';
import { ClientBase, EntityBase } from '@/interfaces';
import { useCourrier } from '@/hooks/useCourriers';
import { Courrier, DOC_TYPES } from '@/types/courrier';

// Schéma de validation Zod
const formSchema = z.object({
  objet: z.string().min(5, 'L\'objet doit contenir au moins 5 caractères'),
  entite_id: z.number({ required_error: 'Veuillez sélectionner une entité' }),
  client_id: z.number({ required_error: 'Veuillez sélectionner un client' }),
  doc_type: z.string().min(1, 'Veuillez sélectionner un type de document'),
  direction: z.string().min(1, 'Veuillez sélectionner une direction'),
  date_creation: z.string().optional(),
  date_envoi: z.string().optional(),
  date_reception: z.string().optional(),
  notes: z.string().optional(),
  est_urgent: z.boolean().default(false),
  fichier: z.any().optional(),
});

interface CourrierFormProps {
  courrier?: Courrier;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

const CourrierForm: React.FC<CourrierFormProps> = ({
  courrier,
  onCancel,
  isSubmitting,
}) => {
    const { entityService, clientService } = useServices();
  
  const [file, setFile] = useState<File | null>(null);
  const [entities, setEntities] = useState<EntityBase[]>([]);
  const [clients, setClients] = useState<ClientBase[]>([]);

  const { createCourrier } = useCourrier();

  // Charger les entités et clients
  useEffect(() => {
    entityService.getAll().then(setEntities);
    clientService.getAll().then(setClients);
  }, [entityService, clientService]);
  
  
  
  // Initialiser le formulaire
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objet: courrier?.objet || '',
      entite_id: courrier?.entite?.id || undefined,
      client_id: courrier?.client?.id || undefined,
      doc_type: courrier?.doc_type || '',
      direction: courrier?.direction || '',
      date_creation: courrier?.date_creation || format(new Date(), 'yyyy-MM-dd'),
      date_envoi: courrier?.date_envoi || '',
      date_reception: courrier?.date_reception || '',
      notes: courrier?.notes || '',
      est_urgent: courrier?.est_urgent || false,
    },
  });

  // Gérer la soumission du formulaire
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    
    // Ajouter les valeurs du formulaire
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'fichier') {
        formData.append(key, String(value));
      }
    });
    
    // Ajouter le fichier s'il y en a un
    if (file) {
      formData.append('fichier', file);
    }
    
    // onSubmit(formData);
    await createCourrier(formData);
  };
  
  // Gérer le changement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Afficher le fichier actuel s'il y en a un
  const renderCurrentFile = () => {
    if (courrier?.fichier) {
      const fileName = courrier.fichier.split('/').pop() || 'Fichier';
      return (
        <Alert className="mb-4">
          <AlertDescription>
            Fichier actuel: <a href={courrier.fichier} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">{fileName}</a>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{courrier ? 'Modifier le courrier' : 'Nouveau courrier'}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="entite_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entité</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entities.map((entity) => (
                          <SelectItem key={entity.id} value={entity.id.toString()}>
                            {entity.name}
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
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objet</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Objet du courrier" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="doc_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type de document</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(DOC_TYPES).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>{value}</SelectItem>
                                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Direction</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IN">Entrant</SelectItem>
                        <SelectItem value="OUT">Sortant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date_creation"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de création</FormLabel>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : new Date()}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      locale={fr}
                      className="w-full"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_envoi"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'envoi</FormLabel>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      locale={fr}
                      placeholderText="Sélectionner une date"
                      className="w-full"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date_reception"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de réception</FormLabel>
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      locale={fr}
                      placeholderText="Sélectionner une date"
                      className="w-full"
                    />
                    <FormMessage />
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
                      {...field} 
                      placeholder="Informations supplémentaires..." 
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="est_urgent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Urgent</FormLabel>
                    <FormDescription>
                      Marquer ce courrier comme prioritaire
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <div>
                <Label htmlFor="fichier">Document</Label>
                {renderCurrentFile()}
                <div className="mt-2">
                  <Input
                    id="fichier"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <FormDescription>
                    Formats acceptés: PDF, DOCX, JPG, PNG (max 10 MB)
                  </FormDescription>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {courrier ? 'Mettre à jour' : 'Enregistrer'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CourrierForm;