// pages/ClientDetailsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import { ClientDetails } from '@/types/client';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

// Composants client
import ClientHeader from '@/components/client/ClientHeader';
import ClientStats from '@/components/client/ClientStats';
import ClientDeleteDialog from '@/components/client/ClientDeleteDialog';
import ClientTabContainer from '@/components/client/ClientTabs';

const ClientDetailsPage: React.FC = () => {
  // Hooks React en haut de la fonction du composant
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { clientService, offreService, affaireService, contactService, 
          siteService, factureService, opportuniteService,
          formationService, rapportService } = useServices();

  // États
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [offres, setOffres] = useState([]);
  const [affaires, setAffaires] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [sites, setSites] = useState([]);
  const [factures, setFactures] = useState([]);
  const [opportunites, setOpportunites] = useState([]);
  const [formations, setFormations] = useState([]);
  const [rapports, setRapports] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour le dialogue de suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Charger les détails du client et ses données associées
  const loadClientData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      // Chargement parallèle des données
      const [
        clientData,
        offresData,
        affairesData,
        contactsData,
        sitesData,
        facturesData,
        opportunitesData,
        formationsData,
        rapportsData
      ] = await Promise.all([
        clientService.getById(parseInt(id)),
        offreService.getByClient(parseInt(id)),
        affaireService.getByClient(parseInt(id)),
        contactService.getByClient(parseInt(id)),
        siteService.getByClient(parseInt(id)),
        factureService.getByClient(parseInt(id)),
        opportuniteService.getByClient(parseInt(id)),
        formationService.getByClient(parseInt(id)),
        rapportService.getByClient(parseInt(id))
      ]);
      
      setClient(clientData);
      setOffres(offresData);
      setAffaires(affairesData);
      setContacts(contactsData);
      setSites(sitesData);
      setFactures(facturesData);
      setOpportunites(opportunitesData);
      setFormations(formationsData);
      setRapports(rapportsData);
    } catch (err) {
      console.error('Error loading client data:', err);
      setError('Erreur lors du chargement des données du client');
      toast("Erreur", {
        description: "Impossible de charger les détails du client"
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    id, 
    clientService, 
    offreService, 
    affaireService, 
    contactService, 
    siteService, 
    factureService, 
    opportuniteService,
    formationService,
    rapportService
  ]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  // Gestionnaires d'événements
  const handleEdit = () => {
    navigate(`/clients/${id}/edit`);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await clientService.delete(parseInt(id!));
      toast("Succès", {
        description: "Client supprimé avec succès"
      });
      navigate('/clients');
    } catch (err) {
      console.error('Error deleting client:', err);
      toast("Erreur", {
        description: "Erreur lors de la suppression du client"
      });
    } finally {
      setIsSubmitting(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleCreateOpportunite = () => {
    navigate(`/opportunities/creation?client=${id}`);
  };

  // Fonctions de navigation vers les détails
  const navigateToOpportunite = (opportuniteId: number) => {
    navigate(`/opportunities/${opportuniteId}`);
  };

  const navigateToContact = (contactId: number) => {
    navigate(`/contacts/${contactId}`);
  };

  const navigateToOffre = (offreId: number) => {
    navigate(`/offres/${offreId}`);
  };

  const navigateToAffaire = (affaireId: number) => {
    navigate(`/affaires/${affaireId}`);
  };

  const navigateToFacture = (factureId: number) => {
    navigate(`/factures/${factureId}`);
  };

  const navigateToSite = (siteId: number) => {
    navigate(`/sites/${siteId}`);
  };

  const navigateToFormation = (formationId: number) => {
    navigate(`/formations/${formationId}`);
  };

  const navigateToRapport = (rapportId: number) => {
    navigate(`/rapports/${rapportId}`);
  };

  // Fonction pour activer un onglet
  const activateTab = (tabId: string) => {
    // Implémentation pour les nouveaux onglets
    // Cette fonction pourrait ne plus être nécessaire avec le nouveau composant de tabs
  };

  // Afficher le chargement
  if (isLoading) {
    return (
      <div className="container p-6 space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>

        <Skeleton className="h-64" />
      </div>
    );
  }

  // Afficher l'erreur
  if (error) {
    return (
      <div className="container p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
            <Button className="mt-4" onClick={() => navigate('/clients')}>
              Retour à la liste des clients
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="container p-6 space-y-6">
      {/* En-tête avec les informations principales */}
      <ClientHeader 
        client={client}
        onEdit={handleEdit}
        onDelete={() => setDeleteDialogOpen(true)}
        onCreateOpportunity={handleCreateOpportunite}
        isSubmitting={isSubmitting}
      />
      
      {/* Résumé des statistiques */}
      <ClientStats 
        client={client}
        onStatClick={activateTab}
      />

      {/* Conteneur d'onglets pour toutes les données du client */}
      <ClientTabContainer 
        client={client}
        offres={offres}
        affaires={affaires}
        contacts={contacts}
        sites={sites}
        factures={factures}
        opportunites={opportunites}
        formations={formations}
        rapports={rapports}
        navigateToOffre={navigateToOffre}
        navigateToAffaire={navigateToAffaire}
        navigateToContact={navigateToContact}
        navigateToSite={navigateToSite}
        navigateToFacture={navigateToFacture}
        navigateToOpportunite={navigateToOpportunite}
        navigateToFormation={navigateToFormation}
        navigateToRapport={navigateToRapport}
        onCreateOpportunite={handleCreateOpportunite}
      />

      {/* Dialogue de confirmation de suppression */}
      <ClientDeleteDialog 
        open={deleteDialogOpen}
        clientName={client.nom}
        isSubmitting={isSubmitting}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ClientDetailsPage;