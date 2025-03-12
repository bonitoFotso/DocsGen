// pages/OffreDetails.tsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useServices } from '@/AppHooks';

// Composants
import NotFound from '@/components/common/NotFound';
import OffreHeader from '@/components/offre/OffreHeader';
import OffreDetailCard from '@/components/offre/OffreDetailCard';
import ReminderAlert from '@/components/offre/ReminderAlert';
import ProduitsTab from '@/components/offre/ProduitsTab';
import HistoriqueTab from '@/components/offre/HistoriqueTab';
import ClientInfoCard from '@/components/offre/ClientInfoCard';
import ActionsCard from '@/components/offre/ActionsCard';
import DocumentsCard from '@/components/offre/DocumentsCard';
import { useOffreDetails } from '@/hooks/useOffreDetails';
import Loader from '@/common/Loader';

const OffreDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { offreService } = useServices();
  
  // Utiliser notre hook personnalisé pour charger les données
  const { offre, loading, historique, error } = useOffreDetails({ 
    id: Number(id), 
    offreService 
  });

  // Gestionnaires d'événements
  const onBack = () => {
    navigate('/offres');
  };

  const onEdit = () => {
    navigate(`/offres/${id}/edit`);
  };

  const onPrint = () => {
    console.log('Impression de l\'offre');
    // Logique d'impression
  };

  const onDownload = () => {
    console.log('Téléchargement de l\'offre en PDF');
    // Logique de téléchargement
  };

  const onArchive = () => {
    console.log('Archivage de l\'offre');
    // Logique d'archivage
  };

  const onSendEmail = () => {
    console.log('Envoi de l\'offre par email');
    // Logique d'envoi par email
  };

  const onDelete = () => {
    console.log('Suppression de l\'offre');
    // Logique de suppression avec confirmation
  };

  const onMarkWon = async () => {
    try {
      const response = await offreService.markWon(Number(id));
      const data = response;
      return { success: data.success, current_status: data.current_status };
    } catch (error) {
      console.error('Erreur lors de la marque de l\'offre comme gagnée', error);
      return { success: false };
    }
  };


  const onMarkLost = async () => {
    try {
      const response = await offreService.markLost(Number(id));
      const data = response;
      return { success: data.success, current_status: data.current_status };
    } catch (error) {
      console.error('Erreur lors de la marque de l\'offre comme perdue', error);
      return { success: false };
    }
  };

  const onSendReminder = async () => {
    try {
      //const response = await offreService.sendReminder(Number(id));
      //const data = response;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la relance', error);
      return { success: false };
    }
  };

  const onSendOffer = async () => {
    try {
      const response = await offreService.send(Number(id));
      const data = response;
      return { success: data.success, current_status: data.current_status };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'offre', error);
      return { success: false };
    }
  };

  const onViewClientProfile = () => {
    if (offre?.client?.id) {
      navigate(`/clients/${offre.client.id}`);
    }
  };

  const onAddDocument = (file: File) => {
    console.log('Ajouter un document');
    // Logique pour ajouter un document
    offreService.upload(Number(id), file);
  };

  // Affichage de l'état de chargement
  if (loading) {
    return <Loader />;
  }

  // Affichage en cas d'erreur ou d'absence de données
  if (error || !offre) {
    return (
      <NotFound 
        onBack={onBack} 
        title="Offre non trouvée" 
        subtitle="L'offre que vous recherchez n'existe pas ou a été supprimée."
      />
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* En-tête avec actions */}
      <OffreHeader
        onBack={onBack}
        onEdit={onEdit}
        onPrint={onPrint}
        onDownload={onDownload}
        onArchive={onArchive}
        onSendEmail={onSendEmail}
        onDelete={onDelete}
      />
      
      {/* Alerte de relance si nécessaire */}
      {offre.necessite_relance && offre.relance && (
        <ReminderAlert date={offre.relance} />
      )}
      
      <div className="grid grid-cols-3 gap-6">
        {/* Section principale */}
        <div className="col-span-2 space-y-6">
          {/* Carte de détails de l'offre */}
          <OffreDetailCard offre={offre} />
          
          {/* Onglets */}
          <Tabs defaultValue="produits">
            <TabsList className="mb-4">
              <TabsTrigger value="produits">Produits</TabsTrigger>
              <TabsTrigger value="historique">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="produits" className="space-y-4">
              <ProduitsTab produits={offre.produits} />
            </TabsContent>
            
            <TabsContent value="historique" className="space-y-4">
              <HistoriqueTab historique={historique} />
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Informations client */}
          <ClientInfoCard 
            client={offre.client} 
            contact={offre.contact}
            onViewClientProfile={onViewClientProfile}
          />
          
          {/* Actions sur l'offre */}
          <ActionsCard 
            statut={offre.statut}
            necessite_relance={offre.necessite_relance}
            onMarkWon={async () => {
              const result = await onMarkWon();
              return {
                success: result.success,
                current_status: result.current_status!
              };
            }}
            onMarkLost={async () => {
              const result = await onMarkLost();
              return {
                success: result.success,
                current_status: result.current_status!
              };
            }}
            onSendReminder={async () => {
              const result = await onSendReminder();
              return {
                success: result.success,
              };
            }}
            onSendOffer={async () => {
              const result = await onSendOffer();
              return {
                success: result.success,
                current_status: result.current_status!
              };
            }}

          />
          
          {/* Documents liés */}
          <DocumentsCard 
            documentUrl={offre.fichier}
            onDocumentUpload={onAddDocument}
          />
        </div>
      </div>
    </div>
  );
};

export default OffreDetails;