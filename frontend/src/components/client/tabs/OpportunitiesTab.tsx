// components/client/tabs/OpportunitesTab.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart4 } from 'lucide-react';
import { OpportuniteCard } from './OpportuniteCard';

interface Opportunite {
  id: number;
  reference: string;
  client_nom: string;
  produit_name: string;
  statut: string;
  date_detection: string;
  contact_id: number;
  montant_estime: number;
  probabilite: number;
  description?: string;
}

interface OpportunitesTabProps {
  opportunites: Opportunite[];
  navigateToOpportunite: (id: number) => void;
  onCreateOpportunite?: () => void;
}

const OpportunitesTab: React.FC<OpportunitesTabProps> = ({
  opportunites,
  navigateToOpportunite,
  onCreateOpportunite
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Opportunités ({opportunites.length})</h3>
        {onCreateOpportunite && (
          <Button onClick={onCreateOpportunite} size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle opportunité
          </Button>
        )}
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {opportunites.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <BarChart4 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucune opportunité trouvée pour ce client</p>
              </CardContent>
            </Card>
          ) : (
            opportunites.map((opportunite) => (
              <OpportuniteCard
                key={opportunite.id}
                opportunite={{
                  id: opportunite.id,
                  reference: opportunite.reference,
                  client_nom: opportunite.client_nom,
                  produit_name: opportunite.produit_name,
                  statut: opportunite.statut,
                  date_detection: opportunite.date_detection,
                  montant_estime: opportunite.montant_estime,
                  probabilite: opportunite.probabilite,
                  description: opportunite.description
                }}
                onClick={() => navigateToOpportunite(opportunite.id)}
                onViewDetails={() => navigateToOpportunite(opportunite.id)}
                compact={true}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default OpportunitesTab;