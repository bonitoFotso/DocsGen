import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, TrendingUp, Users, FileText, Building, Package } from "lucide-react";

// Types
interface ProformaStatsProps {
  stats: {
    statistiquesGenerales: {
      nbProformas: number;
      montantTotalHT: number;
      montantTotalTVA: number;
      montantTotalTTC: number;
      nbClients: number;
      tauxTVA: string[];
    };
    repartitionParClient: Array<{
      client: string;
      nbProformas: number;
      montantTTC: number;
    }>;
    repartitionParEntite: Array<{
      entite: string;
      nbProformas: number;
      montantTTC: number;
    }>;
    repartitionTemporelle: Array<{
      date: string;
      count: number;
    }>;
    statuts: Record<string, number>;
    produitsPrincipaux: Record<string, number>;
    topProformas: Array<{
      reference: string;
      client: string;
      entity: string;
    }>;
  };
}

// Couleurs pour les graphiques
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#FF6B6B"];

const KDProformaStats: React.FC<ProformaStatsProps> = ({ stats }) => {
  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF' }).format(montant);
  };

  // Transformation des données de statut pour le graphique
  const statutsData = Object.entries(stats.statuts).map(([statut, count]) => ({
    name: statut,
    value: count
  }));

  // Transformation des données de produits pour le graphique
  const produitsData = Object.entries(stats.produitsPrincipaux).map(([produit, count]) => ({
    name: produit,
    value: count
  }));

  return (
    <div className="w-full p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Tableau de bord des proformas</h1>
        <p className="text-muted-foreground">Vue d'ensemble des performances et statistiques</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Carte 1: Vue d'ensemble */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Vue d'ensemble
            </CardTitle>
            <CardDescription>Statistiques générales des proformas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Proformas</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.statistiquesGenerales.nbProformas}</p>
              </div>
              <div className="bg-green-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.statistiquesGenerales.nbClients}</p>
              </div>
              <div className="bg-amber-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total HT</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">{formatMontant(stats.statistiquesGenerales.montantTotalHT)}</p>
              </div>
              <div className="bg-purple-50 dark:bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total TTC</p>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatMontant(stats.statistiquesGenerales.montantTotalTTC)}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground pt-0">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>TVA appliquée: {stats.statistiquesGenerales.tauxTVA.join(', ')}</span>
            </div>
          </CardFooter>
        </Card>

        {/* Carte 2: Statuts des proformas */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <ArrowUp className="h-5 w-5 text-amber-500" />
              Statuts des proformas
            </CardTitle>
            <CardDescription>Répartition par état actuel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(stats.statuts).map(([statut, count], index) => (
                <Badge key={statut} variant="outline" className="justify-between py-2 px-3 rounded-md" style={{ borderLeftWidth: '4px', borderLeftColor: COLORS[index % COLORS.length] }}>
                  {statut} 
                  <span className="font-bold">{count}</span>
                </Badge>
              ))}
            </div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statutsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statutsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} proformas`, 'Quantité']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carte 3: Produits principaux */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-green-500" />
              Produits principaux
            </CardTitle>
            <CardDescription>Produits les plus fréquents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={produitsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => [`${value} proformas`, 'Quantité']} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {produitsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carte 4: Répartition par client */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-500" />
              Répartition par client
            </CardTitle>
            <CardDescription>Montants et nombre de proformas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.repartitionParClient}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <XAxis dataKey="client" angle={-45} textAnchor="end" height={70} />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip formatter={(value, name) => [name === "montantTTC" ? formatMontant(Number(value)) : value, name === "montantTTC" ? "Montant TTC" : "Nombre"]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="montantTTC" fill="#8884d8" name="Montant TTC" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="nbProformas" fill="#82ca9d" name="Nombre" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carte 5: Répartition par entité */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-pink-600"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Building className="h-5 w-5 text-pink-500" />
              Répartition par entité
            </CardTitle>
            <CardDescription>Analyse par entité émettrice</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.repartitionParEntite}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="montantTTC"
                    nameKey="entite"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {stats.repartitionParEntite.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMontant(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Carte 6: Évolution temporelle */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Évolution temporelle
            </CardTitle>
            <CardDescription>Activité par période</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.repartitionTemporelle}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} proformas`, 'Nombre']} />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} name="Nombre de proformas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KDProformaStats;