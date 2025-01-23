import { useEffect, useState, useMemo } from 'react';
import { useRapport } from '../../contexts/RapportProvider';
import RapportsList from './RapportsList';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Download,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import ButtonModal from '@/components/ui/buttonModal';

type SortField = 'reference' | 'date_creation' | 'statut' | 'client';
type SortOrder = 'asc' | 'desc';

export function Rapports() {
  const { rapports, fetchRapports } = useRapport();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState<{field: SortField; order: SortOrder}>({
    field: 'date_creation',
    order: 'desc'
  });

  useEffect(() => {
    fetchRapports();
  }, [fetchRapports]);

  const filteredRapports = useMemo(() => {
    const filtered = rapports.filter(rapport => {
      const matchesSearch = rapport.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rapport.client.nom.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || rapport.statut === statusFilter;
      const matchesDate = !dateFilter || isWithinDateRange(rapport.date_creation, dateFilter);
      return matchesSearch && matchesStatus && matchesDate;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case 'reference':
          comparison = a.reference.localeCompare(b.reference);
          break;
        case 'date_creation':
          comparison = new Date(a.date_creation).getTime() - new Date(b.date_creation).getTime();
          break;
        case 'statut':
          comparison = a.statut.localeCompare(b.statut);
          break;
        case 'client':
          comparison = a.client.nom.localeCompare(b.client.nom);
          break;
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [rapports, searchTerm, statusFilter, dateFilter, sortConfig]);

  const isWithinDateRange = (date: string, range: string) => {
    const today = new Date();
    const dateToCheck = new Date(date);
    
    switch(range) {
      case 'today':
        return format(dateToCheck, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      case 'week':
        { const weekAgo = new Date(today.setDate(today.getDate() - 7));
        return dateToCheck >= weekAgo; }
      case 'month':
        { const monthAgo = new Date(today.setMonth(today.getMonth() - 1));
        return dateToCheck >= monthAgo; }
      default:
        return true;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRapports();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = () => {
    const csvContent = [
      ['Référence', 'Date de création', 'Statut', 'Client', 'Entité', 'Produit', 'Site'],
      ...filteredRapports.map(rapport => [
        rapport.reference,
        format(new Date(rapport.date_creation), 'dd/MM/yyyy'),
        rapport.statut,
        rapport.client.nom,
        rapport.entity.name,
        rapport.produit.name,
        rapport.site_nom
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `rapports_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-gray-700" />
              Gestion des Rapports
            </h1>
            <p className="text-gray-500 mt-1">
              {filteredRapports.length} rapport{filteredRapports.length > 1 ? 's' : ''} au total
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtres
            </Button>
            <ButtonModal 
              title="Nouveau Rapport"
              variant="default"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              className="whitespace-nowrap"
            >
              <div className="p-4">
                <p>Formulaire de création de rapport à implémenter</p>
              </div>
            </ButtonModal>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{filteredRapports.length}</div>
            <div className="text-xs text-gray-500 mt-1">Tous les rapports</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">En cours</div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-2">
              {filteredRapports.filter(r => r.statut === 'EN_COURS').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Rapports actifs</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Terminés</div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              {filteredRapports.filter(r => r.statut === 'TERMINE').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Rapports complétés</div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-gray-500">Brouillons</div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-600 mt-2">
              {filteredRapports.filter(r => r.statut === 'BROUILLON').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">En préparation</div>
          </div>
        </div>

       {/* Updated Filters section */}
      <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 ${showFilters ? 'max-h-96' : 'max-h-0'}`}>
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filtres et tri
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2 text-gray-500 hover:text-gray-700"
            >
              <Trash2 className="w-4 h-4" />
              Réinitialiser
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="">Tous les statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="BROUILLON">Brouillon</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">7 derniers jours</option>
                <option value="month">30 derniers jours</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={`${sortConfig.field}-${sortConfig.order}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [SortField, SortOrder];
                  setSortConfig({ field, order });
                }}
                className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer"
              >
                <option value="date_creation-desc">Date (récent)</option>
                <option value="date_creation-asc">Date (ancien)</option>
                <option value="reference-asc">Référence (A-Z)</option>
                <option value="reference-desc">Référence (Z-A)</option>
                <option value="client-asc">Client (A-Z)</option>
                <option value="client-desc">Client (Z-A)</option>
                <option value="statut-asc">Statut (A-Z)</option>
                <option value="statut-desc">Statut (Z-A)</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Liste des rapports */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {filteredRapports.length > 0 ? (
            <RapportsList rapports={filteredRapports} />
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Aucun rapport ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou d'effectuer une nouvelle recherche.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}