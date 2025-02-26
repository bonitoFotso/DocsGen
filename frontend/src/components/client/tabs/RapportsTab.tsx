// components/client/tabs/RapportsTab.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CardInfo } from '../ClientComponents';
import { FileSearch, PlusCircle } from 'lucide-react';

interface Rapport {
  id: number;
  titre: string;
  description?: string;
  date: string;
}

interface RapportsTabProps {
  rapports: Rapport[];
  navigate: (path: string) => void;
  id?: string;
  navigateToRapport: (id: number) => void;
}

const RapportsTab: React.FC<RapportsTabProps> = ({
  rapports,
  navigate,
  id,
  navigateToRapport
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Rapports ({rapports.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/rapports/creation?client=${id}`)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau rapport
        </Button>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {rapports.length === 0 ? (
            <Card className="bg-muted/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <FileSearch className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucun rapport trouvé pour ce client</p>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => navigate(`/rapports/creation?client=${id}`)}
                  className="mt-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Créer un rapport
                </Button>
              </CardContent>
            </Card>
          ) : (
            rapports.map((rapport) => (
              <CardInfo
                key={rapport.id}
                title={rapport.titre || `Rapport #${rapport.id}`}
                subtitle={rapport.description?.substring(0, 100) || 'Aucune description'}
                date={rapport.date}
                onClick={() => navigateToRapport(rapport.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RapportsTab;