import { KesContainer } from "@/components/KesContainer";
import { Badge } from "@/components/ui/badge";
import KDTable from '@/components/table/KDTable';
import { autoGenerateColumns } from '@/components/table/generateColumns';
import { FileText } from 'lucide-react';



import React from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, Shield, CheckCircle2, XCircle } from "lucide-react";
import { KdTable } from '@/components/table/KDTable2';
import UserManagement from '@/components/table/t2';
import ShadcnTable from '@/components/table/t2';
import KDTableAdvancedExample from '@/components/table/t3';

// Type pour nos données
type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  status: "active" | "inactive";
  lastLogin: string;
};

// Fonction pour formater les dates
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};


// Définition des types pour les données
interface Affaire {
  id: number;
  reference: string;
  client_nom: string;
  statut: string;
  statut_display: string;
  date_debut: string;
  date_fin_prevue: string | null;
  montant_total: number;
  progression: number;
  en_retard: boolean;
}



function AffairesTable() {
  // Exemple de données
  const affaires: Affaire[] = [
    {
      id: 1,
      reference: "AFF-2023-001",
      client_nom: "Entreprise ABC",
      statut: "en_cours",
      statut_display: "En cours",
      date_debut: "2023-06-15",
      date_fin_prevue: "2023-09-30",
      montant_total: 15000,
      progression: 75,
      en_retard: false,
    },
    {
      id: 2,
      reference: "AFF-2023-002",
      client_nom: "Société XYZ",
      statut: "terminee",
      statut_display: "Terminée",
      date_debut: "2023-05-01",
      date_fin_prevue: "2023-07-15",
      montant_total: 8500,
      progression: 100,
      en_retard: false,
    },
    {
      id: 3,
      reference: "AFF-2023-003",
      client_nom: "Client DEF",
      statut: "en_cours",
      statut_display: "En cours",
      date_debut: "2023-07-10",
      date_fin_prevue: "2023-10-20",
      montant_total: 22000,
      progression: 30,
      en_retard: true,
    },
  ];

  // Fonctions de gestion des actions
  const handleViewDetails = (id: number): void => {
    console.log(`Voir les détails de l'affaire ${id}`);
  };

  const handleEdit = (id: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    console.log(`Modifier l'affaire ${id}`);
  };

  // IMPORTANT : Nous passons un objet exemple pour que la fonction puisse extraire les clés au runtime
  const columns = autoGenerateColumns<Affaire>(
    // Utiliser le premier élément du tableau comme exemple
    affaires[0],
    {
      onView: (id: string | number) => handleViewDetails(Number(id)),
      onEdit: (id: string | number, e: React.MouseEvent) =>
        handleEdit(Number(id), e),
      // Personnalisation de colonnes spécifiques
      columnOverrides: {
        reference: {
          cellClassName: "font-medium",
        },
        statut_display: {
          sortFn: (a, b) => a.statut.localeCompare(b.statut),
        },
      },
    }
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des Affaires</h1>

      <KDTable<Affaire>
        data={affaires}
        columns={columns}
        keyField="id"
        onRowClick={(row) => handleViewDetails(row.id)}
        rowClassName={(row) =>
          row.en_retard
            ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
            : ""
        }
      />
    </div>
  );
}

// Interface et exemple pour les clients
interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

function ClientsTable() {
  // Exemple de données clients
  const clients: Client[] = [
    {
      id: 1,
      nom: "Entreprise ABC",
      email: "contact@abc.fr",
      telephone: "01 23 45 67 89",
      adresse: "123 Avenue Principale, 75001 Paris",
    },
    {
      id: 2,
      nom: "Société XYZ",
      email: "info@xyz.fr",
      telephone: "01 98 76 54 32",
      adresse: "456 Rue du Commerce, 69002 Lyon",
    },
  ];

  // Fonctions de gestion
  const handleViewClient = (id: number): void => {
    console.log(`Voir les détails du client ${id}`);
  };

  const handleEditClient = (id: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    console.log(`Modifier le client ${id}`);
  };

  const handleDeleteClient = (id: number, e: React.MouseEvent): void => {
    e.stopPropagation();
    console.log(`Supprimer le client ${id}`);
  };

  // Génération automatique des colonnes en passant un exemple
  const columns = autoGenerateColumns<Client>(clients[0], {
    onView: (id: string | number) => handleViewClient(Number(id)),
    onEdit: (id: string | number, e: React.MouseEvent) =>
      handleEditClient(Number(id), e),
    onDelete: (id: string | number, e: React.MouseEvent) =>
      handleDeleteClient(Number(id), e),
    // Exclure certaines colonnes
    excludeColumns: [],
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des Clients</h1>

      <KDTable<Client>
        data={clients}
        columns={columns}
        keyField="id"
        onRowClick={(row) => handleViewClient(row.id)}
      />
    </div>
  );
}

// Interface et exemple pour les rapports
interface Rapport {
  id: number;
  reference: string;
  site_nom: string;
  produit_nom: string;
  statut: string;
  date_creation: string;
  affaire_reference: string;
}

function RapportsTable() {
  // Exemple de données rapports
  const rapports: Rapport[] = [
    {
      id: 1,
      reference: "RAP-2023-001",
      site_nom: "Site Principal Paris",
      produit_nom: "Produit A",
      statut: "Validé",
      date_creation: "2023-07-15",
      affaire_reference: "AFF-2023-001",
    },
    {
      id: 2,
      reference: "RAP-2023-002",
      site_nom: "Site Lyon",
      produit_nom: "Produit B",
      statut: "En attente",
      date_creation: "2023-08-10",
      affaire_reference: "AFF-2023-002",
    },
  ];

  // Fonctions
  const handleViewRapport = (id: number): void => {
    console.log(`Voir le rapport ${id}`);
  };

  const handleDownloadPDF = (row: Rapport, e: React.MouseEvent): void => {
    e.stopPropagation();
    console.log(`Télécharger le PDF du rapport ${row.reference}`);
  };

  // Génération avec des actions personnalisées
  const columns = autoGenerateColumns<Rapport>(rapports[0], {
    onView: (id: string | number) => handleViewRapport(Number(id)),
    // Actions personnalisées
    customActions: [
      {
        icon: <FileText size={16} />,
        tooltip: "Télécharger le PDF",
        onClick: handleDownloadPDF,
      },
    ],
    // Surcharges personnalisées
    columnOverrides: {
      statut: {
        render: (row) => {
          let bgColor;
          switch (row.statut.toLowerCase()) {
            case "validé":
              bgColor =
                "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100";
              break;
            case "en attente":
              bgColor =
                "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100";
              break;
            default:
              bgColor = "";
          }
          return <Badge className={bgColor}>{row.statut}</Badge>;
        },
      },
    },
  });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Liste des Rapports</h1>

      <KDTable<Rapport>
        data={rapports}
        columns={columns}
        keyField="id"
        onRowClick={(row) => handleViewRapport(row.id)}
      />
    </div>
  );
}

// Page complète avec les différents tableaux
export const TablesDemoPage: React.FC = () => {
  return (
    <KesContainer
      title="Tableaux auto-générés"
      description="Démonstration des tableaux avec génération automatique de colonnes"
    >
      <div className="grid gap-8">
        <KDTableAdvancedExample/>
        <AffairesTable />
        <ClientsTable />
        <RapportsTable />
      </div>
    </KesContainer>
  );
};

export default TablesDemoPage;
