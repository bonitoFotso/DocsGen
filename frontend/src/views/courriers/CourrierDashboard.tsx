/* eslint-disable @typescript-eslint/no-unused-vars */
// components/CourrierDashboard.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowUpRight, 
  ArrowDownLeft,
  FileText, 
  Search, 
  Plus, 
  RefreshCw, 
  Clock,
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useCourriers, useCourrierStats } from '@/hooks/useCourriers';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import DatePicker from '@/components/ui/DatePicker';
import CourrierCard from './CourrierCard';
import { CourrierFilter } from '@/types/courrier';

interface CourrierDashboardProps {
  onCreateCourrier: () => void;
  onEditCourrier: (id: number) => void;
  onViewCourrier: (id: number) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const CourrierDashboard: React.FC<CourrierDashboardProps> = ({
  onCreateCourrier,
  onEditCourrier,
  onViewCourrier
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<CourrierFilter>({});
  
  // Utiliser les hooks personnalisés
  const { 
    courriers, 
    isLoading, 
    updateFilters, 
    resetFilters, 
    refetch 
  } = useCourriers(filters);
  
  const { 
    stats, 
    isLoading: isStatsLoading, 
    refetch: refetchStats 
  } = useCourrierStats();

  // Préparer les données pour les graphiques
  // const getStatusData = () => {
  //   if (!stats?.par_statut) return [];
    
  //   return Object.entries(stats.par_statut).map(([name, value]) => ({
  //     name,
  //     value
  //   }));
  // };

  const getTypeData = () => {
    if (!stats?.par_type) return [];
    
    return Object.entries(stats.par_type).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getDirectionData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Entrants', value: stats.entrants },
      { name: 'Sortants', value: stats.sortants }
    ];
  };

  // Obtenir les courriers filtrés par l'onglet actif
  const getFilteredCourriers = () => {
    if (!courriers) return [];
    
    switch (activeTab) {
      case 'inbound':
        return courriers.filter(c => c.direction === 'IN');
      case 'outbound':
        return courriers.filter(c => c.direction === 'OUT');
      case 'urgent':
        return courriers.filter(c => c.est_urgent);
      case 'overdue':
        return courriers.filter(c => c.is_overdue);
      case 'pending':
        return courriers.filter(c => ['DRAFT', 'SENT', 'RECEIVED'].includes(c.statut));
      case 'processed':
        return courriers.filter(c => c.statut === 'PROCESSED');
      case 'archived':
        return courriers.filter(c => c.statut === 'ARCHIVED');
      default:
        return courriers;
    }
  };

  const handleFilter = (key: string, value: string | null) => {
    if (value === '' || value === null || value === undefined) {
      const newFilters = { ...filters };
      delete newFilters[key as keyof CourrierFilter];
      updateFilters(newFilters);
    } else {
      updateFilters({ [key]: value });
    }
  };

  const handleDateFilter = (key: string, date: Date | null) => {
    if (!date) {
      const newFilters = { ...filters };
      delete newFilters[key as keyof CourrierFilter];
      updateFilters(newFilters);
    } else {
      updateFilters({ [key]: format(date, 'yyyy-MM-dd') });
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Courriers</h1>
        <Button onClick={onCreateCourrier}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Courrier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Courriers</CardTitle>
            <CardDescription>Nombre total de courriers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <div className="flex justify-between mt-2">
              <div className="flex items-center">
                <ArrowDownLeft className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm">{stats?.entrants || 0} Entrants</span>
              </div>
              <div className="flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm">{stats?.sortants || 0} Sortants</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">En Attente</CardTitle>
            <CardDescription>Courriers à traiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats ? (stats.par_statut.DRAFT || 0) + (stats.par_statut.SENT || 0) + (stats.par_statut.RECEIVED || 0) : 0}
            </div>
            <div className="flex items-center mt-2">
              <Clock className="h-4 w-4 text-amber-500 mr-1" />
              <span className="text-sm">Nécessitent une action</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Traités</CardTitle>
            <CardDescription>Courriers finalisés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.par_statut.PROCESSED || 0}</div>
            <div className="flex items-center mt-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm">Courriers traités</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">En Retard</CardTitle>
            <CardDescription>Courriers nécessitant attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats?.en_retard || 0}</div>
            <div className="flex items-center mt-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm">Nécessitent attention immédiate</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Répartition par Type et Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={getTypeData()}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Nombre de courriers" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition Entrants/Sortants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getDirectionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {getDirectionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Courriers</CardTitle>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Rechercher..."
                  className="max-w-sm pl-8"
                  value={filters.search || ''}
                  onChange={(e) => handleFilter('search', e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.doc_type || ''}
                onValueChange={(value) => handleFilter('doc_type', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type de doc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd">Tous les types</SelectItem>
                  <SelectItem value="LETTER">Lettre</SelectItem>
                  <SelectItem value="INVOICE">Facture</SelectItem>
                  <SelectItem value="CONTRACT">Contrat</SelectItem>
                  <SelectItem value="NOTICE">Avis</SelectItem>
                  <SelectItem value="REPORT">Rapport</SelectItem>
                  <SelectItem value="OTHER">Autre</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.statut || ''}
                onValueChange={(value) => handleFilter('statut', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd">Tous les statuts</SelectItem>
                  <SelectItem value="DRAFT">Brouillon</SelectItem>
                  <SelectItem value="SENT">Envoyé</SelectItem>
                  <SelectItem value="RECEIVED">Reçu</SelectItem>
                  <SelectItem value="PROCESSED">Traité</SelectItem>
                  <SelectItem value="ARCHIVED">Archivé</SelectItem>
                  <SelectItem value="CANCELLED">Annulé</SelectItem>
                </SelectContent>
              </Select>

              <DatePicker
                selected={filters.date_debut ? new Date(filters.date_debut) : null}
                onSelect={(date: Date | null) => handleDateFilter('date_debut', date)}
                placeholderText="Date début"
                locale={fr}
                className="w-[140px]"
              />

              <DatePicker
                selected={filters.date_fin ? new Date(filters.date_fin) : null}
                onSelect={(date: Date | null) => handleDateFilter('date_fin', date)}
                placeholderText="Date fin"
                locale={fr}
                className="w-[140px]"
              />
            </div>
          </div>
        </CardHeader>
        
        <Separator />
        
        <CardContent className="p-0">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-4">
              <TabsList className="w-full grid grid-cols-2 md:grid-cols-7">
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="inbound">Entrants</TabsTrigger>
                <TabsTrigger value="outbound">Sortants</TabsTrigger>
                <TabsTrigger value="urgent">Urgents</TabsTrigger>
                <TabsTrigger value="overdue">En retard</TabsTrigger>
                <TabsTrigger value="pending">En attente</TabsTrigger>
                <TabsTrigger value="processed">Traités</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value={activeTab} className="p-6">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center p-8">Chargement des données...</div>
                  ) : getFilteredCourriers().length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>Aucun courrier trouvé pour ces critères</p>
                    </div>
                  ) : (
                    getFilteredCourriers().map((courrier) => (
                      <CourrierCard
                        key={courrier.id}
                        courrier={courrier}
                        onClick={() => onViewCourrier(courrier.id)}
                        onEdit={() => onEditCourrier(courrier.id)}
                        onViewDetails={() => onViewCourrier(courrier.id)}
                        onDownload={() => window.open(courrier.fichier, '_blank')}
                      />
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CourrierDashboard;