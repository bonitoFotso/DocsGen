import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

// Composant générique
import GenericDashboard from "@/components/dashboard/GenericDashboard";

// Hooks et services

// Composants UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

// Icônes
import {
  CircleDashed,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import useProformasAnalytics from "@/hooks/useProformasAnalytics";
import { getProformaStatsConfig } from "@/config/proformas-stats.config";

// Mapping des statuts pour l'affichage
const statusDisplayMap = {
  "BROUILLON": "Brouillon",
  "EN_COURS": "En cours",
  "VALIDE": "Validé",
  "REFUSE": "Refusé",
  "EXPIRE": "Expiré",
  "ANNULE": "Annulé"
};

// Obtenir un badge coloré en fonction du statut
const getStatusBadge = (status) => {
  switch (status) {
    case 'BROUILLON':
      return <Badge variant="outline" className="bg-gray-100">
        <CircleDashed className="mr-1 h-3 w-3" /> Brouillon
      </Badge>;
    case 'EN_COURS':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">
        <Clock className="mr-1 h-3 w-3" /> En cours
      </Badge>;
    case 'VALIDE':
      return <Badge variant="outline" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" /> Validé
      </Badge>;
    case 'REFUSE':
      return <Badge variant="outline" className="bg-red-100 text-red-800">
        <XCircle className="mr-1 h-3 w-3" /> Refusé
      </Badge>;
    case 'EXPIRE':
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">
        <Clock className="mr-1 h-3 w-3" /> Expiré
      </Badge>;
    case 'ANNULE':
      return <Badge variant="outline" className="bg-gray-100 text-gray-800">
        <XCircle className="mr-1 h-3 w-3" /> Annulé
      </Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

// Formater une devise
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XAF',
    maximumFractionDigits: 0
  }).format(amount);
};

const ProformasDashboard = () => {
  const navigate = useNavigate();

  // Utiliser le hook d'analyse des proformas
  const {
    proformas,
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
    
  } = useProformasAnalytics({ page: 1, page_size: 10 });

  // Configurer les colonnes du tableau
  const columns = [
    {
      key: 'reference',
      header: 'Référence',
      cell: (row) => <span className="font-medium">{row.reference}</span>,
      sortable: true
    },
    {
      key: 'client_nom',
      header: 'Client',
      cell: (row) => <span>{row.client_nom}</span>,
      sortable: true
    },
    {
      key: 'entity_code',
      header: 'Entité',
      cell: (row) => <span>{row.entity_code}</span>,
      sortable: true
    },
    {
      key: 'date_creation',
      header: 'Date création',
      cell: (row) => <span>{format(new Date(row.date_creation), "dd/MM/yyyy")}</span>,
      sortable: true
    },
    {
      key: 'statut',
      header: 'Statut',
      cell: (row) => getStatusBadge(row.statut),
      sortable: true
    },
    {
      key: 'montant_ttc',
      header: 'Montant TTC',
      cell: (row) => <span className="font-medium">{formatCurrency(row.montant_ttc)}</span>,
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (row) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/proformas/${row.id}`);
          }}
        >
          Détails
        </Button>
      )
    }
  ];

  // Options de regroupement
  const groupByOptions = [
    { value: 'none', label: 'Pas de regroupement' },
    { value: 'statut', label: 'Par statut' },
    { value: 'client_nom', label: 'Par client' },
    { value: 'entity_code', label: 'Par entité' }
  ];

  // Configuration des statistiques
  const statsConfig = getProformaStatsConfig(dashboardData);

  // Fonctions de rendu des graphiques spécifiques aux proformas
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
                <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#AAAAAA'][index % 6]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} proformas`, 'Nombre']}
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
        <CardTitle>Proformas par client</CardTitle>
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
              formatter={(value) => [`${value}`, 'Nombre de proformas']}
            />
            <Legend />
            <Bar dataKey="value" name="Nombre de proformas" fill="#8884d8" />
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
              name="Nombre de proformas" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="montant" 
              name="Montant total" 
              stroke="#ff7300" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Composant pour les proformas expirées - spécifique au dashboard des proformas
  const renderExpiringProformas = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Proformas à expiration</CardTitle>
      </CardHeader>
      <CardContent>
        {analytics?.proformasExpirant?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Référence</th>
                  <th className="text-left py-3 px-4">Client</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Date d'expiration</th>
                  <th className="text-right py-3 px-4">Montant</th>
                </tr>
              </thead>
              <tbody>
                {analytics.proformasExpirant.map(proforma => (
                  <tr 
                    key={proforma.id} 
                    className="border-b hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/proformas/${proforma.id}`)}
                  >
                    <td className="py-3 px-4 font-medium">{proforma.reference}</td>
                    <td className="py-3 px-4">{proforma.client_nom}</td>
                    <td className="py-3 px-4">
                      {getStatusBadge(proforma.statut)}
                    </td>
                    <td className="py-3 px-4">
                      {proforma.date_expiration ? 
                        format(new Date(proforma.date_expiration), "dd/MM/yyyy") : 
                        "-"
                      }
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(proforma.montant_ttc)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">
            Aucune proforma proche de l'expiration.
          </p>
        )}
      </CardContent>
    </Card>
  );

  // Composants d'analyse supplémentaires spécifiques aux proformas
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
                  <span className="text-sm text-gray-500">{data.count} proformas</span>
                </div>
                <div className="text-sm font-medium">
                  {formatCurrency(data.montantTotal)}
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
                    <div className="text-xs text-gray-500">{data.count} proformas</div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(data.montantTotal)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Gérer l'état vide personnalisé pour les proformas
  const emptyStateRenderer = () => (
    <div className="py-12 px-4 text-center">
      <p className="text-muted-foreground">
        Aucune proforma trouvée. Essayez de modifier vos filtres ou créez
        une nouvelle proforma.
      </p>
      <Button variant="outline" className="mt-4" onClick={resetFilters}>
        Réinitialiser les filtres
      </Button>
    </div>
  );

  // Fonction pour linéariser les données de proforma
  const linearizeProforma = (proformas) => {
    return proformas.map(proforma => ({
      ...proforma,
      client_nom: typeof proforma.offre === 'object' ? proforma.offre.client.nom : proforma.client_nom,
      entity_code: typeof proforma.offre === 'object' ? proforma.offre.entity.code : proforma.entity_code
    }));
  };

  return (
    <GenericDashboard
      title="Tableau de bord des Proformas"
      data={proformas}
      columns={columns}
      groupByOptions={groupByOptions}
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
      onCreateNew={() => navigate('/proformas/create')}
      onRowClick={(row) => navigate(`/proformas/${row.id}`)}
      statusDisplayMap={statusDisplayMap}
      emptyStateRenderer={emptyStateRenderer}
      linearizeData={linearizeProforma}
      createButtonLabel="Nouvelle Proforma"
      clientsUniques={analytics.clientsUniques || []}
      renderStatusChart={renderStatusChart}
      renderClientChart={renderClientChart}
      renderTimeChart={renderTimeChart}
      additionalCharts={[renderExpiringProformas]}
      additionalAnalyticsComponents={additionalAnalyticsComponents}
    />
  );
};

export default ProformasDashboard;