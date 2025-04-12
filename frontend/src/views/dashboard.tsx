import {
  Users,
  MapPin,
  FileText,
  Briefcase,
  GraduationCap,
  Plus,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card } from "@/common/CustomCard";
import { useEntityFromUrl } from "@/hooks/useEntityFromUrl";
const mockMonthlyData = [
  { month: "Jan", documents: 65 },
  { month: "Fév", documents: 59 },
  { month: "Mar", documents: 80 },
  { month: "Avr", documents: 81 },
  { month: "Mai", documents: 56 },
  { month: "Jun", documents: 55 },
  { month: "Jul", documents: 40 },
];

const mockClientData = [
  { name: "SABC", value: 35 },
  { name: "ENEO", value: 28 },
  { name: "ALUCAM", value: 24 },
  { name: "CIMENCAM", value: 22 },
  { name: "DANGOTE", value: 20 },
];

const mockNotifications = [
  {
    id: 1,
    title: "Nouvelle offre en attente",
    description: "Offre #KES-2024-001 en attente de validation",
    time: "5 min",
    type: "warning",
  },
  {
    id: 2,
    title: "Affaire terminée",
    description: "Affaire #AFF-2024-003 marquée comme terminée",
    time: "1 heure",
    type: "success",
  },
  {
    id: 3,
    title: "Nouveau rapport créé",
    description: "Rapport d'inspection #RAP-2024-015 créé",
    time: "2 heures",
    type: "info",
  },
];

export function Dashboard() {

    const currentEntity = useEntityFromUrl();

    // titre du tableau de boad en fonction de l'entité
    const title = currentEntity
      ? `Vue d'ensemble de l'activité - ${currentEntity}`
      : "Vue d'ensemble de l'activité";
  
  return (
    <div className="p-2 lg:p-2">
      <div className="mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de bord
            </h1>
            <p className="text-gray-500 mt-1">{title}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-9 pr-4 py-2 w-64 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600 text-white">
              <Plus className="w-4 h-4" />
              Nouveau document
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Clients</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">152</h3>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">+12.5% </span>
              <span className="text-gray-500"> ce mois</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Sites</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">287</h3>
              </div>
              <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-indigo-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">+8.1%</span>
              <span className="text-gray-500">ce mois</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Documents</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">1,432</h3>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowDownRight className="w-4 h-4 text-red-500" />
              <span className="text-red-500 font-medium">-3.2%</span>
              <span className="text-gray-500">ce mois</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Affaires</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">89</h3>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              <ArrowUpRight className="w-4 h-4 text-green-500" />
              <span className="text-green-500 font-medium">+15.3%</span>
              <span className="text-gray-500">ce mois</span>
            </div>
          </Card>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-500" />
                  Documents créés
                </h3>
                <p className="text-sm text-gray-500">Par mois</p>
              </div>
              <Button variant="outline" size="sm">
                Cette année
              </Button>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockMonthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="documents" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-red-500" />
                  Clients les plus actifs
                </h3>
                <p className="text-sm text-gray-500">Par nombre de documents</p>
              </div>
              <Button variant="outline" size="sm">
                Ce mois
              </Button>
            </div>
            <div className="h-[300px]  ml-[-1rem] mr-[-1rem]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockClientData} layout="vertical">
                  <CartesianGrid strokeDasharray="2 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Notifications et accès rapide */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications */}
          <Card className="col-span-2">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-gray-500" />
                Notifications récentes
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {mockNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.description}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Accès rapide */}
          <Card>
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-500" />
                Accès rapide
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="w-4 h-4" />
                Nouveau client
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <MapPin className="w-4 h-4" />
                Nouveau site
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="w-4 h-4" />
                Nouvelle offre
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Briefcase className="w-4 h-4" />
                Nouvelle affaire
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <GraduationCap className="w-4 h-4" />
                Nouvelle formation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
