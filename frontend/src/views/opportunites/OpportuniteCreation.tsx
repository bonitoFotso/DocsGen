// OpportuniteCreation.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
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
  ClientSelect,
  ContactSelect,
  ProductSelect,
  AmountInput,
  ProductSelection,
  TextAreaField,
  EntitySelect
} from '@/components/FormComponents.tsx';
import { useOpportunity } from '@/hooks/useOpportunity';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { OpportuniteEdition } from '@/types/opportunite';

const OpportuniteCreation: React.FC = () => {
  const navigate = useNavigate();
  const { opportuniteService } = useServices();

  const [formData, setFormData] = useState<OpportuniteEdition>({
    produits: [],
    produit_principal: 0,
    client_id: 0,
    contact_id: 0,
    montant_estime: 0,
    description: null,
    besoins_client: null,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newOpportunity = await opportuniteService.create(formData);
      toast.success("Opportunité créée avec succès");
      navigate(`/opportunities/${newOpportunity.id}`);
    } catch (error) {
      toast.error("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nouvelle opportunité</h1>
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
                  required
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
            {submitting ? 'Création...' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OpportuniteCreation;