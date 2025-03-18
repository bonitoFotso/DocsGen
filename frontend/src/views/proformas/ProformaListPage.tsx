import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  FileDown, 
  Filter, 
  Plus, 
  RefreshCw, 
  Search, 
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  CircleDashed
} from 'lucide-react';
import { useExportProforma } from '@/hooks/useExportProforma';
import { formatDate } from '@/utils/dateHelpers';
import { formatCurrency } from '@/utils/formatters';
import { IProforma } from '@/services/proformaService';
import { useProformas } from '@/hooks/useProformas';

const ProformaListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    proformas, 
    isLoading, 
    error, 
    filters, 
    totalItems, 
    fetchProformas, 
    setFilters, 
    resetFilters 
  } = useProformas();
  const { isExporting, exportToCsv } = useExportProforma();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.page_size);
  
  // Navigation vers la page de détail ou de création
  const handleViewProforma = (id: number) => {
    navigate(`/proformas/${id}`);
  };

  const handleCreateProforma = () => {
    navigate('/proformas/create');
  };

  // Gestion de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ search: searchValue, page: 1 });
  };

  // Gestion des filtres
  const handleFilterChange = (key: string, value: unknown) => {
    setFilters({ [key]: value, page: 1 });
  };

  // Gestion du tri
  const handleSort = (field: string) => {
    const currentOrdering = filters.ordering;
    let newOrdering = `-${field}`;
    
    if (currentOrdering === field) {
      newOrdering = `-${field}`;
    } else if (currentOrdering === `-${field}`) {
      newOrdering = field;
    } else {
      newOrdering = field;
    }
    
    setFilters({ ordering: newOrdering });
  };

  // Statut de la proforma
  const renderStatusBadge = (status: string) => {
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

  // Afficher une colonne avec tri
  const renderSortableHeader = (title: string, field: string) => (
    <div 
      className="flex items-center cursor-pointer"
      onClick={() => handleSort(field)}
    >
      {title}
      <ArrowUpDown className="ml-1 h-4 w-4" />
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proformas</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => fetchProformas()} 
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsFilterOpen(true)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportToCsv(filters)} 
            disabled={isExporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleCreateProforma}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Proforma
          </Button>
        </div>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              placeholder="Rechercher une proforma..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tableau des proformas */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Liste des proformas</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : proformas.length === 0 ? (
            <div className="text-center py-4">Aucune proforma trouvée.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{renderSortableHeader('Référence', 'reference')}</TableHead>
                    <TableHead>{renderSortableHeader('Client', 'offre__client__nom')}</TableHead>
                    <TableHead>{renderSortableHeader('Entité', 'offre__entity__code')}</TableHead>
                    <TableHead>{renderSortableHeader('Date création', 'date_creation')}</TableHead>
                    <TableHead>{renderSortableHeader('Statut', 'statut')}</TableHead>
                    <TableHead>{renderSortableHeader('Montant TTC', 'montant_ttc')}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proformas.map((proforma: IProforma) => (
                    <TableRow 
                      key={proforma.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewProforma(proforma.id)}
                    >
                      <TableCell className="font-medium">{proforma.reference}</TableCell>
                      <TableCell>{typeof proforma.offre === 'object' ? proforma.offre.client.nom : proforma.client_nom}</TableCell>
                      <TableCell>{typeof proforma.offre === 'object' ? proforma.offre.entity.code : proforma.entity_code}</TableCell>
                      <TableCell>{formatDate(proforma.date_creation)}</TableCell>
                      <TableCell>{renderStatusBadge(proforma.statut)}</TableCell>
                      <TableCell>{formatCurrency(proforma.montant_ttc)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProforma(proforma.id);
                          }}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={(e) => {
                        e.preventDefault();
                        setFilters({ page: Math.max(1, filters.page - 1) });
                      }}
                      aria-disabled={filters.page <= 1}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        isActive={filters.page === i + 1}
                        onClick={() => setFilters({ page: i + 1 })}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={(e) => {
                        e.preventDefault();
                        setFilters({ page: Math.min(totalPages, filters.page + 1) });
                      }}
                      aria-disabled={filters.page >= totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Panneau de filtres */}
      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtres</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select 
                value={filters.statut?.[0] || ''}
                onValueChange={(value) => handleFilterChange('statut', value ? [value] : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les statuts</SelectItem>
                  <SelectItem value="BROUILLON">Brouillon</SelectItem>
                  <SelectItem value="EN_COURS">En cours</SelectItem>
                  <SelectItem value="VALIDE">Validé</SelectItem>
                  <SelectItem value="REFUSE">Refusé</SelectItem>
                  <SelectItem value="EXPIRE">Expiré</SelectItem>
                  <SelectItem value="ANNULE">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Montant TTC minimum</Label>
              <Input
                type="number"
                placeholder="Montant min"
                value={filters.montant_ttc_min || ''}
                onChange={(e) => handleFilterChange('montant_ttc_min', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Montant TTC maximum</Label>
              <Input
                type="number"
                placeholder="Montant max"
                value={filters.montant_ttc_max || ''}
                onChange={(e) => handleFilterChange('montant_ttc_max', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date de création (début)</Label>
              <Input
                type="date"
                value={filters.date_creation_min || ''}
                onChange={(e) => handleFilterChange('date_creation_min', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date de création (fin)</Label>
              <Input
                type="date"
                value={filters.date_creation_max || ''}
                onChange={(e) => handleFilterChange('date_creation_max', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Nombre d'éléments par page</Label>
              <Select 
                value={String(filters.page_size)}
                onValueChange={(value) => handleFilterChange('page_size', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button onClick={() => setIsFilterOpen(false)}>
                Appliquer
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ProformaListPage;