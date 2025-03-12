import React, { useState } from 'react';
import { Search } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClientSelectorProps } from './types';

const ClientSelector: React.FC<ClientSelectorProps> = ({ 
  isOpen, 
  setIsOpen, 
  clients, 
  handleClientChange, 
  getInitials 
}) => {
  const [searchValue, setSearchValue] = useState<string>('');
  
  // Filter clients based on search input
  const filteredClients = clients.filter(client => 
    client.nom.toLowerCase().includes(searchValue.toLowerCase()) ||
    client.c_num.toLowerCase().includes(searchValue.toLowerCase())
  );
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un client</DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez un client pour cette offre.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              className="pl-8"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </div>
          
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {filteredClients.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Aucun client trouvé
                </div>
              ) : (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
                    onClick={() => handleClientChange(client.id)}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{getInitials(client.nom)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{client.nom}</div>
                      <div className="text-xs text-muted-foreground">
                        {client.c_num}
                        {client.ville_nom && ` • ${client.ville_nom}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelector;