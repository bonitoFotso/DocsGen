// components/client/tabs/SitesTab.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SiteCard, getStatusColor } from '../ClientComponents';
import { Building, PlusCircle } from 'lucide-react';

interface Site {
  id: number;
  nom: string;
  code?: string;
  adresse?: string;
  ville?: string;
  statut?: string;
}

interface SitesTabProps {
  sites: Site[];
  navigate: (path: string) => void;
  id?: string;
  navigateToSite: (id: number) => void;
}

const SitesTab: React.FC<SitesTabProps> = ({
  sites,
  navigate,
  id,
  navigateToSite
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Sites ({sites.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/sites/creation?client=${id}`)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau site
        </Button>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.length === 0 ? (
            <Card className="bg-muted/50 col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Building className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucun site trouvé pour ce client</p>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => navigate(`/sites/creation?client=${id}`)}
                  className="mt-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un site
                </Button>
              </CardContent>
            </Card>
          ) : (
            sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                onClick={() => navigateToSite(site.id)}
                statusColor={getStatusColor}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SitesTab;