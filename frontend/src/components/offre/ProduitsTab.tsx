// components/offre/ProduitsTab.tsx
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Produit } from '@/types/offre';

interface ProduitsTabProps {
  produits: Produit[];
}

const ProduitsTab: React.FC<ProduitsTabProps> = ({ produits }) => {
  // Formater le montant
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Calcul du montant total des produits
  const calculerMontantTotal = (products: Produit[]) => {
    return products.reduce((total, product) => total + product.prix, 0);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Produit</TableHead>
            <TableHead>Code</TableHead>
            {produits.some(p => p.quantite !== undefined) && (
              <TableHead className="text-right">Quantité</TableHead>
            )}
            <TableHead className="text-right">Prix</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produits.map((produit) => (
            <TableRow key={produit.id}>
              <TableCell className="font-medium">{produit.name}</TableCell>
              <TableCell>{produit.code}</TableCell>
              {produits.some(p => p.quantite !== undefined) && (
                <TableCell className="text-right">
                  {produit.quantite !== undefined ? `${produit.quantite} ${produit.unite || ''}` : '-'}
                </TableCell>
              )}
              <TableCell className="text-right">{formatMontant(produit.prix)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={produits.some(p => p.quantite !== undefined) ? 3 : 2} className="text-right font-bold">Total</TableCell>
            <TableCell className="text-right font-bold">{formatMontant(calculerMontantTotal(produits))}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </Card>
  );
};

export default ProduitsTab;