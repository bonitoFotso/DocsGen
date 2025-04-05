import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Composants KD
import KDTable from "@/components/table/KDTable2";
import { KDStats } from "@/components/KDcart/KDstats";

// Composants UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KesContainer from "@/components/KesContainer";

// Visualisations
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Icônes
import {
  Plus,
  Search,
  Filter,
  FilterX,
  BarChart2,
  PieChart as PieChartIcon,
  Calendar as CalendarIcon,
  FileBarChart,
  Loader2,
  FileSpreadsheet,
  RefreshCw
} from "lucide-react";
import React from "react";

/**
 * Composant de tableau de bord réutilisable
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.title - Le titre du tableau de bord
 * @param {Array} props.data - Les données à afficher
 * @param {Object} props.columns - Les colonnes du tableau
 * @param {Object} props.groupByOptions - Options de regroupement
 * @param {Object} props.statsConfig - Configuration des statistiques
 * @param {Object} props.chartData - Données pour les graphiques
 * @param {Object} props.analytics - Données d'analyse
 * @param {boolean} props.loading - État de chargement
 * @param {string} props.error - Message d'erreur éventuel
 * @param {Object} props.filters - Filtres actuels
 * @param {number} props.totalCount - Nombre total d'éléments
 * @param {Function} props.onSearch - Fonction de recherche
 * @param {Function} props.onFilterByStatus - Fonction de filtrage par statut
 * @param {Function} props.onFilterByClient - Fonction de filtrage par client
 * @param {Function} props.onFilterByDateRange - Fonction de filtrage par date
 * @param {Function} props.onResetFilters - Fonction de réinitialisation des filtres
 * @param {Function} props.onExport - Fonction d'exportation
 * @param {Function} props.onCreateNew - Fonction de création
 * @param {Function} props.onRowClick - Fonction au clic sur une ligne
 * @param {Object} props.statusDisplayMap - Mapping des statuts pour l'affichage
 * @param {Function} props.emptyStateRenderer - Fonction de rendu de l'état vide
 * @param {Function} props.linearizeData - Fonction pour linéariser les données (optionnel)
 */
const GenericDashboard = ({
  title,
  data,
  columns,
  groupByOptions,
  statsConfig,
  chartData,
  analytics,
  loading,
  error,
  filters,
  totalCount,
  searchTerm,
  setSearchTerm,
  onSearch,
  onFilterByStatus,
  onFilterByClient,
  onFilterByDateRange,
  onResetFilters,
  onExport,
  onCreateNew,
  onRowClick,
  statusDisplayMap,
  emptyStateRenderer,
  linearizeData = (data: unknown) => data, // Par défaut, ne fait rien
  createButtonLabel = "Nouveau",
  clientsUniques = [], // Pour les filtres
  renderStatusChart,
  renderClientChart,
  renderTimeChart,
  additionalCharts = [],
}: { 
  title: string; 
  data: Array<Record<string, unknown>>; 
  columns: object; 
  groupByOptions: object; 
  statsConfig: object; 
  chartData: object; 
  analytics: object; 
  loading: boolean; 
  error: string; 
  filters: object; 
  totalCount: number; 
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  onSearch: (term: string) => void; 
  onFilterByStatus: (status: string) => void; 
  onFilterByClient: (client: string) => void; 
  onFilterByDateRange: (from: Date | undefined, to: Date | undefined) => void; 
  onResetFilters: () => void; 
  onExport: () => void; 
  onCreateNew: () => void; 
  onRowClick: (row: Record<string, unknown>) => void; 
  statusDisplayMap: Record<string, string>; 
  emptyStateRenderer: () => React.ReactNode; 
  linearizeData?: (data: unknown) => unknown;
  createButtonLabel?: string;
  clientsUniques?: string[];
  renderStatusChart?: () => React.ReactNode;
  renderClientChart?: () => React.ReactNode;
  renderTimeChart?: () => React.ReactNode;
  additionalCharts?: React.ReactNode[];
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<{from?: Date; to?: Date}>({});
  const [activeTab, setActiveTab] = useState('table');

  // Gérer l'application des filtres
  const handleApplyFilters = () => {
    // Appliquer la plage de dates
    onFilterByDateRange(dateRange.from, dateRange.to);
    setShowFilters(false);
  };

  // Afficher les filtres avancés
  const renderAdvancedFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 mt-4 border-t dark:border-gray-700">
      {statusDisplayMap && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Statut</label>
          <Select
            onValueChange={(value) => onFilterByStatus(value)}
            value={filters.status ? filters.status[0] : undefined}
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
      )}

      {clientsUniques.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>
          <Select
            onValueChange={(value) => onFilterByClient(value)}
            value={filters.client as string}
          >
            <SelectTrigger>
              <SelectValue placeholder="Tous les clients" />
            </SelectTrigger>
            <SelectContent>
              {clientsUniques.map((client) => (
                <SelectItem key={client} value={client}>
                  {client}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Période</label>
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

      <div className="flex items-end gap-2 col-span-full">
        <Button
          variant="outline"
          onClick={onResetFilters}
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

  // État vide du tableau
  const defaultEmptyState = (
    <div className="py-12 px-4 text-center">
      <p className="text-muted-foreground">
        Aucun élément trouvé. Essayez de modifier vos filtres ou créez
        un nouvel élément.
      </p>
      <Button variant="outline" className="mt-4" onClick={onResetFilters}>
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
        {Object.keys(filters).filter(k => k !== 'page' && k !== 'page_size').length > 0 && (
          <Badge
            variant="secondary"
            className="ml-1 absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {Object.keys(filters).filter(k => k !== 'page' && k !== 'page_size').length}
          </Badge>
        )}
      </Button>
      {onExport && (
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={onExport}
        >
          <FileSpreadsheet size={16} />
          Exporter
        </Button>
      )}
    </div>
  );

  // Graphiques par défaut si non fournis
  const defaultStatusChart = () => (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Répartition par statut</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        {chartData?.montantsParStatut ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.montantsParStatut}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {chartData.montantsParStatut.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'][index % 5]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value} éléments`, 'Nombre']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Données non disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header avec titre et bouton de création */}
      <KesContainer
        variant="transparent"
        padding="none"
        title={title}
        headerActions={
          onCreateNew && (
            <Button onClick={onCreateNew} className="flex items-center gap-2">
              <Plus size={16} />
              {createButtonLabel}
            </Button>
          )
        }
      >
        {/* Onglets de navigation */}
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="table">
              <FileBarChart className="w-4 h-4 mr-2" />
              Tableau
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="w-4 h-4 mr-2" />
              Analyse
            </TabsTrigger>
            <TabsTrigger value="charts">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Graphiques
            </TabsTrigger>
          </TabsList>

          {/* Contenu des onglets */}
          <TabsContent value="table" className="mt-6">
            {/* Dashboard summary avec KDStats */}
            {statsConfig && (
              <KesContainer variant="transparent" padding="none" className="mb-6">
                <KDStats 
                  data={data} 
                  config={statsConfig} 
                  loading={loading} 
                />
              </KesContainer>
            )}

            {/* Barre de recherche et filtres */}
            <div style={{paddingTop: '10px', padding: "20px 0"}}>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    className="max-w-sm"
                  />
                  <Button variant="outline" size="icon" onClick={onSearch}>
                    <Search size={16} />
                  </Button>
                </div>
                {headerActions}
              </div>

              {/* Filtres avancés */}
              {showFilters && renderAdvancedFilters()}
            </div>

            {/* Message d'erreur */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Tableau KDTable */}
            <KDTable
              data={linearizeData(data)}
              columns={columns}
              groupByOptions={groupByOptions}
              title={`Liste des ${title.toLowerCase()}`}
              onRowClick={onRowClick}
              initialGroupBy="none"
              initialSort={{ key: 'date_creation', direction: 'desc' }}
              searchPlaceholder={`Rechercher...`}
              noGroupText={`Tous les éléments`}
              noResultsText="Aucun élément ne correspond aux critères"
              pagination={{ 
                pageSizes: [10, 25, 50, 100], 
                defaultPageSize: filters.page_size || 10
              }}
              loading={loading}
              headerActions={<p className="text-sm text-muted-foreground">Total: {totalCount} éléments</p>}
              emptyState={data.length === 0 ? (emptyStateRenderer || defaultEmptyState) : undefined}
              className="shadow-sm"
              density="normal"
              alternateRowColors={true}
              bordered={true}
            />
          </TabsContent>

          {/* Onglet d'analyse */}
          <TabsContent value="analytics" className="mt-6">
            {analytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Statistiques globales - à personnaliser avec des props */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Résumé global</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-4">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500">Total</dt>
                          <dd className="text-sm font-semibold">{analytics.totalCount}</dd>
                        </div>
                        {analytics.global?.montantTotal !== undefined && (
                          <div className="flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Montant total</dt>
                            <dd className="text-sm font-semibold">
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0
                              }).format(analytics.global.montantTotal)}
                            </dd>
                          </div>
                        )}
                        {/* Autres statistiques spécifiques peuvent être ajoutées via des props */}
                      </dl>
                    </CardContent>
                  </Card>

                  {/* D'autres cartes d'analyse peuvent être ajoutées via des composants enfants */}
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64">
                <p className="text-muted-foreground">Données d'analyse non disponibles</p>
              </div>
            )}
          </TabsContent>

          {/* Onglet des graphiques */}
          <TabsContent value="charts" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderStatusChart ? renderStatusChart() : defaultStatusChart()}
                {renderClientChart && renderClientChart()}
                {renderTimeChart && renderTimeChart()}
                {additionalCharts.map((chart, index) => (
                  <React.Fragment key={index}>{chart()}</React.Fragment>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </KesContainer>

      {/* Bouton d'actualisation flottant */}
      <Button 
        variant="outline"
        size="icon"
        className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg"
        onClick={() => window.location.reload()}
        title="Actualiser les données"
      >
        <RefreshCw size={20} />
      </Button>
    </div>
  );
};

export default GenericDashboard;