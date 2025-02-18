import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, UserSquare2, Phone, Mail } from 'lucide-react';

interface Contact {
  id: number;
  nom: string;
  prenom: string | null;
  email: string | null;
  telephone: string | null;
  mobile: string | null;
  poste: string | null;
  service: string | null;
  quartier: string | null;
  bp: string | null;
  notes: string | null;
}

interface Client {
  id: number;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
  c_num: string;
  secteur_activite: string | null;
  bp: string | null;
  quartier: string | null;
  matricule: string | null;
  contacts: Contact[];
}

interface Ville {
  id: number;
  nom: string;
  clients: Client[];
}

interface Region {
  id: number;
  nom: string;
  pays_nom: string;
  villes: Ville[];
}

const ContactCard: React.FC<{ contact: Contact }> = ({ contact }) => {
  return (
    <div className="p-4 border rounded-lg mb-2 bg-white">
      <div className="flex items-center gap-2 mb-2">
        <UserSquare2 className="h-4 w-4" />
        <span className="font-medium">
          {contact.nom} {contact.prenom}
        </span>
      </div>
      {contact.poste && (
        <div className="text-sm text-gray-600 mb-1">{contact.poste}</div>
      )}
      {contact.email && (
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4" />
          {contact.email}
        </div>
      )}
      {(contact.telephone || contact.mobile) && (
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4" />
          {contact.telephone || contact.mobile}
        </div>
      )}
    </div>
  );
};

const ClientCard: React.FC<{ client: Client }> = ({ client }) => {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {client.nom}
        </CardTitle>
        <CardDescription>
          {client.secteur_activite && (
            <Badge variant="secondary">{client.secteur_activite}</Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          {client.email && (
            <div className="flex items-center gap-2 text-sm mb-1">
              <Mail className="h-4 w-4" />
              {client.email}
            </div>
          )}
          {client.telephone && (
            <div className="flex items-center gap-2 text-sm mb-1">
              <Phone className="h-4 w-4" />
              {client.telephone}
            </div>
          )}
          {client.adresse && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              {client.adresse}
            </div>
          )}
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="contacts">
            <AccordionTrigger>
              Contacts ({client.contacts.length})
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {client.contacts.map(contact => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
};

const RegionHierarchy: React.FC<{ data: Region[] }> = ({ data }) => {
  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Régions du Cameroun</h1>
      
      <Accordion type="single" collapsible className="w-full">
        {data.map(region => (
          <AccordionItem key={region.id} value={`region-${region.id}`}>
            <AccordionTrigger className="text-lg">
              {region.nom}
            </AccordionTrigger>
            <AccordionContent>
              <div className="pl-4">
                <Accordion type="single" collapsible className="w-full">
                  {region.villes.map(ville => (
                    <AccordionItem key={ville.id} value={`ville-${ville.id}`}>
                      <AccordionTrigger>
                        {ville.nom} ({ville.clients.length} clients)
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 space-y-4">
                          {ville.clients.map(client => (
                            <ClientCard key={client.id} client={client} />
                          ))}
                          {ville.clients.length === 0 && (
                            <p className="text-gray-500 italic">
                              Aucun client enregistré
                            </p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default RegionHierarchy;