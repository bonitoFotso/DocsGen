import React from 'react';
import { Search, Building2, MapPin, Briefcase } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  uniqueSecteurs
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="flex gap-2 flex-wrap">
            {/* Filtre par ville */}
            <Select onValueChange={onVilleSelect}>
              <SelectTrigger>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>Filtrer par ville</span>
                </Button>
              </SelectTrigger>
              <SelectContent>
                {uniqueVilles.map(ville => (
                  <SelectItem key={ville} value={ville}>
                    {ville}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par catégorie */}
            <Select onValueChange={onCategorySelect}>
              <SelectTrigger>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>Filtrer par catégorie</span>
                </Button>
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtre par secteur */}
            <Select onValueChange={onSecteurSelect}>
              <SelectTrigger>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Filtrer par secteur</span>
                </Button>
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

        {/* Badges des filtres sélectionnés */}
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedCategories.map(category => (
            <Badge
              key={category}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Building2 className="w-3 h-3" />
              {category}
              <button
                onClick={() => onCategoryRemove(category)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedVilles.map(ville => (
            <Badge
              key={ville}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              {ville}
              <button
                onClick={() => onVilleRemove(ville)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
          {selectedSecteurs.map(secteur => (
            <Badge
              key={secteur}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Briefcase className="w-3 h-3" />
              {secteur}
              <button
                onClick={() => onSecteurRemove(secteur)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientSearch;