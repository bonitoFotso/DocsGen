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
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useExportFacture } from '@/hooks/useExportFacture';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { 
  FileDown, 
  Filter, 
  Plus, 
  RefreshCw, 
  Search, 
  ArrowUpDown,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  CreditCard,
  CircleDashed,
  Building,
  FileText,
  DollarSign,
  CalendarCheck
} from 'lucide-react';
import { useFactures } from '@/contexts/FactureContext';

const FactureListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    factures, 
    isLoading, 
    error, 
    filters, 
    totalItems, 
    fetchFactures, 
    setFilters, 
    resetFilters 
  } = useFactures();
  const { isExporting, exportToCsv } = useExportFacture();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showEnRetard, setShowEnRetard] = useState(false);

  // Pagination
  const totalPages = Math.ceil(totalItems / filters.page_size);
  
  // Navigation vers la page de détail ou de création
  const handleViewFacture = (id: number) => {
    navigate(`/factures/${id}`);
  };

  const handleCreateFacture = () => {
    navigate('/factures/create');
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

  // Filtrage par "en retard"
  const handleEnRetardChange = (checked: boolean) => {
    setShowEnRetard(checked);
    setFilters({ est_en_retard: checked ? true : undefined, page: 1 });
  };

  // Statut de la facture
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'BROUILLON':
        return <Badge variant="outline" className="bg-gray-100">
          <CircleDashed className="mr-1 h-3 w-3" /> Brouillon
        </Badge>;
      case 'EMISE':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">
          <Send className="mr-1 h-3 w-3" /> Émise
        </Badge>;
      case 'PAYEE':
        return <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Payée
        </Badge>;
      case 'ANNULEE':
        return <Badge variant="outline" className="bg-red-100 text-red-800">
          <XCircle className="mr-1 h-3 w-3" /> Annulée
        </Badge>;
      case 'IMPAYEE':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">
          <AlertTriangle className="mr-1 h-3 w-3" /> Impayée
        </Badge>;
      case 'PARTIELLEMENT_PAYEE':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">
          <CreditCard className="mr-1 h-3 w-3" /> Partiellement payée
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
        <h1 className="text-3xl font-bold">Factures</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => fetchFactures()} 
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
          <Button onClick={handleCreateFacture}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Facture
          </Button>
        </div>
      </div>

      {/* Barre de recherche et filtres rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="md:col-span-3">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <Input
                placeholder="Rechercher une facture..."
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

        <Card className="md:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="en-retard" 
                  checked={showEnRetard}
                  onCheckedChange={handleEnRetardChange}
                />
                <Label htmlFor="en-retard" className="cursor-pointer">Factures en retard</Label>
              </div>
              
              <Select 
                value={filters.statut?.[0] || ''} 
                onValueChange={(value) => handleFilterChange('statut', value ? [value] : undefined)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Tous les statuts</SelectItem>
                  <SelectItem value="BROUILLON">Brouillon</SelectItem>
                  <SelectItem value="EMISE">Émise</SelectItem>
                  <SelectItem value="PAYEE">Payée</SelectItem>
                  <SelectItem value="ANNULEE">Annulée</SelectItem>
                  <SelectItem value="IMPAYEE">Impayée</SelectItem>
                  <SelectItem value="PARTIELLEMENT_PAYEE">Partiellement payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des factures */}
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Liste des factures</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : factures.length === 0 ? (
            <div className="text-center py-4">Aucune facture trouvée.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{renderSortableHeader('Référence', 'reference')}</TableHead>
                    <TableHead>{renderSortableHeader('Client', 'client_nom')}</TableHead>
                    <TableHead>{renderSortableHeader('Affaire', 'affaire_reference')}</TableHead>
                    <TableHead>{renderSortableHeader('Date émission', 'date_emission')}</TableHead>
                    <TableHead>{renderSortableHeader('Date échéance', 'date_echeance')}</TableHead>
                    <TableHead>{renderSortableHeader('Statut', 'statut')}</TableHead>
                    <TableHead>{renderSortableHeader('Montant TTC', 'montant_ttc')}</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factures.map((facture) => (
                    <TableRow 
                      key={facture.id}
                      className={`cursor-pointer hover:bg-muted/50 ${facture.est_en_retard ? 'bg-red-50' : ''}`}
                      onClick={() => handleViewFacture(facture.id)}
                    >
                      <TableCell className="font-medium">{facture.reference}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span>{facture.client_nom}</span>
                        </div>
                      </TableCell>
                      <TableCell>{facture.affaire_reference}</TableCell>
                      <TableCell>{facture.date_emission ? formatDate(facture.date_emission) : '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {facture.date_echeance ? (
                            <>
                              <CalendarCheck className={`h-4 w-4 ${facture.est_en_retard ? 'text-red-500' : 'text-muted-foreground'}`} />
                              <span className={facture.est_en_retard ? 'text-red-600 font-medium' : ''}>
                                {formatDate(facture.date_echeance)}
                              </span>
                            </>
                          ) : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{renderStatusBadge(facture.statut)}</TableCell>
                      <TableCell>{formatCurrency(facture.montant_ttc)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFacture(facture.id);
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>

                          {(facture.statut === 'EMISE' || facture.statut === 'IMPAYEE' || facture.statut === 'PARTIELLEMENT_PAYEE') && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/factures/${facture.id}`, { state: { openPaymentDialog: true } });
                              }}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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
                  <SelectItem value="EMISE">Émise</SelectItem>
                  <SelectItem value="PAYEE">Payée</SelectItem>
                  <SelectItem value="ANNULEE">Annulée</SelectItem>
                  <SelectItem value="IMPAYEE">Impayée</SelectItem>
                  <SelectItem value="PARTIELLEMENT_PAYEE">Partiellement payée</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-en-retard" 
                checked={showEnRetard}
                onCheckedChange={handleEnRetardChange}
              />
              <Label htmlFor="filter-en-retard">Factures en retard</Label>
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
              <Label>Date d'émission (début)</Label>
              <Input
                type="date"
                value={filters.date_emission_min || ''}
                onChange={(e) => handleFilterChange('date_emission_min', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date d'émission (fin)</Label>
              <Input
                type="date"
                value={filters.date_emission_max || ''}
                onChange={(e) => handleFilterChange('date_emission_max', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date d'échéance (début)</Label>
              <Input
                type="date"
                value={filters.date_echeance_min || ''}
                onChange={(e) => handleFilterChange('date_echeance_min', e.target.value || undefined)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Date d'échéance (fin)</Label>
              <Input
                type="date"
                value={filters.date_echeance_max || ''}
                onChange={(e) => handleFilterChange('date_echeance_max', e.target.value || undefined)}
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

export default FactureListPage;