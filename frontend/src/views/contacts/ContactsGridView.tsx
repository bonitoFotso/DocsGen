import React from 'react';
import { Contact } from '@/itf';
import { useServices } from '@/AppHooks';
import { 
  Search, 
  Download, 
  Upload, 
  Filter, 
  RefreshCw, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  Briefcase, 
  FileText, 
  CheckCircle2, 
  XCircle,
  Loader2,
  ArrowDownAZ,
  ArrowUpAZ
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableHeader } from '@/components/TableHeader';
import ExportDialog from './ExportDialog';

type SortField = keyof Contact | 'ville_nom' | 'client_nom';

const ContactsGridView = () => {
  const { contactService } = useServices();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortField>('nom');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [selectedColumns, setSelectedColumns] = React.useState<Set<string>>(new Set([
    'region', 'ville_nom','secteur', 'entreprise',  'prenom', 'nom', 'poste',
    'service', 'role_achat', 'telephone', 'email', 'status', 'agrement'
  ]));

  const fetchContacts = React.useCallback(async () => {
    try {
      const response = await contactService.getAlls();
      setContacts(response);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [contactService]);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchContacts();
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleColumn = (column: string) => {
    const newColumns = new Set(selectedColumns);
    if (newColumns.has(column)) {
      newColumns.delete(column);
    } else {
      newColumns.add(column);
    }
    setSelectedColumns(newColumns);
  };

  const filteredAndSortedContacts = contacts
    .filter(contact => {
      const searchLower = search.toLowerCase();
      return (
        contact.nom.toLowerCase().includes(searchLower) ||
        (contact.prenom?.toLowerCase() || '').includes(searchLower) ||
        (contact.email?.toLowerCase() || '').includes(searchLower) ||
        (contact.entreprise?.toLowerCase() || '').includes(searchLower) ||
        (contact.ville_nom?.toLowerCase() || '').includes(searchLower) ||
        (contact.region?.toLowerCase() || '').includes(searchLower) ||
        (contact.secteur?.toLowerCase() || '').includes(searchLower) ||
        (contact.poste?.toLowerCase() || '').includes(searchLower) ||
        (contact.service?.toLowerCase() || '').includes(searchLower) ||
        (contact.role_achat?.toLowerCase() || '').includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = String(a[sortBy as keyof Contact] || '').toLowerCase();
      const bValue = String(b[sortBy as keyof Contact] || '').toLowerCase();
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
        <p className="text-lg font-medium">Erreur lors du chargement des données</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  function onSort(field: SortField): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue détaillée des contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filteredAndSortedContacts.length} contact{filteredAndSortedContacts.length !== 1 ? 's' : ''} trouvé{filteredAndSortedContacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={cn(
              "p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors",
              isRefreshing && "animate-spin"
            )}
            disabled={isRefreshing}
            title="Rafraîchir"
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
          <div className="relative group">
            <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 p-2 hidden group-hover:block z-10">
              <div className="space-y-2">
                {Array.from(selectedColumns).map(column => (
                  <label key={column} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedColumns.has(column)}
                      onChange={() => toggleColumn(column)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-700">{column}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <ExportDialog
  contacts={filteredAndSortedContacts}
  selectedColumns={selectedColumns}
/>
          <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors" title="Importer">
            <Upload className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom, email, entreprise, ville..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectedColumns.has('region') && (
                <TableHeader
                column="region"
                icon={<MapPin className="h-4 w-4" />}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={onSort}
              />
              )}
              {selectedColumns.has('ville_nom') && (
                <th
                  onClick={() => handleSort('ville_nom')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Ville</span>
                    {sortBy === 'ville_nom' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('secteur') && (
                <th
                  onClick={() => handleSort('secteur')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>Secteur</span>
                    {sortBy === 'secteur' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('entreprise') && (
                <th
                  onClick={() => handleSort('entreprise')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>Entreprise</span>
                    {sortBy === 'entreprise' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              
              {selectedColumns.has('prenom') && (
                <th
                  onClick={() => handleSort('prenom')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Prénom</span>
                    {sortBy === 'prenom' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('nom') && (
                <th
                  onClick={() => handleSort('nom')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <span>Nom</span>
                    {sortBy === 'nom' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('poste') && (
                <th
                  onClick={() => handleSort('poste')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span>Fonction</span>
                    {sortBy === 'poste' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('service') && (
                <th
                  onClick={() => handleSort('service')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>Service</span>
                    {sortBy === 'service' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('role_achat') && (
                <th
                  onClick={() => handleSort('role_achat')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span>Role Achat</span>
                    {sortBy === 'role_achat' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('telephone') && (
                <th
                  onClick={() => handleSort('telephone')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>Téléphone</span>
                    {sortBy === 'telephone' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('email') && (
                <th
                  onClick={() => handleSort('email')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>E-mail</span>
                    {sortBy === 'email' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('status') && (
                <th
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>status</span>
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
              {selectedColumns.has('agrement') && (
                <th
                  onClick={() => handleSort('agrement')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Agrément</span>
                    {sortBy === 'agrement' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedContacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                {selectedColumns.has('region') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.region || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('ville_nom') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.ville_nom || 'N/A'}
                  </td>
                )}
                 {selectedColumns.has('secteur') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.secteur || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('entreprise') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.entreprise || 'N/A'}
                  </td>
                )}
               
                {selectedColumns.has('prenom') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.prenom || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('nom') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {contact.nom}
                  </td>
                )}
                {selectedColumns.has('poste') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.poste || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('service') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.service || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('role_achat') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.role_achat || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('telephone') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.telephone ? (
                      <a
                        href={`tel:${contact.telephone}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {contact.telephone}
                      </a>
                    ) : 'N/A'}
                  </td>
                )}
                {selectedColumns.has('email') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        {contact.email}
                      </a>
                    ) : 'N/A'}
                  </td>
                )}
                {selectedColumns.has('status') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.status || 'N/A'}
                  </td>
                )}
                {selectedColumns.has('agrement') && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    {contact.agrement ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </td>
                )}
              </tr>
            ))}
            {filteredAndSortedContacts.length === 0 && (
              <tr>
                <td
                  colSpan={Array.from(selectedColumns).length}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  {search ? (
                    <div className="space-y-1">
                      <p>Aucun contact ne correspond à votre recherche</p>
                      <p className="text-xs">Essayez avec d'autres termes</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p>Aucun contact disponible</p>
                      <p className="text-xs">Les contacts s'afficheront ici</p>
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContactsGridView;