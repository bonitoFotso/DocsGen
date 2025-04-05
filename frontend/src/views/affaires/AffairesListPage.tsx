import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAffaires, useExportCsv, useDashboard } from "@/hooks/affaire-hooks";
import { IAffaireFilters } from "@/services/AffaireService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Composants KD
import KDTable from "@/components/table/KDTable2";
import { KDStats } from "@/components/KDcart/KDstats";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Icônes
import {
  Search,
  Filter,
  FileSpreadsheet,
  Plus,
  Calendar as CalendarIcon,
  FilterX,
} from "lucide-react";

// Conteneur personnalisé
import KesContainer from "@/components/KesContainer";

// Configurations
import { 
  getAffaireColumns, 
  affaireGroupByOptions, 
  statusDisplayMap 
} from "@/config/affaire-table.config";
import { getAffaireStatsConfig, baseAffaireStatsConfig } from "@/config/affaire-stats.config";
import { IDashboardData } from "@/types/affaire";

const AffaireListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<IAffaireFilters>({});
  const [dateRange, setDateRange] = useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Initialisation des hooks
  const { affaires, totalCount, loading, error, filters, updateFilters } =
    useAffaires({ page: 1, page_size: 10 });

  const { exportCsv, loading: exporting } = useExportCsv();
  const { dashboardData, loading: loadingDashboard } = useDashboard();

  // Calcul du nombre de filtres actifs
  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      key !== "page" &&
      key !== "page_size" &&
      filters[key as keyof IAffaireFilters]
  ).length;

  // Gérer la navigation vers la page de détails
  const handleViewDetails = (id: number) => {
    navigate(`/affaires/${id}`);
  };

  // Gérer la navigation vers la page d'édition
  const handleEdit = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/affaires/${id}/edit`);
  };

  // Gérer la navigation vers la page de création
  const handleCreate = () => {
    navigate("/affaires/create");
  };

  // Gérer l'application des filtres
  const handleApplyFilters = () => {
    const newFilters = { ...tempFilters };

    // Traitement des dates
    if (dateRange.from) {
      newFilters.date_debut_min = format(dateRange.from, "yyyy-MM-dd");
    }
    if (dateRange.to) {
      newFilters.date_debut_max = format(dateRange.to, "yyyy-MM-dd");
    }

    updateFilters({ ...newFilters, page: 1 });
    setShowFilters(false);
  };

  // Gérer la recherche
  const handleSearch = () => {
    updateFilters({ search: searchTerm, page: 1 });
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setTempFilters({});
    setDateRange({});
    updateFilters({ page: 1, page_size: filters.page_size });
  };

  // Récupérer les colonnes configurées
  const columns = getAffaireColumns({ 
    navigate, 
    handleViewDetails, 
    handleEdit 
  });

  // Récupérer la configuration des statistiques
  const statsConfig = loadingDashboard 
    ? baseAffaireStatsConfig 
    : getAffaireStatsConfig(dashboardData as IDashboardData | null);

  // Filtre avancé panel
  const renderAdvancedFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t dark:border-gray-700">
      <div className="space-y-2">
        <label className="text-sm font-medium">Statut</label>
        <Select
          onValueChange={(value) =>
            setTempFilters((prev) => ({ ...prev, statut: [value] }))
          }
          value={tempFilters.statut?.[0]}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusDisplayMap).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Client</label>
        <Input
          placeholder="Nom du client"
          value={tempFilters.client || ""}
          onChange={(e) =>
            setTempFilters((prev) => ({
              ...prev,
              client: e.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Période de début</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                "Sélectionner une période"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Montant min (€)</label>
        <Input
          type="number"
          placeholder="Min"
          value={tempFilters.montant_min || ""}
          onChange={(e) =>
            setTempFilters((prev) => ({
              ...prev,
              montant_min: e.target.value
                ? Number(e.target.value)
                : undefined,
            }))
          }
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Montant max (€)</label>
        <Input
          type="number"
          placeholder="Max"
          value={tempFilters.montant_max || ""}
          onChange={(e) =>
            setTempFilters((prev) => ({
              ...prev,
              montant_max: e.target.value
                ? Number(e.target.value)
                : undefined,
            }))
          }
        />
      </div>

      <div className="flex items-end gap-2">
        <Button
          variant="outline"
          onClick={resetFilters}
          className="flex items-center gap-1"
        >
          <FilterX size={16} />
          Réinitialiser
        </Button>
        <Button onClick={handleApplyFilters} className="flex-1">
          Appliquer
        </Button>
      </div>
    </div>
  );

  // État vide personnalisé
  const emptyState = (
    <div className="py-12 px-4 text-center">
      <p className="text-muted-foreground">
        Aucune affaire trouvée. Essayez de modifier vos filtres ou créez
        une nouvelle affaire.
      </p>
      <Button variant="outline" className="mt-4" onClick={resetFilters}>
        Réinitialiser les filtres
      </Button>
    </div>
  );

  // Actions en entête du tableau
  const headerActions = (
    <div className="flex gap-2">
      <Button
        variant={showFilters ? "default" : "outline"}
        className="flex items-center gap-2 relative"
        onClick={() => setShowFilters(!showFilters)}
      >
        <Filter size={16} />
        Filtres
        {activeFiltersCount > 0 && (
          <Badge
            variant="secondary"
            className="ml-1 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => exportCsv(filters)}
        disabled={exporting}
      >
        <FileSpreadsheet size={16} />
        {exporting ? "Export..." : "Exporter CSV"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header avec titre et bouton de création */}
      <KesContainer
        variant="transparent"
        padding="none"
        title="Gestion des Affaires"
        headerActions={
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={16} />
            Nouvelle Affaire
          </Button>
        }
      >
        {/* Dashboard summary avec KDStats */}
        <KesContainer variant="transparent" padding="none">
          <KDStats data={affaires} config={statsConfig} loading={loadingDashboard} />
        </KesContainer>

        {/* Search bar and filters */}
        <div style={{paddingTop: '10px', padding: "20px 0"}}>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Input
                placeholder="Rechercher par référence, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="max-w-sm"
              />
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Search size={16} />
              </Button>
            </div>
            {headerActions}
          </div>

          {/* Advanced filters */}
          {showFilters && renderAdvancedFilters()}
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* KDTable pour afficher les données */}
        <KDTable
          data={affaires}
          columns={columns}
          groupByOptions={affaireGroupByOptions}
          title="Liste des affaires"
          onRowClick={(row) => handleViewDetails(row.id)}
          initialGroupBy="none"
          initialSort={{ key: 'date_creation', direction: 'desc' }}
          searchPlaceholder="Rechercher une affaire..."
          noGroupText="Toutes les affaires"
          noResultsText="Aucune affaire ne correspond aux critères"
          pagination={{ 
            pageSizes: [10, 25, 50, 100], 
            defaultPageSize: filters.page_size || 10
          }}
          loading={loading}
          headerActions={<p className="text-sm text-muted-foreground">Total: {totalCount} affaires</p>}
          emptyState={affaires.length === 0 ? emptyState : undefined}
          className="shadow-sm"
          density="normal"
          alternateRowColors={true}
          bordered={true}
        />
      </KesContainer>
    </div>
  );
};

export default AffaireListPage;