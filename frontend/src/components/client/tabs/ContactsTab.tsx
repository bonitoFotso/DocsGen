// components/client/tabs/ContactsTab.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactCard } from '../ClientComponents';
import { Users, PlusCircle } from 'lucide-react';
import { Contact } from '@/types/contact';



interface ContactsTabProps {
  contacts: Contact[];
  navigate: (path: string) => void;
  id?: string;
  navigateToContact: (id: number) => void;
}

const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
  navigate,
  id,
  navigateToContact
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Contacts ({contacts.length})</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/contacts/creation?client=${id}`)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Nouveau contact
        </Button>
      </div>
      
      <ScrollArea className="h-[500px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.length === 0 ? (
            <Card className="bg-muted/50 col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>Aucun contact trouvé pour ce client</p>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => navigate(`/contacts/creation?client=${id}`)}
                  className="mt-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ajouter un contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onClick={() => navigateToContact(contact.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContactsTab;