import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAffaires, useExportCsv, useDashboard } from "@/hooks/affaire-hooks";
import { IAffaireFilters } from "@/services/AffaireService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

// Icons
import {
  Search,
  Filter,
  FileSpreadsheet,
  Plus,
  Eye,
  Edit,
  Calendar as CalendarIcon,
  FilterX,
} from "lucide-react";
import KesContainer from "@/components/KesContainer";
import { cn } from "@/lib/utils";

// Types des statuts pour un affichage cohérent
const statusDisplayMap: Record<string, string> = {
  BROUILLON: "Brouillon",
  VALIDE: "Validée",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  TERMINEE: "Terminée",
  ANNULEE: "Annulée",
};

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

  // Gérer le changement de page
  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  // Gérer l'export CSV
  const handleExportCsv = () => {
    exportCsv(filters);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setTempFilters({});
    setDateRange({});
  };

  const renderPagination = () => {
    const currentPage = filters.page || 1;
    const pageSize = 10;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() =>
                currentPage > 1 && handlePageChange(currentPage - 1)
              }
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;

            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  isActive={currentPage === pageNum}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}

          {totalPages > 5 && currentPage < totalPages - 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages && handlePageChange(currentPage + 1)
              }
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // Formatage des montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const activeFiltersCount = Object.keys(filters).filter(
    (key) =>
      key !== "page" &&
      key !== "page_size" &&
      filters[key as keyof IAffaireFilters]
  ).length;

  const columns = autoGenerateColumns<IAffaire>(
    affaires.length > 0 ? affaires[0] : affaireExample,
    {
      onView: (id: string | number) => handleViewDetails(Number(id)),
      onEdit: (id: string | number, e: React.MouseEvent) => handleEdit(Number(id), e),
    }
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
        {/* Dashboard summary */}
        <KesContainer variant="transparent" padding="none">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {!loadingDashboard && dashboardData ? (
              <>
                {dashboardData.compteurs_statut.map(
                  (item: { statut: string; count: number }) => (
                    <Card
                      key={item.statut}
                      className="transition-colors dark:border-gray-700 dark:bg-gray-800"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {statusDisplayMap[item.statut] || item.statut}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{item.count}</p>
                      </CardContent>
                    </Card>
                  )
                )}
                <Card className="transition-colors dark:border-gray-700 dark:bg-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Montant
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">
                      {formatCurrency(
                        dashboardData.resume_financier.montant_total
                      )}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card
                    key={i}
                    className="transition-colors dark:border-gray-700 dark:bg-gray-800"
                  >
                    <CardHeader className="pb-2">
                      <Skeleton className="h-4 w-[100px]" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-[60px]" />
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </KesContainer>

        {/* Search and filters */}
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
                onClick={handleExportCsv}
                disabled={exporting}
              >
                <FileSpreadsheet size={16} />
                {exporting ? "Export..." : "Exporter CSV"}
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
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
          )}
        </div>

        {/* Error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Table results */}
        <KesContainer variant="default" size="full" padding="none">
          {loading && !affaires.length ? (
            <div className="py-12 flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="text-sm text-muted-foreground">Chargement...</p>
              </div>
            </div>
          ) : affaires.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="text-muted-foreground">
                Aucune affaire trouvée. Essayez de modifier vos filtres ou créez
                une nouvelle affaire.
              </p>
              <Button variant="outline" className="mt-4" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          ) : (
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Référence</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date début</TableHead>
                    <TableHead>Date fin prévue</TableHead>
                    <TableHead>Montant Total</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affaires.map((affaire) => (
                    <TableRow
                      key={affaire.id}
                      className={cn(
                        "cursor-pointer transition-colors",
                        affaire.en_retard
                          ? "bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30"
                          : ""
                      )}
                      onClick={() => handleViewDetails(affaire.id)}
                    >
                      <TableCell className="font-medium">
                        {affaire.reference}
                      </TableCell>
                      <TableCell>{affaire.client_nom}</TableCell>
                      <TableCell>
                        <Badge>{affaire.statut_display}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(affaire.date_debut), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        {affaire.date_fin_prevue
                          ? format(
                              new Date(affaire.date_fin_prevue),
                              "dd/MM/yyyy"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(affaire.montant_total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={affaire.progression}
                            className={cn(
                              "h-2 w-20",
                              affaire.progression >= 100
                                ? "bg-green-200 dark:bg-green-950"
                                : "",
                              affaire.en_retard
                                ? "bg-red-200 dark:bg-red-950"
                                : ""
                            )}
                          />
                          <span className="text-xs">
                            {affaire.progression}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails(affaire.id);
                                  }}
                                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <Eye size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Voir les détails</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => handleEdit(affaire.id, e)}
                                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                  <Edit size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Modifier</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {totalCount > 0 && (
            <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
              <div className="text-sm text-muted-foreground">
                Total: {totalCount} affaires
              </div>
              {renderPagination()}
            </div>
          )}
        </KesContainer>
      </KesContainer>
    </div>
  );
};

export default AffaireListPage;
