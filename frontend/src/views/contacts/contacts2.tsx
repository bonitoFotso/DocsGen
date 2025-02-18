import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, Clock } from "lucide-react";
import DataTable from './DataTable';
import CompanyList from './components/CompanyList';
import ClientTable from './components/ClientTable';

const ContactsPage = () => {
  const [activeTab, setActiveTab] = useState("tous");

  // Exemple de données de contacts
  const contacts = [
    { id: 1, nom: "Jean Dupont", email: "jean@example.com", favori: true },
    { id: 2, nom: "Marie Martin", email: "marie@example.com", favori: false },
    { id: 3, nom: "Pierre Durant", email: "pierre@example.com", favori: true },
    { id: 4, nom: "Sophie Bernard", email: "sophie@example.com", favori: false },
  ];

  // Filtrer les contacts selon l'onglet actif
  const filteredContacts = {
    tous: contacts,
    favoris: contacts.filter(contact => contact.favori),
    recents: contacts.slice(0, 2) // Simuler les contacts récents
  };

  const ContactCard = ({ contact }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-lg">{contact.nom}</h3>
            <p className="text-gray-600">{contact.email}</p>
          </div>
          {contact.favori && (
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Contacts</h1>
      
      <Tabs defaultValue="tous" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="tous" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tous
          </TabsTrigger>
          <TabsTrigger value="favoris" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Favoris
          </TabsTrigger>
          <TabsTrigger value="recents" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Récents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tous">
          <ClientTable/>
        </TabsContent>

        <TabsContent value="favoris">
          <CompanyList/>
        </TabsContent>

        <TabsContent value="recents">
         <DataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactsPage;