import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { useOffres } from "@/hooks/useOffres";
import { FileText, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import KesContainer from "@/components/KesContainer";
import { KDStats } from "@/components/KDcart/KDstats";
import { useEntityFromUrl } from "@/hooks/useEntityFromUrl";
import KDTable from "@/components/table/KDTable2";
import { offresConfig } from "@/config/offres.config";
import { OffreDetail } from "@/types/offre";
import { linearizeOffre } from "@/config/offres.line";

const OffreManagement = () => {
  const {
    offres,
    isLoading,
    error,
    setError,
  } = useOffres();

  const navigate = useNavigate();
  const currentEntity = useEntityFromUrl();



    // Filtrage des offres par entité
    const filteredOffres = currentEntity === "TOUTES" 
    ? offres 
    : offres.filter((offre) => offre.entity.code === currentEntity);

  // Configuration from imported config file
  const { columns, groupByOptions, headerActions, emptyState, statsConfig } = offresConfig({
    navigate,
    offres: filteredOffres,
      
  });

  const title = currentEntity === "TOUTES" ? "Gestion des Offres" : `Gestion des Offres de ${currentEntity}`;

const linearizedOffres = linearizeOffre(filteredOffres);

  // Gérer le clic sur une ligne
  const handleRowClick = (row: unknown) => {
    const offre = row as OffreDetail;
    navigate(`/offres/${offre.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <div className="mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {title}
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

        {/* Stats Cards */}
        <KesContainer variant="transparent" padding="none">
          <KDStats data={offres} config={statsConfig} />
        </KesContainer>

        {/* Main Content - Table */}
        <div>
          <KDTable
            data={linearizedOffres}
            columns={columns}
            groupByOptions={groupByOptions}
            title="Liste des offres"
            onRowClick={handleRowClick}
            initialGroupBy="none"
            initialSort={{ key: 'date_creation', direction: 'desc' }}
            searchPlaceholder="Rechercher une offre..."
            noGroupText="Toutes les offres"
            noResultsText="Aucune offre ne correspond aux critères"
            pagination={{ 
              pageSizes: [10, 25, 50, 100], 
              defaultPageSize: 10 
            }}
            loading={isLoading}
            headerActions={headerActions}
            emptyState={filteredOffres.length === 0 ? emptyState : undefined}
            className="shadow-sm"
            density="normal"
            alternateRowColors={true}
            bordered={true}
          />
        </div>
      </div>

    </div>
  );
};

export default OffreManagement;