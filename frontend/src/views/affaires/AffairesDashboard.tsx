import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

// Composant générique
import GenericDashboard from "@/components/dashboard/GenericDashboard";

// Configurations spécifiques aux affaires
import { getAffaireColumns, affaireGroupByOptions, statusDisplayMap } from "@/config/affaire-table.config";
import { getAffaireStatsConfig } from "@/config/affaire-stats.config";
import { linearizeAffaire } from "@/config/affaires.line";
import { useAffairesAnalytics } from "@/hooks/useAffairesAnalytics";
import { useEntityFromUrl } from "@/hooks/useEntityFromUrl";

// Visualisations
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

// Composants UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AffairesDashboard = () => {
  const navigate = useNavigate();
  const currentEntity = useEntityFromUrl();

  const title = currentEntity === "TOUTES" ? "Tableau de bord des Affaires" : `Tableau de bord des Affaires de ${currentEntity}`;

  // Utiliser le hook d'analyse des affaires
  const {
    affaires,
    totalCount,
    loading,
    error,
    filters,
    analytics,
    dashboardData,
    chartData,
    searchTerm,
    setSearchTerm,
    handleSearch,
    resetFilters,
    filterByStatus,
    filterByClient,
    filterByDateRange,
    exportStatistics
  } = useAffairesAnalytics({ page: 1, page_size: 10 });

  // Configurer les colonnes du tableau
  const columns = getAffaireColumns({
    navigate,
    handleViewDetails: (id) => navigate(`/affaires/${id}`),
    handleEdit: (id) => navigate(`/affaires/${id}/edit`)
  });

  // Configurer les statistiques
  const statsConfig = getAffaireStatsConfig(dashboardData);

  // Fonctions de rendu des graphiques spécifiques aux affaires
  const renderStatusChart = () => (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Répartition par statut</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
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
              formatter={(value) => [`${value} affaires`, 'Nombre']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderClientChart = () => (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Affaires par client</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData.distributionParClient}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 70, bottom: 5 }}
          >
            <XAxis type="number" />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={60}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [`${value}`, 'Nombre d\'affaires']}
            />
            <Legend />
            <Bar dataKey="value" name="Nombre d'affaires" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const renderTimeChart = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Évolution par mois</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData.evolutionTemporelle}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="mois" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="count" 
              name="Nombre d'affaires" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="enRetard" 
              name="Affaires en retard" 
              stroke="#ff7300" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Composant pour les affaires en retard - spécifique au dashboard des affaires
  const renderLateAffairesAnalytics = () => (
    <Card className="mt-6 col-span-full">
      <CardHeader>
        <CardTitle>Affaires en retard</CardTitle>
      </CardHeader>
      <CardContent>
        {analytics.affairesEnRetard && analytics.affairesEnRetard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Référence</th>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Date fin prévue</th>
                  <th className="text-right py-3 px-4">Montant</th>
                </tr>
              </thead>
              <tbody>
                {analytics.affairesEnRetard.map(affaire => (
                  <tr 
                    key={affaire.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/affaires/${affaire.id}`)}
                  >
                    <td className="py-3 px-4 font-medium">{affaire.reference}</td>
                    <td className="py-3 px-4">{affaire.client_nom}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-red-100 text-red-800">
                        {affaire.statut_display}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      {affaire.date_fin_prevue ? 
                        format(new Date(affaire.date_fin_prevue), "dd/MM/yyyy") : 
                        "-"
                      }
                    </td>
                    <td className="py-3 px-4 text-right">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      }).format(parseFloat(affaire.montant_total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">
            Aucune affaire en retard. Excellent travail !
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Composants d'analyse supplémentaires spécifiques aux affaires
  const additionalAnalyticsComponents = () => (
    <>
      {/* Statistiques par statut */}
      <Card>
        <CardHeader>
          <CardTitle>Par statut</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.statuts && Object.entries(analytics.statuts).map(([statut, data]) => (
              <div key={statut} className="flex justify-between items-center">
                <div className="flex items-center">
                  <Badge className="mr-2">
                    {statusDisplayMap[statut] || statut}
                  </Badge>
                  <span className="text-sm text-gray-500">{data.count} affaires</span>
                </div>
                <div className="text-sm font-medium">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(data.montantTotal)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.clients && Object.entries(analytics.clients)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 5)
              .map(([client, data]) => (
                <div key={client} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{client}</div>
                    <div className="text-xs text-gray-500">{data.count} affaires</div>
                  </div>
                  <div className="text-sm font-medium">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0
                    }).format(data.montantTotal)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Gérer l'état vide personnalisé pour les affaires
  const emptyStateRenderer = () => (
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

  return (
    <GenericDashboard
      title={title}
      data={affaires}
      columns={columns}
      groupByOptions={affaireGroupByOptions}
      statsConfig={statsConfig}
      chartData={chartData}
      analytics={analytics}
      loading={loading}
      error={error}
      filters={filters}
      totalCount={totalCount}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      onSearch={handleSearch}
      onFilterByStatus={filterByStatus}
      onFilterByClient={filterByClient}
      onFilterByDateRange={filterByDateRange}
      onResetFilters={resetFilters}
      onExport={exportStatistics}
      onCreateNew={() => navigate('/affaires/create')}
      onRowClick={(row) => navigate(`/affaires/${row.id}`)}
      statusDisplayMap={statusDisplayMap}
      emptyStateRenderer={emptyStateRenderer}
      linearizeData={linearizeAffaire}
      createButtonLabel="Nouvelle Affaire"
      clientsUniques={analytics.clientsUniques || []}
      renderStatusChart={renderStatusChart}
      renderClientChart={renderClientChart}
      renderTimeChart={renderTimeChart}
      additionalCharts={[renderLateAffairesAnalytics]}
      additionalAnalyticsComponents={additionalAnalyticsComponents}
    />
  );
};

export default AffairesDashboard;