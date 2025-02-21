import React, { useState, useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronDown, ChevronUp, Pencil, Trash, Filter, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ContactEdit } from '@/itf';

interface Site {
  id: number | undefined;
  nom: string;
  s_num: string;
}

interface Ville {
  id:  number | undefined;
  nom: string;
  region_nom: string;
  pays_nom: string;
}

interface Contact {
  id: string | number;
  nom: string;
  prenom: string;
  poste?: string;
  service?: string;
  email: string;
  telephone?: string;
  role_achat?: string;
  site?: Site;
  ville?: Ville;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface SortConfig {
  key: keyof Contact | null;
  direction: 'asc' | 'desc';
}

interface ContactsTableProps {
  contacts: Contact[];
  itemsPerPage: number;
  onEdit: (contact: ContactEdit) => void;
  onDelete: (id: string | number | null) => void;
}

interface FilterState {
  site: string | null;
  ville: string | null;
  region: string | null;
  createdBy: string | null;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ 
  contacts, 
  itemsPerPage,
  onEdit,
  onDelete 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState<FilterState>({
    site: null,
    ville: null,
    region: null,
    createdBy: null
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Extract unique values for filters
  const uniqueValues = useMemo(() => ({
    sites: [...new Set(contacts.map(c => c.site?.nom).filter((site): site is string => Boolean(site)))],
    villes: [...new Set(contacts.map(c => c.ville?.nom).filter((ville): ville is string => Boolean(ville)))],
    regions: [...new Set(contacts.map(c => c.ville?.region_nom).filter((region): region is string => Boolean(region)))],
    creators: [...new Set(contacts.map(c => c.created_by).filter((creator): creator is string => Boolean(creator)))]
  }), [contacts]);

  // Filter handler
  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      site: null,
      ville: null,
      region: null,
      createdBy: null
    });
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  // Memoized filtering and sorting
  const filteredAndSortedContacts = useMemo(() => {
    return contacts
      .filter(contact => {
        const searchStr = searchTerm.toLowerCase();
        const matchesSearch = (
          `${contact.nom} ${contact.prenom}`.toLowerCase().includes(searchStr) ||
          contact.email.toLowerCase().includes(searchStr) ||
          (contact.service || '').toLowerCase().includes(searchStr) ||
          (contact.poste || '').toLowerCase().includes(searchStr)
        );

        const matchesFilters = (
          (!filters.site || contact.site?.nom === filters.site) &&
          (!filters.ville || contact.ville?.nom === filters.ville) &&
          (!filters.region || contact.ville?.region_nom === filters.region) &&
          (!filters.createdBy || contact.created_by === filters.createdBy)
        );

        return matchesSearch && matchesFilters;
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        
        const aValue = (a[sortConfig.key] || '').toString().toLowerCase();
        const bValue = (b[sortConfig.key] || '').toString().toLowerCase();
        
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
  }, [contacts, searchTerm, sortConfig, filters]);

  const handleSort = useCallback((key: keyof Contact) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedContacts.length / itemsPerPage);
  const currentContacts = filteredAndSortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const SortIcon = ({ column }: { column: keyof Contact }) => {
    if (sortConfig.key !== column) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const TableHeaderCell = ({ column, label }: { column: keyof Contact, label: string }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon column={column} />
      </div>
    </TableHead>
  );

  const ActiveFilters = () => {
    if (!activeFilterCount) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {Object.entries(filters).map(([key, value]) => {
          if (!value) return null;
          return (
            <Badge
              key={key}
              variant="secondary"
              className="px-3 py-1.5 rounded-full text-sm"
            >
              {value}
              <button
                onClick={() => handleFilterChange(key as keyof FilterState, null)}
                className="ml-2 hover:text-destructive focus:outline-none transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          );
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-destructive"
        >
          Effacer tout
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-4 bg-background rounded-xl border shadow-sm">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="w-4 h-4 mr-2" />
                Filtres
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Filtres avancés</SheetTitle>
                <SheetDescription>
                  Affinez votre recherche en utilisant les filtres ci-dessous
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Site</h4>
                  <Select
                    value={filters.site || ""}
                    onValueChange={(value) => handleFilterChange('site', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un site" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.sites.map(site => (
                        <SelectItem key={site} value={site}>{site}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Ville</h4>
                  <Select
                    value={filters.ville || ""}
                    onValueChange={(value) => handleFilterChange('ville', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.villes.map(ville => (
                        <SelectItem key={ville} value={ville}>{ville}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Région</h4>
                  <Select
                    value={filters.region || ""}
                    onValueChange={(value) => handleFilterChange('region', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une région" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.regions.map(region => (
                        <SelectItem key={region} value={region}>{region}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Créé par</h4>
                  <Select
                    value={filters.createdBy || ""}
                    onValueChange={(value) => handleFilterChange('createdBy', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un créateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueValues.creators.map(creator => (
                        <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <SheetFooter>
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Réinitialiser les filtres
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <ActiveFilters />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell column="site" label="Site" />
              <TableHeaderCell column="nom" label="Nom" />
              <TableHeaderCell column="poste" label="Poste" />
              <TableHeaderCell column="service" label="Service" />
              <TableHeaderCell column="email" label="Contact" />
              <TableHeaderCell column="notes" label="Notes" />
              <TableHeaderCell column="updated_at" label="Mise à jour" />
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentContacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="font-medium">{contact.site?.nom || 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{contact.site?.s_num || 'N/A'}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {contact.nom} {contact.prenom}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {contact.ville?.nom}, {contact.ville?.region_nom}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.poste || 'N/A'}
                </TableCell>
                <TableCell>
                  {contact.service || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <a 
                      href={`mailto:${contact.email}`} 
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {contact.email}
                    </a>
                    {contact.telephone && (
                      <a 
                        href={`tel:${contact.telephone}`} 
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        {contact.telephone}
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {contact.notes || 'N/A'}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(contact.updated_at), 'Pp', { locale: fr })}
                    <div className="text-xs">
                      par {contact.updated_by}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit({
                        ...contact,
                        ville: contact.ville?.id,
                        site: contact.site?.id
                      })}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(contact.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentContacts.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>Aucun contact trouvé</p>
                    {(searchTerm || activeFilterCount > 0) && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm('');
                          clearFilters();
                        }}
                        className="mt-2"
                      >
                        Réinitialiser la recherche et les filtres
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Summary */}
      <div className="px-4 py-3 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {filteredAndSortedContacts.length} contact{filteredAndSortedContacts.length > 1 ? 's' : ''} trouvé{filteredAndSortedContacts.length > 1 ? 's' : ''}
            {activeFilterCount > 0 && ` (filtré${activeFilterCount > 1 ? 's' : ''})`}
          </div>
          
          {totalPages > 1 && (
            <nav className="flex items-center gap-4 order-1 sm:order-2" aria-label="Pagination">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm whitespace-nowrap">
                Page {currentPage} sur {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;