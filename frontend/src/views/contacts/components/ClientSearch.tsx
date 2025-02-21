import React, { useState } from 'react';
import { Search, Building2, MapPin, Briefcase, X, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ClientSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategories: string[];
  selectedVilles: string[];
  selectedSecteurs: string[];
  onCategorySelect: (category: string) => void;
  onVilleSelect: (ville: string) => void;
  onSecteurSelect: (secteur: string) => void;
  onCategoryRemove: (category: string) => void;
  onVilleRemove: (ville: string) => void;
  onSecteurRemove: (secteur: string) => void;
  uniqueCategories: string[];
  uniqueVilles: string[];
  uniqueSecteurs: string[];
  setGroupBy: (value: "none" | "region" | "ville_nom" | "entreprise" | "secteur" | "categorie") => void;
  groupBy: "none" | "region" | "ville_nom" | "entreprise" | "secteur" | "categorie";
}

const ClientSearch: React.FC<ClientSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategories,
  selectedVilles,
  selectedSecteurs,
  onCategorySelect,
  onVilleSelect,
  onSecteurSelect,
  onCategoryRemove,
  onVilleRemove,
  onSecteurRemove,
  uniqueCategories,
  uniqueVilles,
  uniqueSecteurs,
  setGroupBy,
  groupBy,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const hasActiveFilters = selectedCategories.length > 0 || selectedVilles.length > 0 || selectedSecteurs.length > 0;
  const totalFilters = selectedCategories.length + selectedVilles.length + selectedSecteurs.length;

  const clearAllFilters = () => {
    selectedCategories.forEach(onCategoryRemove);
    selectedVilles.forEach(onVilleRemove);
    selectedSecteurs.forEach(onSecteurRemove);
  };

  const GroupingOptions = () => (
    <Tabs defaultValue={groupBy} className="w-full" onValueChange={(value) => setGroupBy(value as "none" | "region" | "ville_nom" | "entreprise" | "secteur" | "categorie")}>
      <TabsList className="grid grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="none">Aucun</TabsTrigger>
        <TabsTrigger value="region">Région</TabsTrigger>
        <TabsTrigger value="ville_nom">Ville</TabsTrigger>
        <TabsTrigger value="secteur">Secteur</TabsTrigger>
        <TabsTrigger value="categorie">Catégorie</TabsTrigger>
        <TabsTrigger value="entreprise">Entreprise</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  const FilterBadges = () => (
    <div className="flex flex-wrap gap-2">
      {selectedCategories.map(category => (
        <Badge
          key={category}
          variant="secondary"
          className="px-3 py-1.5 rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          <Building2 className="w-3.5 h-3.5 mr-1.5" />
          {category}
          <button
            onClick={() => onCategoryRemove(category)}
            className="ml-2 hover:text-destructive focus:outline-none transition-colors"
            aria-label={`Supprimer le filtre ${category}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      ))}
      {selectedVilles.map(ville => (
        <Badge
          key={ville}
          variant="secondary"
          className="px-3 py-1.5 rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 mr-1.5" />
          {ville}
          <button
            onClick={() => onVilleRemove(ville)}
            className="ml-2 hover:text-destructive focus:outline-none transition-colors"
            aria-label={`Supprimer le filtre ${ville}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      ))}
      {selectedSecteurs.map(secteur => (
        <Badge
          key={secteur}
          variant="secondary"
          className="px-3 py-1.5 rounded-full text-sm hover:bg-secondary/80 transition-colors"
        >
          <Briefcase className="w-3.5 h-3.5 mr-1.5" />
          {secteur}
          <button
            onClick={() => onSecteurRemove(secteur)}
            className="ml-2 hover:text-destructive focus:outline-none transition-colors"
            aria-label={`Supprimer le filtre ${secteur}`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </Badge>
      ))}
    </div>
  );

  return (
    <Card className="bg-background">
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-2xl font-semibold">Recherche de clients</CardTitle>
          {hasActiveFilters && (
            <Badge variant="secondary" className="self-start lg:self-center">
              {totalFilters} filtre{totalFilters > 1 ? 's' : ''} actif{totalFilters > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-6">
          {/* Barre de recherche principale */}
          <div className="relative">
            <Input 
              className="h-14 pl-12 pr-12 text-lg rounded-2xl shadow-sm border-2 focus:border-primary transition-all"
              type="search" 
              placeholder="Rechercher un client par nom, ville, secteur..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
            {searchTerm && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Actions principales */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <GroupingOptions />
            
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full lg:w-auto">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                  {totalFilters > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {totalFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-96">
                <SheetHeader>
                  <SheetTitle>Filtres de recherche</SheetTitle>
                  <SheetDescription>
                    Affinez votre recherche en utilisant les filtres ci-dessous
                  </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Villes
                    </h4>
                    <Select onValueChange={onVilleSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une ville" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueVilles.map(ville => (
                          <SelectItem key={ville} value={ville}>
                            {ville}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Catégories
                    </h4>
                    <Select onValueChange={onCategorySelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Secteurs
                    </h4>
                    <Select onValueChange={onSecteurSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueSecteurs.map(secteur => (
                          <SelectItem key={secteur} value={secteur}>
                            {secteur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <SheetFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={clearAllFilters}
                  >
                    Réinitialiser les filtres
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Affichage des filtres actifs */}
          {hasActiveFilters && (
            <div className="bg-muted/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filtres actifs</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  Effacer tout
                </Button>
              </div>
              <FilterBadges />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientSearch;