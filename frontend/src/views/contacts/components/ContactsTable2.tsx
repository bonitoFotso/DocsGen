import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from "@/components/ui/input";

interface Contact {
  id: string | number;
  nom: string;
  prenom: string;
  poste?: string;
  service?: string;
  email: string;
  telephone?: string;
  role_achat?: string;
  site?: string;
}

interface SortConfig {
  key: keyof Contact | null;
  direction: 'asc' | 'desc';
}

interface ContactsTableProps {
  contacts: Contact[];
  itemsPerPage: number;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  // Fonction de tri
  const handleSort = (key: keyof Contact) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Filtrage et tri des contacts
  const filteredAndSortedContacts = useMemo(() => {
    let filtered = contacts.filter(contact => {
      const searchStr = searchTerm.toLowerCase();
      return (
        `${contact.nom} ${contact.prenom}`.toLowerCase().includes(searchStr) ||
        contact.email.toLowerCase().includes(searchStr) ||
        (contact.service || '').toLowerCase().includes(searchStr) ||
        (contact.poste || '').toLowerCase().includes(searchStr)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = (a[sortConfig.key!] || '').toString().toLowerCase();
        const bValue = (b[sortConfig.key!] || '').toString().toLowerCase();
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [contacts, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedContacts.length / itemsPerPage);
  const currentContacts = filteredAndSortedContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const SortIcon = ({ column }: { column: keyof Contact }) => {
    if (sortConfig.key !== column) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const TableHeader = ({ column, label }: { column: keyof Contact, label: string }) => (
    <th 
      scope="col" 
      className="p-3 text-left border-b bg-gray-50 cursor-pointer group"
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center gap-1 select-none">
        {label}
        <span className="transition-opacity">
          <SortIcon column={column} />
        </span>
      </div>
    </th>
  );

  return (
    <div className="space-y-4 bg-white rounded-lg shadow">
      {/* Barre de recherche */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher un contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead>
            <tr>
              <TableHeader column="site" label="Site" />
              <TableHeader column="nom" label="Nom" />
              <TableHeader column="poste" label="Poste" />
              <TableHeader column="service" label="Service" />
              <TableHeader column="email" label="Email" />
              <TableHeader column="telephone" label="Téléphone" />
              <TableHeader column="role_achat" label="Rôle Achat" />
            </tr>
          </thead>
          <tbody>
            {currentContacts.map((contact) => (
              <tr 
                key={contact.id} 
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-3 border-b">
                  <div className="font-medium">{contact.site || 'N/A'}</div>
                </td>
                <td className="p-3 border-b">
                  <div className="font-medium">{contact.nom} {contact.prenom}</div>
                </td>
                <td className="p-3 border-b text-gray-600">
                  {contact.poste || 'N/A'}
                </td>
                <td className="p-3 border-b text-gray-600">
                  {contact.service || 'N/A'}
                </td>
                <td className="p-3 border-b">
                  <a 
                    href={`mailto:${contact.email}`} 
                    className="text-blue-600 hover:underline flex items-center gap-1"
                    aria-label={`Envoyer un email à ${contact.nom} ${contact.prenom}`}
                  >
                    {contact.email}
                  </a>
                </td>
                <td className="p-3 border-b">
                  <a 
                    href={`tel:${contact.telephone}`} 
                    className="text-blue-600 hover:underline flex items-center gap-1"
                    aria-label={`Appeler ${contact.nom} ${contact.prenom}`}
                  >
                    {contact.telephone || 'N/A'}
                  </a>
                </td>
                <td className="p-3 border-b text-gray-600">
                  {contact.role_achat || 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination et résumé */}
      <div className="px-4 py-3 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredAndSortedContacts.length} contacts trouvés
          </div>
          
          {totalPages > 1 && (
            <nav className="flex items-center gap-4" aria-label="Navigation des pages">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Page précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Page suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactsTable;