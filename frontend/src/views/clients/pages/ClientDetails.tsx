import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClientDetails } from '@/types/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Users, 
  ClipboardList, 
  Briefcase, 
  FileText, 
  Building, 
  FileSearch, 
  User 
} from 'lucide-react';

const ClientDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clientService } = useServices();

  const [client, setClient] = useState<ClientDetails>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);



  const loadClient = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientService.getById(parseInt(id));
      setClient(data);
      
    } catch (err) {
      console.error('Error loading client:', err);
      setError('Erreur lors du chargement du client');
    } finally {
      setIsLoading(false);
    }
  },[clientService, id])

  useEffect(() => {
    loadClient();
  }, [id, loadClient]);


  const handleDelete = async () => {
    if (!id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      await clientService.delete(parseInt(id));
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      setError('Erreur lors de la suppression du client');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="p-6 space-y-6">
      {/* En-tête avec les informations principales */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">{client.nom}</CardTitle>
              <p className="text-sm text-gray-500">Client N° {client.c_num}</p>
            </div>
            <div className="flex gap-2">
              {client.agreer && (
                <Badge className="bg-green-500">Agréé</Badge>
              )}
              {client.agreement_fournisseur && (
                <Badge className="bg-blue-500">Fournisseur</Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-500" />
            <span>{client.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{client.telephone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{client.ville.nom}, {client.region_nom}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-500" />
            <span>BP: {client.bp}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>Quartier: {client.quartier}</span>
          </div>
          <div className="inline-block">
            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              {client.secteur_activite}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Onglets pour les différentes sections */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
        <TabsTrigger value="offres" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>Offres ({client.offres_count})</span>
          </TabsTrigger>
          <TabsTrigger value="affaires" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Affaires ({client.affaires_count})</span>
          </TabsTrigger>
          <TabsTrigger value="rapports" className="flex items-center gap-2">
            <FileSearch className="h-4 w-4" />
            <span>Rapports ({client.rapports.length})</span>
          </TabsTrigger>
          <TabsTrigger value="factures" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Factures ({client.factures_count})</span>
          </TabsTrigger>
          <TabsTrigger value="sites" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Sites ({client.sites.length})</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Contacts ({client.contacts_count})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.contacts.map((contact) => (
              <Card key={contact.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{contact.nom}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{contact.telephone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="offres" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {client.offres.map((offre) => (
              <Card key={offre.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{offre.titre}</span>
                    <Badge>{offre.statut}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{offre.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="affaires" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {client.affaires.map((affaire) => (
              <Card key={affaire.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{affaire.titre}</span>
                    <Badge>{affaire.statut}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">{affaire.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="factures" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {client.factures.map((facture) => (
              <Card key={facture.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Facture #{facture.numero}</span>
                    <Badge>{facture.statut}</Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Montant: {facture.montant}</span>
                    <span>Date: {facture.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sites" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {client.sites.map((site) => (
              <Card key={site.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4" />
                    <span className="font-medium">{site.nom}</span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{site.adresse}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rapports" className="mt-6">
          <div className="grid grid-cols-1 gap-4">
            {client.rapports.map((rapport) => (
              <Card key={rapport.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{rapport.titre}</span>
                    <span className="text-sm text-gray-500">{rapport.date}</span>
                  </div>
                  <p className="text-sm text-gray-500">{rapport.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientDetailsPage;