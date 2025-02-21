import { useState, useCallback } from 'react';

type FilterType = 'categories' | 'villes' | 'secteurs' | 'regions' | 'entreprises';

interface UseFiltersReturn {
  selectedFilters: {
    categories: string[];
    villes: string[];
    secteurs: string[];
    regions: string[];
    entreprises: string[];
  };
  handleSelect: (type: FilterType, value: string) => void;
  handleRemove: (type: FilterType, value: string) => void;
}

export const useFilters = (): UseFiltersReturn => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVilles, setSelectedVilles] = useState<string[]>([]);
  const [selectedSecteurs, setSelectedSecteurs] = useState<string[]>([]);
    const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
    const [selectedEntreprises, setSelectedEntreprises] = useState<string[]>([]);

  const handleSelect = useCallback((type: FilterType, value: string) => {
    const setters = {
      categories: setSelectedCategories,
      villes: setSelectedVilles,
      secteurs: setSelectedSecteurs,
        regions: setSelectedRegions,
        entreprises: setSelectedEntreprises

    };

    setters[type](prev => [...prev, value]);
  }, []);

  const handleRemove = useCallback((type: FilterType, value: string) => {
    const setters = {
      categories: setSelectedCategories,
      villes: setSelectedVilles,
      secteurs: setSelectedSecteurs,
        regions: setSelectedRegions,
        entreprises: setSelectedEntreprises
    };

    setters[type](prev => prev.filter(item => item !== value));
  }, []);

  return {
    selectedFilters: {
      categories: selectedCategories,
      villes: selectedVilles,
      secteurs: selectedSecteurs,
        regions: selectedRegions,
        entreprises: selectedEntreprises
    },
    handleSelect,
    handleRemove
  };
};