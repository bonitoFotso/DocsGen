// components/client/tabs/OffresTab.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { OffreCommerciale } from '@/types/contact';
import OffreCard from './OffreCard';

interface OffresTabProps {
  offres: OffreCommerciale[];
  navigateToOffre: (id: number) => void;
}

const OffresTab: React.FC<OffresTabProps> = ({
  offres,
  navigateToOffre
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Offres ({offres.length})</h3>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {offres.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucune offre trouvée pour ce client</p>
              </CardContent>
            </Card>
          ) : (
            offres.map((offre) => (
              <OffreCard
                key={offre.id}
                offre={{
                  id: offre.id,
                  reference: offre.reference || `Offre #${offre.id}`,
                  client_nom: offre.client_nom || '',
                  entity_code: offre.entity_code || '',
                  statut: offre.statut,
                  date_creation: offre.date_creation,
                  montant_total: offre.montant,
                  validite_date: offre.validite_date,
                  produits_count: offre.produits_count
                }}
                onClick={() => navigateToOffre(offre.id)}
                onViewDetails={() => navigateToOffre(offre.id)}
                compact={true}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OffresTab;