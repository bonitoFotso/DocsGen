import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { SearchInput } from "@/components/ui/SearchInput";
import { useOffres } from "@/hooks/useOffres";
import {
  BarChart2Icon,
  DollarSignIcon,
  FileText,
  PlusCircle,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import { OffreTable } from "./offreTable";
import { useNavigate } from "react-router-dom";
import KesContainer from "@/components/KesContainer";
import { Offer, StatsConfig } from "@/components/KDcart/types";
import { KDStats } from "@/components/KDcart/KDstats";

const OffreManagement = () => {
  const {
    offres,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,

    handleViewDetails,
    handleEdit,
    handleDelete,
    isDeleting,

    setError,
  } = useOffres();

  const navigate = useNavigate();
  const data: Offer[] = [];
  const statsConfig: StatsConfig = {
    cards: [
      {
        id: "total-amount",
        title: "Montant Total",
        type: "amount",
        icon: <DollarSignIcon className="h-4 w-4 text-green-400" />,
        calculation: () => 1575,
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
        calculation: () => 500,
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
        calculation: () => 50,
        // calculation: (data) => {
        //   const won = data.filter((item) => item.statut === "GAGNE").length;
        //   return data.length > 0 ? (won / data.length) * 100 : 0;
        // },
        tooltipText: "Pourcentage des offres gagnées",
        colorClass: "bg-white text-black",
      },
      {
        id: "client-distribution",
        title: "Clients",
        type: "distribution",
        calculation: () => 20,
        // calculation: (data) => {
        //   return data.reduce((acc, item) => {
        //     const client = item.client.nom;
        //     acc[client] = (acc[client] || 0) + 1;
        //     return acc;
        //   }, {} as Record<string, number>);
        // },
        icon: <UsersIcon className="h-4 w-4 text-orange-500 " />,
        tooltipText: "Distribution des offres par client",
        colorClass: "bg-white text-black",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Gestion des Offres
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez vos offres commerciales
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/offres/new")}
            className="w-full sm:w-auto bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700
                         transition-all duration-200 transform hover:scale-105 hover:shadow-lg
                         flex items-center justify-center gap-2 group"
          >
            <PlusCircle className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
            Nouvelle Offre
          </button>
        </div>

        {/* Error Alert */}
        {error && <ErrorAlert error={error} onDismiss={() => setError(null)} />}

        <KesContainer variant="transparent" padding="none">
          <KDStats data={data} config={statsConfig} />
        </KesContainer>

        {/* Main Content */}
        <div>
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-6"
          />

          <OffreTable
            offres={offres}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </div>
      </div>
    </div>
  );
};

export default OffreManagement;
