import {
  BarChart2Icon,
  DollarSignIcon,
  FileText,
  PlusCircle,
  TrendingUpIcon,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  FileSearch,
  Download,
  Filter,
  UsersIcon,
  SendIcon,
  LockKeyhole
} from "lucide-react";
import { StatsConfig } from "@/components/KDcart/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinearizedOffre } from "./offres.line";

interface OffresConfigProps {
  navigate: (path: string) => void;
  offres: unknown[];
}

export const offresConfig = ({
  navigate,
  offres
}: OffresConfigProps) => {
  
  // render pour les notes qui affiche selement 10 premiers caracteres
  const renderNotes = (notes: string | null) => {
    if (!notes) return <span className="text-gray-400">Aucune note</span>;
    return notes.length > 10 ? `${notes.slice(0, 10)}...` : notes;
  };
  // Configuration des colonnes pour KDTable
  const columns = [
    // localisations: PAYS, REGION, VILLE
    {
      key: 'pays',
      label: 'Pays',
      width: '120px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div>
          <div className="font-medium">{row.clientPays}</div>
          <div className="text-xs text-gray-500">{row.clientRegion}</div>
          <div className="text-xs text-gray-500">{row.clientVille}</div>
        </div>
      )
    },
    { 
      key: 'reference', 
      label: 'Référence',
      width: '200px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div className="font-medium">{row.reference}</div>
      )
    },

    { 
      key: 'statut', 
      label: 'Statut',
      width: '120px',
      align: 'center',
      render: (_value: unknown, row: LinearizedOffre) => {
        const statusConfig = {
          BROUILLON: { 
            bg: 'bg-yellow-100', 
            text: 'text-yellow-800', 
            label: 'Brouillon',
            icon: <Clock className="w-4 h-4 mr-1" />
          },
          GAGNE: { 
            bg: 'bg-green-100', 
            text: 'text-green-800', 
            label: 'Gagné',
            icon: <CheckCircle className="w-4 h-4 mr-1" />
          },
          PERDU: { 
            bg: 'bg-red-100', 
            text: 'text-red-800', 
            label: 'Perdu',
            icon: <XCircle className="w-4 h-4 mr-1" />
          }
        };
        
        const config = statusConfig[row.statut as keyof typeof statusConfig] || { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800', 
          label: row.statut || 'Inconnu',
          icon: null
        };
        
        return (
          <Badge variant="outline" className={`${config.bg} ${config.text} px-2 py-1 flex items-center`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      }
    },
    
    // date_creation et date de relance
    {
      key: 'date_creation',
      label: 'Date',
      width: '120px',
      render: (_value: unknown, row: LinearizedOffre) => {
        
        return (
          <div className="flex flex-col space-y-2 py-1">
            {/* Main creation date */}
            <div className="flex items-center text-sm font-medium">
              <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
              <span className="text-gray-800">{row.dateCreation}</span>
            </div>
            
            {/* Group secondary dates with consistent styling */}
            {(row.dateRelance || row.date_envoi || row.date_validation || row.date_cloture) && (
              <div className="flex flex-col space-y-1.5 pl-1.5 border-l-2 border-gray-200">
                {row.dateRelance && (
                  <div className="flex items-center text-xs">
                    <Clock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                    <span className="text-gray-600">Relance: {row.dateRelance}</span>
                  </div>
                )}
                
                {row.date_envoi && (
                  <div className="flex items-center text-xs">
                    <SendIcon className="w-3.5 h-3.5 mr-1 text-green-500" />
                    <span className="text-gray-600">Envoi: {row.date_envoi}</span>
                  </div>
                )}
                
                {row.date_validation && (
                  <div className="flex items-center text-xs">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-indigo-500" />
                    <span className="text-gray-600">Validation: {row.date_validation}</span>
                  </div>
                )}
                
                {row.date_cloture && (
                  <div className="flex items-center text-xs">
                    <LockKeyhole className="w-3.5 h-3.5 mr-1 text-gray-500" />
                    <span className="text-gray-600">Clôture: {row.date_cloture}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'userNom',
      label: 'Responsable',
      width: '120px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div>
          <div className="font-medium">{row.userNom}</div>
          <div className="text-xs text-gray-500">{row.userEmail}</div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Client',
      width: '160px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div>
          <div className="font-medium">{row.clientNom}</div>
          <div className="text-xs text-gray-500">{row.clientSecteur}</div>
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      width: '160px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div>
          <div>{row.contactNom}</div>
          <div className="text-xs text-blue-600">{row.contactEmail}</div>
        </div>
      )
    },
    {
      key: 'produit_principal',
      label: 'Produit',
      width: '160px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div>
          <div className="font-medium">{row.produitPrincipalName}</div>
          <div className="text-xs text-gray-500">
            <Badge variant="secondary" className="text-xs">
              {row.produitPrincipalCategory}
            </Badge>
          </div>
        </div>
      )
    },
    {
      key: 'montant',
      label: 'Montant',
      width: '120px',
      align: 'right',
      render: (_value: unknown, row: LinearizedOffre) => {
        const amount = row.montant ? parseFloat(row.montant.toString()) : 0;
        
        return (
          <div className="font-medium">
            {new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'XAF',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            }).format(amount)}
          </div>
        );
      }
    },
    {
      key: 'notes',
      label: 'Notes',
      width: '120px',
      render: (_value: unknown, row: LinearizedOffre) => (
        <div className="text-gray-500">{renderNotes(row.notes)}</div>
      )
    },
    {
      key: 'fichier',
      label: 'Fichier',
      width: '60px',
      align: 'center',
      render: (_value: unknown, row: LinearizedOffre) => {
        return row.fichier ? (
          <a 
            href={row.fichier} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            <FileText className="w-5 h-5 mx-auto" />
          </a>
        ) : (
          <span className="text-gray-400">
            <FileSearch className="w-5 h-5 mx-auto" />
          </span>
        );
      }
    },
    
  ];

  // Options de groupement
  const groupByOptions = [
    { key: 'clientPays', label: 'Par Pays' },
    { key: 'clientRegion', label: 'Par Région' },
    { key: 'clientVille', label: 'Par Ville' },
    { key: 'statut', label: 'Par Statut' },
    { key: 'entityCode', label: 'Par Entité' },
    { key: 'clientNom', label: 'Par Client' },
    { key: 'contactNom', label: 'Par Contact' },
    { key: 'userNom', label: 'Par responsable' },
    { key: 'produitPrincipalCategory', label: 'Par Departement' },
    { key: 'produitPrincipalName', label: 'Par Produit' },
    
  ];

  // Actions d'en-tête
  const headerActions = (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="h-9 gap-1">
        <Filter size={16} />
        Filtres
      </Button>
      <Button variant="outline" size="sm" className="h-9 gap-1">
        <Download size={16} />
        Exporter
      </Button>
    </div>
  );

  // État vide personnalisé
  const emptyState = (
    <div className="text-center p-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <FileText className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Aucune offre trouvée</h3>
      <p className="text-gray-500 mb-4">Créez votre première offre pour commencer à suivre vos opportunités commerciales</p>
      <Button onClick={() => navigate("/offres/new")}>
        <PlusCircle size={16} className="mr-2" />
        Créer une offre
      </Button>
    </div>
  );

  // Configuration des cartes statistiques
  const statsConfig: StatsConfig = {
    cards: [
      {
        id: "total-amount",
        title: "Montant Total",
        type: "amount",
        icon: <DollarSignIcon className="h-4 w-4 text-green-400" />,
        calculation: () => {
          const total = offres.reduce((sum, offre) => sum + parseFloat(String(offre.montant || '0')), 0);
          return total;
        },
        prefix: "XAF ",
        tooltipText: "Montant total de toutes les offres",
        colorClass: "bg-white text-black",
        trend: {
          type: "up",
          value: 12.5,
          period: "ce mois",
        },
      },
      {
        id: "won-amount",
        title: "Montant Gagné",
        type: "amount",
        calculation: () => {
          const total = offres
            .filter(offre => offre.statut === "GAGNE")
            .reduce((sum, offre) => sum + parseFloat(String(offre.montant || '0')), 0);
          return total;
        },
        icon: <TrendingUpIcon className="h-4 w-4 text-blue-400" />,
        prefix: "XAF ",
        filter: (item) => item.statut === "GAGNE",
        tooltipText: "Montant total des offres gagnées",
        colorClass: "bg-white text-black",
        trend: {
          type: "up",
          value: 4.5,
          period: "ce mois",
        },
      },
      {
        id: "success-rate",
        title: "Taux de Réussite",
        type: "percentage",
        icon: <BarChart2Icon className="h-4 w-4 text-purple-500" />,
        suffix: "%",
        calculation: () => {
          const won = offres.filter(item => item.statut === "GAGNE").length;
          return offres.length > 0 ? Math.round((won / offres.length) * 100) : 0;
        },
        tooltipText: "Pourcentage des offres gagnées",
        colorClass: "bg-white text-black",
      },
      {
        id: "client-distribution",
        title: "Clients",
        type: "distribution",
        calculation: () => {
          // Nombre de clients uniques
          const uniqueClients = new Set(offres.map(item => item.client.id)).size;
          return uniqueClients;
        },
        icon: <UsersIcon className="h-4 w-4 text-orange-500" />,
        tooltipText: "Distribution des offres par client",
        colorClass: "bg-white text-black",
      },
    ],
  };

  return {
    columns,
    groupByOptions,
    headerActions,
    emptyState,
    statsConfig
  };
};