// components/client/tabs/AffairesTab.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase } from 'lucide-react';
import AffaireCard from './AffaireCard';

interface Affaire {
  id: number;
  titre?: string;
  reference?: string;
  description?: string;
  statut: string;
  date: string;
  date_debut?: string;
  date_fin_prevu?: string;
  offre_reference?: string;
  client_nom?: string;
}

interface AffairesTabProps {
  affaires: Affaire[];
  navigateToAffaire: (id: number) => void;
  navigateToOffre?: (reference: string) => void;
}

const AffairesTab: React.FC<AffairesTabProps> = ({
  affaires,
  navigateToAffaire,
  navigateToOffre
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Affaires ({affaires.length})</h3>
      </div>
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {affaires.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Briefcase className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucune affaire trouvée pour ce client</p>
              </CardContent>
            </Card>
          ) : (
            affaires.map((affaire) => (
              <AffaireCard
                key={affaire.id}
                affaire={{
                  id: affaire.id,
                  reference: affaire.reference || affaire.titre || `Affaire #${affaire.id}`,
                  client_nom: affaire.client_nom || '',
                  statut: affaire.statut,
                  date_debut: affaire.date_debut || affaire.date,
                  date_fin_prevu: affaire.date_fin_prevu,
                  offre_reference: affaire.offre_reference
                }}
                onClick={() => navigateToAffaire(affaire.id)}
                onViewDetails={() => navigateToAffaire(affaire.id)}
                onViewOffre={affaire.offre_reference && navigateToOffre ? 
                  () => navigateToOffre(affaire.offre_reference!) : 
                  undefined}
                compact={true}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AffairesTab;