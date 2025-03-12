// components/offre/ClientInfoCard.tsx
import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Client } from '@/types/client';
import { Contact } from '@/types/contact';

interface ClientInfoCardProps {
  client: Client;
  contact?: Contact;
  onViewClientProfile?: () => void;
}

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ 
  client, 
  contact, 
  onViewClientProfile 
}) => {
  // Obtenir les initiales du client pour l'avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    const nameArray = name.split(' ');
    if (nameArray.length >= 2) {
      return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Client</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-primary/10">
            <AvatarFallback className="text-primary">{getInitials(client.nom)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{client.nom}</div>
            <div className="text-xs text-muted-foreground">{client.c_num}</div>
          </div>
        </div>
        
        {contact && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="text-sm font-medium">Contact principal</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.nom}</span>
                </div>
                
                {contact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="hover:underline">{contact.email}</a>
                  </div>
                )}
                
                {contact.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${contact.telephone}`} className="hover:underline">{contact.telephone}</a>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onViewClientProfile}
        >
          Voir le profil client
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClientInfoCard;