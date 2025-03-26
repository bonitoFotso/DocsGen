import React, { useEffect, useState } from 'react';
import {
  Plus,
  FileText,
  Trash2,
  Package,
  Tag,
  Star,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { OffreFormData } from './types';
import { Produit } from '@/types/offre';

interface OffreProductsSectionProps {
  formData: OffreFormData;
  setIsProduitDialogOpen: (isOpen: boolean) => void;
  handleRemoveProduct: (id: number) => void;
  handleChange: (field: string, value: unknown) => void;
  errors: {
    produits?: string;
  };
}

const OffreProductsSection: React.FC<OffreProductsSectionProps> = ({
  formData,
  setIsProduitDialogOpen,
  handleRemoveProduct,
  handleChange,
  errors,
}) => {
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
  const [produitPrincipale, setProduitPrincipale] = useState<Produit | null>(null);
  useEffect(() => {

    setProduitPrincipale(formData.produit_principal ? formData.produits.find(p => p.id === Number(formData.produit_principal)) ?? null : null);
    console.log(produitPrincipale);
  }, [formData.produit_principal, formData.produits, produitPrincipale]);

  // Trouver le produit principal actuel
  const mainProduct = formData.produit_principal
      ? formData.produits.find(p => p.id === Number(formData.produit_principal))
    : null;

  return (
    <Card className="shadow-sm border-primary/10 hover:border-primary/20 transition-all">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <div>
          <CardTitle className="text-lg flex items-center">
            <Package className="h-5 w-5 mr-2 text-primary" />
            Produits et services
          </CardTitle>
          <CardDescription>Ajoutez les produits à inclure dans cette offre</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProduitDialogOpen(true);
                }}
                className="hover:bg-primary/10 hover:text-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ajouter un nouveau produit à l'offre</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="pt-4">
        {errors.produits && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errors.produits}</AlertDescription>
          </Alert>
        )}

        {/* Section pour sélection du produit principal */}
        {formData.produits.length > 0 && (
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-2 text-amber-500" />
                <Label htmlFor="produit_principal" className="font-medium">Produit principal: {produitPrincipale?.name}</Label>
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">Principal</Badge>
            </div>

            {/* Select pour choisir le produit principal */}
            <Select
              value={formData.produit_principal ? formData.produit_principal.toString() : ''}
              onValueChange={(value) => {
                handleChange('produit_principal', Number(value));
              }}
            >
              <SelectTrigger className="w-full ring-offset-primary/20 focus:ring-primary/20">
                <SelectValue placeholder="Sélectionner un produit principal" />
              </SelectTrigger>
              <SelectContent>
                {formData.produits.map((produit) => (
                  <SelectItem key={produit.id} value={produit.id.toString()}>
                    {produit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Affichage du produit principal sélectionné */}
            {mainProduct && (
              <div className="border rounded-md p-4 bg-amber-50/30 shadow-sm">
                <div className="font-medium flex items-center">
                  <Package className="h-4 w-4 mr-2 text-primary" />
                  {mainProduct.name}
                </div>

                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-2">
                    {mainProduct.code}
                  </Badge>

                  {mainProduct.category && (
                    <div className="flex items-center ml-2">
                      <Tag className="h-3 w-3 mr-1" />
                      <span>{mainProduct.category}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Separator className="my-4" />
          </div>
        )}

        {/* Liste des produits ou message vide */}
        {formData.produits.length === 0 ? (
          <div className="border rounded-md p-6 text-center bg-muted/5">
            <FileText className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun produit ajouté à cette offre</p>
            <Button
              variant="outline"
              className="mt-4 hover:bg-primary/10 hover:text-primary"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsProduitDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter des produits
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Titre pour la liste des produits */}
            <div className="flex items-center mt-2 mb-1">
              <Label className="font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-primary/80" />
                Liste des produits
              </Label>
              <Badge variant="outline" className="ml-2">{formData.produits.length}</Badge>
            </div>

            {/* Liste complète des produits */}
            <div className="space-y-3">
              {formData.produits.map((produit) => (
                <div
                  key={produit.id}
                  className={`border rounded-md p-4 relative transition-all ${
                    formData.produit_principal?.toString() === produit.id.toString() 
                      ? 'border-amber-300 bg-amber-50/30' 
                      : hoveredProductId === produit.id 
                        ? 'border-primary/50 bg-muted/10 shadow-sm' 
                        : 'hover:border-primary/30 hover:bg-muted/5'
                  }`}
                  onMouseEnter={() => setHoveredProductId(produit.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${
                              formData.produit_principal?.toString() === produit.id.toString() 
                                ? 'text-amber-500 bg-amber-50' 
                                : 'text-primary hover:bg-primary/10'
                            }`}
                            onClick={() => {
                              handleChange('produit_principal', produit.id);
                            }}
                          >
                            <Star className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                        {formData.produit_principal?.toString() === produit.id.toString()
                            ? 'Produit principal actuel' 
                            : 'Définir comme produit principal'
                          }
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveProduct(produit.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Supprimer ce produit</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-3 pr-16">
                    <div>
                      <div className="font-medium flex items-center">
                        {formData.produit_principal?.toString() === produit.id.toString() && (
                          <Badge variant="outline" className="mr-2 bg-amber-50 text-amber-700 border-amber-200">
                            Principal
                          </Badge>
                        )}
                        {produit.name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center mt-1">
                        <Badge variant="outline" className="mr-1">
                          {produit.code}
                        </Badge>
                        {produit.category && (
                          <div className="flex items-center ml-2">
                            <Tag className="h-3 w-3 mr-1" />
                            <span>{produit.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bouton pour ajouter d'autres produits */}
            <Button
              variant="outline"
              type="button"
              className="mt-2 w-full hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation();
                setIsProduitDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un autre produit
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-muted/5 py-3 px-6 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {formData.produits.length} produit{formData.produits.length !== 1 ? 's' : ''} dans cette offre
        </div>
        {mainProduct && (
          <div className="text-sm">
            Produit principal: <span className="font-medium">{mainProduct.name}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default OffreProductsSection;