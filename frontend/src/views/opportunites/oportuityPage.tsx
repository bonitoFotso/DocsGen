import { useOpportunites, useOpportuniteStatistics } from "@/hooks/useOpportunite";
import { FileText, MapPin, PlusCircle, Mail, Phone, Calendar, DollarSign, Percent, Tag, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEntityFromUrl } from "@/hooks/useEntityFromUrl";

import KDTable from "@/components/table/KDTable3";
import { LinearizedOpportunity, OpportunityProcessor } from "@/config/OpportunityProcessor";
import { OpportuniteDetail } from "@/types/opportunite.types";
import { useMemo, memo } from "react";
import OpportunitesStatsDashboard from "./OpportunitesStatsDashboard";

// Composant de rendu pour la localisation
const LocationRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow-sm p-3 w-full">
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
        <div className="flex flex-col">
          <div className="font-medium">
            {opp.client_pays}, {opp.client_region}
          </div>
          <div className="text-xs text-gray-500">{opp.client_ville}</div>
        </div>
      </div>
    </div>
  );
});

// Composant de rendu pour les informations client
const ClientRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="flex flex-col">
      <div className="font-medium flex items-center gap-1">
        <Building className="h-4 w-4 text-blue-500" />
        <span>{opp.client_nom}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">{opp.client_secteur_activite}</div>
      <div className="flex items-center gap-2 mt-1 text-xs">
        {opp.client_email && (
          <div className="flex items-center gap-1 text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-32">{opp.client_email}</span>
            
          </div>
        )}
        
      </div>
    </div>
  );
});

// Composant de rendu pour le contact
const ContactRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="flex flex-col">
      <div className="font-medium">
        {opp.contact_prenom} {opp.contact_nom}
      </div>
      <div className="flex flex-col gap-1 mt-1 text-xs">
        {opp.contact_email && (
          <div className="flex items-center gap-1 text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate max-w-32">{opp.contact_email}</span>
          </div>
        )}
        {opp.contact_telephone && (
          <div className="flex items-center gap-1 text-gray-500">
            <Phone className="h-3 w-3" />
            <span>{opp.contact_telephone}</span>
          </div>
        )}
      </div>
    </div>
  );
});

// composant de rendu pour les commantaire
const CommentRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="flex flex-col">
      <div className="text-xs text-gray-500 mt-1">
        {opp.commentaire || 'Aucun commentaire'}
      </div>
    </div>
  );
});


// Composant de rendu pour les informations financières
const FinancialRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1 font-medium">
        <DollarSign className="h-4 w-4 text-green-500" />
        <span>{opp.montant ? opp.montant.toLocaleString() + ' €' : 'N/A'}</span>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
        <span>Estimé:</span>
        <span>{opp.montant_estime ? opp.montant_estime.toLocaleString() + ' €' : 'N/A'}</span>
      </div>
      <div className="flex items-center gap-1 mt-1 text-xs">
        <Percent className="h-3 w-3 text-blue-500" />
        <span className="font-medium">{opp.probabilite}%</span>
        <span className="text-gray-500 ml-1">
          ({opp.valeur_ponderee ? opp.valeur_ponderee.toLocaleString() + ' €' : 'N/A'})
        </span>
      </div>
    </div>
  );
});

// Composant de rendu pour le statut
const StatusRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  // Déterminer la couleur en fonction du statut
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'prospection':
        return 'bg-blue-100 text-blue-800';
      case 'qualification':
        return 'bg-purple-100 text-purple-800';
      case 'proposition':
        return 'bg-amber-100 text-amber-800';
      case 'négociation':
        return 'bg-orange-100 text-orange-800';
      case 'gagnée':
        return 'bg-green-100 text-green-800';
      case 'perdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col">
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(opp.statut)}`}>
        {opp.statut_display || opp.statut}
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
        <Calendar className="h-3 w-3" />
        <span>Créée: {opp.date_creation}</span>
      </div>
      {opp.relance && (
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>relance: {opp.relance}</span>
        </div>
      )}
      {opp.date_cloture && (
        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          <span>Clôture: {opp.date_cloture}</span>
        </div>
      )}
      
    </div>
  );
});

// Composant de rendu pour les produits
const ProductRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="flex flex-col">
      <div className="font-medium flex items-center gap-1">
        <Tag className="h-4 w-4 text-indigo-500" />
        <span>{opp.produit_principal_name || 'N/A'}</span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {opp.produit_principal_category || 'Aucune catégorie'}
      </div>
      {opp.produits_names && (
        <div className="text-xs text-gray-500 mt-1 truncate max-w-48">
          + {opp.produits_names}
        </div>
      )}
    </div>
  );
});

// Composant de rendu pour le responsable
const ResponsibleRenderer = memo(({ opp }: { opp: LinearizedOpportunity }) => {
  return (
    <div className="flex flex-col">
      <div className="font-medium">
        {opp.responsable_nom|| 'Aucun responsable'}
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {opp.responsable_email|| 'Aucun email'}
      </div>
    </div>
  );
});

// Extraction du header en composant séparé
const PageHeader = memo(({ title, onAddNew }: { title: string; onAddNew: () => void }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div className="flex items-center gap-3">
      <div className="p-3 bg-purple-100 rounded-xl">
        <FileText className="h-6 w-6 text-purple-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gérez vos opportunités commerciales
        </p>
      </div>
    </div>
    <button
      onClick={onAddNew}
      className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700
                 transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                 flex items-center justify-center gap-2 group"
    >
      <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
      Nouvelle Opportunité
    </button>
  </div>
));

const OpportunityManagement = () => {
  const navigate = useNavigate();
  const currentEntity = useEntityFromUrl();
  const { opportunites } = useOpportunites();
  const { stats } = useOpportuniteStatistics();

  console.log("Stats:", stats);


  // Mémoisation du filtrage des opportunités
  const filteredOpportunites = useMemo(() =>
    currentEntity === "TOUTES"
      ? opportunites
      : opportunites.filter((opp) => opp.entity_code === currentEntity),
    [opportunites, currentEntity]
  );

  // Mémoisation de la linéarisation des opportunités
  const lineaOpportunities = useMemo(() =>
    OpportunityProcessor.linearizeOpportunities(filteredOpportunites as unknown as OpportuniteDetail[]),
    [filteredOpportunites]
  );

  // Mémoisation des colonnes réduites et optimisées
  const columns = useMemo(() => [
    {
      key: 'client_pays' as keyof LinearizedOpportunity,
      label: 'Localisation',
      render: (opp: LinearizedOpportunity) => <LocationRenderer opp={opp} />,
    },
    { key: 'reference' as keyof LinearizedOpportunity, label: 'Référence' },
    {
      key: 'client_nom' as keyof LinearizedOpportunity,
      label: 'Client',
      render: (opp: LinearizedOpportunity) => <ClientRenderer opp={opp} />,
    },
    {
      key: 'contact_nom' as keyof LinearizedOpportunity,
      label: 'Contact',
      render: (opp: LinearizedOpportunity) => <ContactRenderer opp={opp} />,
    },
    {
      key: 'Responsable' as keyof LinearizedOpportunity,
      label: 'responsable',
      render: (opp: LinearizedOpportunity) => <ResponsibleRenderer opp={opp} />,
    },
    {
      key: 'commentaire' as keyof LinearizedOpportunity,
      label: 'Commentaire',
      render: (opp: LinearizedOpportunity) => <CommentRenderer opp={opp} />,
    },
    {
      key: 'statut' as keyof LinearizedOpportunity,
      label: 'Statut',
      render: (opp: LinearizedOpportunity) => <StatusRenderer opp={opp} />,
    },
    {
      key: 'montant' as keyof LinearizedOpportunity,
      label: 'Finances',
      render: (opp: LinearizedOpportunity) => <FinancialRenderer opp={opp} />,
    },
    {
      key: 'produit_principal_name' as keyof LinearizedOpportunity,
      label: 'Produits',
      render: (opp: LinearizedOpportunity) => <ProductRenderer opp={opp} />,
    },
  ], []);

  // Mémoisation des options de groupement
  const groupingOptions = useMemo(() => [
    { key: 'client_pays' as keyof LinearizedOpportunity, label: 'Grouper par pays' },
    { key: 'client_region' as keyof LinearizedOpportunity, label: 'Grouper par Région' },
    { key: 'client_ville' as keyof LinearizedOpportunity, label: 'Grouper par Ville' },
    { key: 'client_nom' as keyof LinearizedOpportunity, label: 'Grouper par Entreprise' },
    { key: 'client_secteur_activite' as keyof LinearizedOpportunity, label: 'Grouper par Secteur d\'activité' },
    { key: 'contact_nom' as keyof LinearizedOpportunity, label: 'Grouper par Contact' },
    { key: 'statut' as keyof LinearizedOpportunity, label: 'Grouper par Statut' },
    { key: 'produit_principal_category' as keyof LinearizedOpportunity, label: 'Grouper par Departement' },
    { key: 'produit_principal_code' as keyof LinearizedOpportunity, label: 'Grouper par Produit principal' },
  ], []);

  // Mémoisation des clés de recherche
  const searchKeys = useMemo<Array<keyof LinearizedOpportunity>>(() =>
    ['reference', 'statut', 'client_nom', 'contact_nom', 'contact_prenom', 'entity_code', 'entity_name', 'client_pays', 'client_ville', 'client_secteur_activite', 'produit_principal_name'],
    []
  );

  // Titre de la page
  const title = currentEntity === "TOUTES" ?
    "Gestion des Opportunités" :
    `Gestion des Opportunités de ${currentEntity}`;

  // Handler pour la création d'une nouvelle opportunité
  const handleAddNew = () => navigate("/opportunities/new");
  
  // Handler pour le clic sur une ligne
  const handleRowClick = (item: LinearizedOpportunity) => {
    navigate(`/opportunities/${item.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <div className="mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <PageHeader title={title} onAddNew={handleAddNew} />

        {/* Stats Dashboard */}
        {stats && <OpportunitesStatsDashboard data={{
          par_statut: stats.par_statut,
          totaux: stats.totaux
        }} />}

        {/* Separator */}

        {/* Table */}
        <div>
          <KDTable
            data={lineaOpportunities}
            columns={columns}
            groupingOptions={groupingOptions}
            title="Liste des opportunités"
            keyExtractor={(contact) => contact.id}
            searchKeys={searchKeys}
            searchPlaceholder="Rechercher une Opportunité..."
            noGroupingLabel="Aucun groupement"
            noResultsMessage="Aucune Opportunité trouvée"
            onRowClick={handleRowClick}
          />
        </div>
      </div>
    </div>
  );
};

export default OpportunityManagement;