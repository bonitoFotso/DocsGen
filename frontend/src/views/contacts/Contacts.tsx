import React from 'react';
import { useServices } from '@/AppHooks';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ContactModal from './ContactModal';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Building, 
  Edit2, 
  Trash2, 
  ArrowDownAZ, 
  ArrowUpAZ, 
  Loader2,
  LayoutGrid,
  LayoutList,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ContactEdit, ContactList } from '@/itf';

type ViewMode = 'list' | 'grid';

export const ContactsPage = () => {
  const [contacts, setContacts] = React.useState<ContactList[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [contactToEdit, setContactToEdit] = React.useState<ContactEdit & { id?: number }>({ nom: '' });
  const [contactToDelete, setContactToDelete] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState('');
  const [sortBy, setSortBy] = React.useState<keyof ContactList>('nom');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [selectedContacts, setSelectedContacts] = React.useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const { contactService } = useServices();
  // fonction pour récupérer les contacts
  const fetchContacts = React.useCallback(async () => {
    try {
      const response = await contactService.getAll();
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

  const handleSort = (field: keyof ContactList) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
// fonction pour filtrer et trier les contacts
  const filteredAndSortedContacts = contacts
    .filter(contact => {
      const searchLower = search.toLowerCase();
      return (
        contact.nom.toLowerCase().includes(searchLower) ||
        (contact.prenom?.toLowerCase() || '').includes(searchLower) ||
        (contact.email?.toLowerCase() || '').includes(searchLower) ||
        contact.client_nom.toLowerCase().includes(searchLower) ||
        (contact.poste?.toLowerCase() || '').includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = String(a[sortBy] || '').toLowerCase();
      const bValue = String(b[sortBy] || '').toLowerCase();
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
    // fonction pour créer un contact
  const handleCreate = async (formData: ContactEdit) => {
    setIsSubmitting(true);
    try {
      const newContact = await contactService.create(formData);
      setContacts(prev => [...prev, newContact]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // fonction pour modifier un contact
  const handleEdit = async (id: number, formData: ContactEdit) => {
    setIsSubmitting(true);
    try {
      await contactService.update(id, formData);
      setContacts(contacts.map(c => c.id === id ? { ...c, ...formData } : c));
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
   // fonction pour supprimer un contact
  const handleDelete = async (id: number) => {
    setIsSubmitting(true);
    try {
      await contactService.delete(id);
      setContacts(contacts.filter(c => c.id !== id));
      setContactToDelete(null);
      setSelectedContacts(prev => prev.filter(contactId => contactId !== id));
    } catch (error) {
      console.error('Deletion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  // fonction pour supprimer plusieurs contacts
  const handleDeleteSelected = () => {
    if (selectedContacts.length === 0) return;
    setContactToDelete(-1); // Use -1 to indicate multiple deletion
  };
  // fonction pour confirmer la suppression de plusieurs contacts
  const handleDeleteSelectedConfirm = async () => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedContacts.map(id => contactService.delete(id)));
      setContacts(prev => prev.filter(c => !selectedContacts.includes(c.id)));
      setSelectedContacts([]);
      setContactToDelete(null);
    } catch (error) {
      console.error('Bulk deletion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
   // fonction pour sélectionner un contact
  const toggleSelectContact = (id: number) => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };
  // fonction pour sélectionner tous les contacts
  const toggleSelectAll = () => {
    if (selectedContacts.length === filteredAndSortedContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredAndSortedContacts.map(c => c.id));
    }
  };
  // si le chargement est en cours
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }
  // si une erreur est survenue
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
        <p className="text-lg font-medium">Erreur lors du chargement des contacts</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }
  // si tout est ok
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des contacts</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selectedContacts.length > 0 ? (
              <span>{selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} sélectionné{selectedContacts.length !== 1 ? 's' : ''}</span>
            ) : (
              <span>{filteredAndSortedContacts.length} contact{filteredAndSortedContacts.length !== 1 ? 's' : ''} trouvé{filteredAndSortedContacts.length !== 1 ? 's' : ''}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedContacts.length > 0 ? (
            <>
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer ({selectedContacts.length})
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nouveau contact
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher par nom, email, entreprise..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className={cn(
              "p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors",
              isRefreshing && "animate-spin"
            )}
            disabled={isRefreshing}
          >
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
          <div className="border-l border-gray-300 h-8" />
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors",
              viewMode === 'list' && "bg-indigo-50 border-indigo-300 text-indigo-600"
            )}
          >
            <LayoutList className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors",
              viewMode === 'grid' && "bg-indigo-50 border-indigo-300 text-indigo-600"
            )}
          >
            <LayoutGrid className="h-5 w-5" />
          </button>
          <div className="border-l border-gray-300 h-8" />
          <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5 text-gray-500" />
          </button>
          <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5 text-gray-500" />
          </button>
          <button className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors">
            <Upload className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filteredAndSortedContacts.length}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('nom')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Nom</span>
                    {sortBy === 'nom' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('client_nom')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Entreprise</span>
                    {sortBy === 'client_nom' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('poste')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Poste</span>
                    {sortBy === 'poste' && (
                      sortOrder === 'asc' ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowUpAZ className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedContacts.map((contact) => (
                <tr key={contact.id} className={cn(
                  "hover:bg-gray-50 transition-colors",
                  selectedContacts.includes(contact.id) && "bg-indigo-50"
                )}>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleSelectContact(contact.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.nom} {contact.prenom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                          title={contact.email}
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                      {contact.telephone && (
                        <a
                          href={`tel:${contact.telephone}`}
                          className="text-gray-400 hover:text-indigo-600 transition-colors"
                          title={contact.telephone}
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="h-4 w-4 mr-1 text-gray-400" />
                      {contact.client_nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contact.poste || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          setContactToEdit({
                            ...contact,
                            id: contact.id,
                            prenom: contact.prenom || undefined,
                            email: contact.email || undefined,
                            telephone: contact.telephone || undefined,
                            poste: contact.poste || undefined
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setContactToDelete(contact.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAndSortedContacts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    {search ? (
                      <div className="space-y-1">
                        <p>Aucun contact ne correspond à votre recherche</p>
                        <p className="text-xs">Essayez avec d'autres termes</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p>Aucun contact disponible</p>
                        <p className="text-xs">Commencez par ajouter un nouveau contact</p>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAndSortedContacts.map((contact) => (
            <div
              key={contact.id}
              className={cn(
                "relative group p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all",
                selectedContacts.includes(contact.id) && "ring-2 ring-indigo-500"
              )}
            >
              <div className="absolute top-2 left-2">
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact.id)}
                  onChange={() => toggleSelectContact(contact.id)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <span className="text-2xl font-semibold text-gray-600">
                    {contact.nom.charAt(0)}
                    {contact.prenom?.charAt(0)}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {contact.nom} {contact.prenom}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{contact.poste || 'Pas de poste'}</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  {contact.email && (
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title={contact.email}
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                  {contact.telephone && (
                    <a
                      href={`tel:${contact.telephone}`}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title={contact.telephone}
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Building className="h-4 w-4 mr-1 text-gray-400" />
                  {contact.client_nom}
                </div>
              </div>
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setContactToEdit({
                      ...contact,
                      id: contact.id,
                      prenom: contact.prenom || undefined,
                      email: contact.email || undefined,
                      telephone: contact.telephone || undefined,
                      poste: contact.poste || undefined
                    });
                    setIsEditModalOpen(true);
                  }}
                  className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setContactToDelete(contact.id)}
                  className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-gray-100 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredAndSortedContacts.length === 0 && (
            <div className="col-span-full py-12 text-center text-sm text-gray-500">
              {search ? (
                <div className="space-y-1">
                  <p>Aucun contact ne correspond à votre recherche</p>
                  <p className="text-xs">Essayez avec d'autres termes</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p>Aucun contact disponible</p>
                  <p className="text-xs">Commencez par ajouter un nouveau contact</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <ContactModal
          title="Nouveau contact"
          initialData={{ nom: '' }}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting}
        />
      )}

      {isEditModalOpen && (
        <ContactModal
          title="Modifier contact"
          initialData={contactToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(data) => contactToEdit.id && handleEdit(contactToEdit.id, data)}
          isSubmitting={isSubmitting}
        />
      )}

      {contactToDelete && (
        <DeleteConfirmationModal
          title={contactToDelete === -1 ? 'Supprimer les contacts sélectionnés' : 'Supprimer le contact'}
          message={
            contactToDelete === -1
              ? `Êtes-vous sûr de vouloir supprimer les ${selectedContacts.length} contacts sélectionnés ? Cette action est irréversible.`
              : 'Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible.'
          }
          onConfirm={contactToDelete === -1 ? handleDeleteSelectedConfirm : () => handleDelete(contactToDelete)}
          onCancel={() => setContactToDelete(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};