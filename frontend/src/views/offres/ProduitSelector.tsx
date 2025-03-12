import React, { useState } from 'react';
import { Search, PackagePlus, PackageCheck } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { ProduitSelectorProps } from './types';

const ProduitSelector: React.FC<ProduitSelectorProps> = ({ 
  isOpen, 
  setIsOpen, 
  produits, 
  formData, 
  handleProductSelect, 
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  
  // Filter products based on search input
  const filteredProduits = produits.filter(produit => {
    const searchLower = searchValue.toLowerCase();
    const nameMatch = produit.name?.toLowerCase().includes(searchLower) || false;
    const codeMatch = produit.code?.toLowerCase().includes(searchLower) || false;
    const categorieMatch = produit.category?.toLowerCase().includes(searchLower) || false;
    
    return nameMatch || codeMatch || categorieMatch;
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter des produits</DialogTitle>
          <DialogDescription>
            Sélectionnez les produits à ajouter à cette offre.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredProduits.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun produit trouvé
                </div>
              ) : (
                filteredProduits.map(produit => {
                  const isSelected = formData.produits.some(p => p.id === produit.id);
                  const displayName = produit.name || 'Produit sans nom';
                  
                  return (
                    <div
                      key={produit.id}
                      className={`flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer ${isSelected ? 'bg-primary/10' : ''}`}
                      onClick={() => handleProductSelect(produit)}
                    >
                      <div className="flex items-center">
                        <Checkbox 
                          checked={isSelected}
                          className="mr-2"
                          onCheckedChange={() => {}}
                        />
                        <div>
                          <div className="font-medium">{displayName}</div>
                          
                        </div>
                      </div>
                      {isSelected ? (
                        <PackageCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <PackagePlus className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProduitSelector;