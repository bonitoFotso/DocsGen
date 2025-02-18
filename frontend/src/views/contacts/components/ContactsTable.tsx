import React, { useState } from 'react';
import { ArrowUpAZ, ArrowDownAZ, Mail, Phone, Building, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Contact, ContactEdit, ContactList } from '@/itf';



interface ContactsTableProps {
  contacts: ContactList[];
  onEdit: (id,contact: ContactEdit) => void;
  onDelete: (id: Contact['id']) => void;
  initialSortBy?: keyof Contact;
  initialSortOrder?: 'asc' | 'desc';
}

type SortableFields = 'nom' | 'client_nom' | 'poste';

const ContactsTable: React.FC<ContactsTableProps> = ({ 
  contacts = [], 
  onEdit, 
  onDelete, 
  initialSortBy = 'nom',
  initialSortOrder = 'asc' 
}) => {
  const [selectedContacts, setSelectedContacts] = useState<Contact['id'][]>([]);
  const [sortBy, setSortBy] = useState<SortableFields>(initialSortBy as SortableFields);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);
  const [search, setSearch] = useState<string>('');

  const handleSort = (field: SortableFields): void => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.checked) {
      setSelectedContacts(filteredAndSortedContacts.map(c => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const toggleSelectContact = (id: Contact['id']): void => {
    setSelectedContacts(prev => 
      prev.includes(id) 
        ? prev.filter(contactId => contactId !== id)
        : [...prev, id]
    );
  };

  const filteredAndSortedContacts = [...contacts]
    .filter(contact => {
      if (!search) return true;
      const searchLower = search.toLowerCase();
      return (
        contact.nom?.toLowerCase().includes(searchLower) ||
        contact.prenom?.toLowerCase().includes(searchLower) ||
        contact.client_nom?.toLowerCase().includes(searchLower) ||
        contact.poste?.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const aValue = String(a[sortBy]).toLowerCase();
      const bValue = String(b[sortBy]).toLowerCase();
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const renderSortIcon = (field: SortableFields) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' 
      ? <ArrowDownAZ className="h-4 w-4" /> 
      : <ArrowUpAZ className="h-4 w-4" />;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 bg-white border-b border-gray-200">
        <input
          type="search"
          placeholder="Rechercher un contact..."
          className="w-full p-2 border border-gray-300 rounded-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedContacts.length === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0}
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
                {renderSortIcon('nom')}
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
                {renderSortIcon('client_nom')}
              </div>
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('poste')}
            >
              <div className="flex items-center space-x-1">
                <span>Poste</span>
                {renderSortIcon('poste')}
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
                  {contact.client_nom || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {contact.poste || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => onEdit(contact)}
                    className="text-gray-400 hover:text-indigo-600 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(contact.id)}
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
  );
};

export default ContactsTable;