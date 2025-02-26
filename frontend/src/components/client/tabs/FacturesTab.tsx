// components/client/tabs/FacturesTab.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CardInfo, getStatusColor } from '../ClientComponents';
import { Hash } from 'lucide-react';

interface Facture {
  id: number;
  numero: string;
  reference?: string;
  description?: string;
  statut: string;
  date: string;
  date_echeance?: string;
  montant?: number;
}

interface FacturesTabProps {
  factures: Facture[];
  navigateToFacture: (id: number) => void;
}

const FacturesTab: React.FC<FacturesTabProps> = ({
  factures,
  navigateToFacture
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Factures ({factures.length})</h3>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {factures.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Hash className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucune facture trouvée pour ce client</p>
              </CardContent>
            </Card>
          ) : (
            factures.map((facture) => (
              <CardInfo
                key={facture.id}
                title={`Facture #${facture.numero}`}
                subtitle={`Référence: ${facture.reference || '-'}`}
                status={facture.statut}
                statusColor={getStatusColor(facture.statut)}
                date={facture.date}
                onClick={() => navigateToFacture(facture.id)}
              >
                <div className="flex justify-between text-sm">
                  <div className="text-muted-foreground">
                    Échéance: {facture.date_echeance || '-'}
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {facture.montant?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </Badge>
                </div>
              </CardInfo>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default FacturesTab;