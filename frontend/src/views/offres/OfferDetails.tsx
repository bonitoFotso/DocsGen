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
import NoteDialog from '@/components/dialogue/NoteDialog';

const OffreDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { offreService } = useServices();
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false);
  const [note, setNote] = React.useState<string>('');
  // const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = React.useState(false);
  // const [isSuccessDialogOpen, setIsSuccessDialogOpen] = React.useState(false);
  // const [isErrorDialogOpen, setIsErrorDialogOpen] = React.useState(false);

  // Fonction pour gérer la sauvegarde de la note
  const handleSaveNote = (newNote: string) => {
    setNote(newNote);
    offreService.update_notes(Number(id), newNote);
    setIsNoteDialogOpen(false);
    onReload();
  };

  

  
  // Utiliser notre hook personnalisé pour charger les données
  const { offre, loading, historique, error, fetchOffre } = useOffreDetails({ 
    id: Number(id), 
    offreService 
  });

  const onReload = () => {
    fetchOffre();
  }
  // Vérification de l'ID
  if (!id) {
    return <NotFound onBack={onReload} title="Erreur" subtitle="ID d'offre manquant." />;
  }
  // Vérification de l'ID numérique
  const offreId = Number(id);
  if (isNaN(offreId)) {
    return <NotFound onBack={onReload} title="Erreur" subtitle="ID d'offre invalide." />;
  }
  // Vérification de l'existence de l'offre
  if (!offre) {
    return <NotFound onBack={onReload} title="Erreur" subtitle="Offre non trouvée." />;
  }

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

  const onMarkWon = async (date_validation: string) => {
    try {
      const response = await offreService.markWon(Number(id), date_validation);
      const data = response;
      return { success: data.success, current_status: data.current_status };
    } catch (error) {
      console.error('Erreur lors de la marque de l\'offre comme gagnée', error);
      return { success: false };
    }
  };


  const onMarkLost = async (date_cloture: string) => {
    console.log('Marquer l\'offre comme perdue' + date_cloture);
     try {
       const response = await offreService.markLost(Number(id), date_cloture);
       const data = response;
       return { success: data.success, current_status: data.current_status };
     } catch (error) {
       console.error('Erreur lors de la marque de l\'offre comme perdue', error);
       return { success: false };
     }
  };

  const onSendReminder = async () => {
    try {
      const response = await offreService.sendReminder(Number(id));
      const data = response;
      console.log(data)
      onReload();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la relance', error);
      return { success: false };
    }
  };

  const onSendOffer = async (date_envoi: string) => {
    console.log('Envoi de l\'offre' + date_envoi);
     try {
       const response = await offreService.send(Number(id), date_envoi);

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


          {/* carte des note de l'offre avec bouton pour ouvrir un dialogue et modifier la note*/}
          <div className="bg-white shadow-sm rounded-lg p-4">
            <h2 className="text-lg font-semibold">Notes</h2>
            <p>{offre.notes}</p>
            <button 
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => setIsNoteDialogOpen(true)}
            >
              Modifier
            </button>
          </div>
          
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
            onMarkWon={async (date_validation: string) => {
              const result = await onMarkWon(date_validation);
              return {
                success: result.success,
                current_status: result.current_status!
              };
            }}
            onMarkLost={async (date_cloture: string) => {
              const result = await onMarkLost(date_cloture);
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
            onSendOffer={async (date_envoi: string) => {
              const result = await onSendOffer(date_envoi);
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
      {/* dialogue de modification de note  */}
       <NoteDialog 
        open={isNoteDialogOpen}
        onClose={() => setIsNoteDialogOpen(false)}
        onSave={handleSaveNote}
        note={offre.notes}
      />
      {/* <ConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={() => setIsConfirmationDialogOpen(false)}
        onConfirm={handleDelete}
        message="Êtes-vous sûr de vouloir supprimer cette offre ?"
      /> */}
      {/* <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        message="L'offre a été supprimée avec succès."
      /> */}
    </div>
  );
};

export default OffreDetails;