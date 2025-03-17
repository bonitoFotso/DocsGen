import React from 'react';
import { KesContainer } from '@/components/KesContainer';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Filter } from 'lucide-react';

// Exemple d'une page simple
export const SimplePage: React.FC = () => {
  return (
    <KesContainer 
      title="Liste des clients" 
      description="Consultez et gérez tous vos clients"
    >
      <div className="grid gap-4">
        {/* Contenu de votre page ici */}
        <p>Le contenu de la page s'affiche ici...</p>
      </div>
    </KesContainer>
  );
};

// Exemple d'une page avec des actions dans l'en-tête
export const PageWithActions: React.FC = () => {
  return (
    <KesContainer 
      title="Liste des offres" 
      description="Gérez les offres commerciales de votre entreprise"
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle offre
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Liste des offres ici */}
        <p>Contenu de la page des offres...</p>
      </div>
    </KesContainer>
  );
};

// Exemple d'une page de formulaire avec taille réduite
export const FormPage: React.FC = () => {
  return (
    <KesContainer 
      title="Ajouter un client" 
      variant="card"
      size="md"
      padding="lg"
    >
      <form className="space-y-4">
        {/* Champs de formulaire ici */}
        <div className="grid gap-4">
          <p>Contenu du formulaire...</p>
        </div>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline">Annuler</Button>
          <Button>Enregistrer</Button>
        </div>
      </form>
    </KesContainer>
  );
};

// Exemple d'une page avec plusieurs conteneurs
export const Dashboardss: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Première section - Statistiques */}
      <KesContainer 
        variant="transparent"
        padding="none"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KesContainer 
            variant="card" 
            size="full" 
            padding="sm" 
            title="Clients"
          >
            <p className="text-3xl font-bold">128</p>
          </KesContainer>
          
          <KesContainer 
            variant="card" 
            size="full" 
            padding="sm" 
            title="Opportunités"
          >
            <p className="text-3xl font-bold">32</p>
          </KesContainer>
          
          <KesContainer 
            variant="card" 
            size="full" 
            padding="sm" 
            title="Revenus"
          >
            <p className="text-3xl font-bold">25.4M XAF</p>
          </KesContainer>
        </div>
      </KesContainer>
      
      {/* Deuxième section - Graphique */}
      <KesContainer 
        title="Performance mensuelle" 
        size="full"
      >
        <div className="h-80">
          {/* Graphique ici */}
          <p>Graphique d'analyse...</p>
        </div>
      </KesContainer>
      
      {/* Troisième section - Activités récentes */}
      <KesContainer 
        title="Activités récentes" 
        variant="card"
      >
        <div className="space-y-4">
          {/* Liste d'activités ici */}
          <p>Liste des activités récentes...</p>
        </div>
      </KesContainer>
    </div>
  );
};

// Exemple d'utilisation page avec contenu centré
export const CenteredContent: React.FC = () => {
  return (
    <KesContainer
      title="Rapports générés"
      size="md"
      centerContent
      variant="card"
    >
      <div className="text-center p-8">
        <p className="mb-4">Tous les rapports ont été générés avec succès</p>
        <Button>Télécharger tous les rapports</Button>
      </div>
    </KesContainer>
  );
};