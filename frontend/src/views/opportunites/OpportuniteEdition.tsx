// OpportuniteEditionPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import {
  ContactSelect,
  EntitySelect,
  ProductSelect,
  AmountInput,
  ProductSelection,
  OfferSelection,
  TextAreaField,
  StatusBadge,
  ClientSelect,
} from '@/components/components';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  ArrowLeft,
} from 'lucide-react';
import { useOpportuniteEdit } from '@/hooks/useOpportuniteEdit';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { OpportuniteEdition } from '@/types/opportunite';

const OpportuniteEditionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportuniteService, clientService, contactService, productService } = useServices();

  const [formData, setFormData] = useState<OpportuniteEdition>({
    produits: [],
    produit_principal: 0,
    client_id: 0,
    contact_id: 0,
    montant_estime: 0,
    description: null,
    besoins_client: null,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOpportunite = async () => {
      if (!id) return;
      try {
        const data = await opportuniteService.getById(Number(id));
        setFormData({
          produits: data.produits,
          produit_principal: data.produit_principal,
          client_id: data.client_id,
          contact_id: data.contact_id,
          montant_estime: data.montant_estime,
          description: data.description,
          besoins_client: data.besoins_client,
        });
      } catch (error) {
        toast.error("Erreur lors du chargement de l'opportunité");
      } finally {
        setLoading(false);
      }
    };

    loadOpportunite();
  }, [id, opportuniteService]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (id) {
        await opportuniteService.update(Number(id), formData);
        toast.success("Opportunité mise à jour avec succès");
      }
      navigate(`/opportunities/${id}`);
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSubmitting(false);
    }
  };

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
  
  if (!formData) {
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
            <Button onClick={() => navigate(-1)}>
              Retour à la liste
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Modifier l'opportunité</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Montant estimé</label>
                <Input
                  type="number"
                  value={formData.montant_estime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    montant_estime: Number(e.target.value)
                  }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Besoins du client</label>
              <Textarea
                value={formData.besoins_client || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  besoins_client: e.target.value
                }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={submitting}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OpportuniteEditionPage;