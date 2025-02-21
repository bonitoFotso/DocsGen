import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Building2,
  MapPin,
  Briefcase,
  ArrowUpDown,
} from 'lucide-react';
import _  from 'lodash';
import { useServices } from '@/AppHooks';
import ContactsTable from './ContactsTable2';
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ClientSearch from './ClientSearch';
import ContactModal from '../ContactModal';
import { ContactEdit } from '@/itf';

import { useFilters } from '@/hooks/useFilters';

interface Contact {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  service: string;
  role_achat: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface Client {
  id: number;
  nom: string;
  c_num: string;
  email: string;
  telephone: string;
  matricule: string;
  categorie: {
    id: number;
    nom: string;
  } | null;
  ville: {
    id: number;
    nom: string;
    region_nom: string;
    pays_nom: string;
  };
  secteur_activite: string;
  contacts: Contact[];
  agreer: boolean;
  entite: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface SortConfig {
  key: keyof Client | null;
  direction: 'asc' | 'desc';
}

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  isSubmitting
}) => (
  <AlertDialog open={true}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel} disabled={isSubmitting}>
          Annuler
        </AlertDialogCancel>
        <AlertDialogAction 
          onClick={onConfirm}
          disabled={isSubmitting}
          className="bg-red-600 hover:bg-red-700"
        >
          Supprimer
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const TableHeader: React.FC<{
  label: string;
  sortKey?: keyof Client;
  sortConfig: SortConfig;
  onSort: (key: keyof Client) => void;
}> = ({ label, sortKey, sortConfig, onSort }) => (
  <th className="p-4 text-left">
    <button
      className="flex items-center gap-2 hover:text-gray-700"
      onClick={() => sortKey && onSort(sortKey)}
    >
      {label}
      {sortKey && (
        <ArrowUpDown className={`w-4 h-4 ${
          sortConfig.key === sortKey ? 'text-primary' : 'text-gray-400'
        }`} />
      )}
    </button>
  </th>
);

const ClientTable: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'region' | 'ville_nom' | 'entreprise' | 'secteur' | 'categorie'>('none');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ContactEdit & { id?: number }>({ nom: '' });
  const [contactToDelete, setContactToDelete] = useState<string | number | null>(null);

  const { clientService, contactService } = useServices();

  const {
    selectedFilters,
    handleSelect,
    handleRemove
  } = useFilters();

  // Contact CRUD operations
  const handleCreate = async (formData: ContactEdit) => {
    setIsSubmitting(true);
    try {
      await contactService.create(formData);
      await refreshClients();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number, formData: ContactEdit) => {
    setIsSubmitting(true);
    console.log('handleform', formData);
    try {
      await contactService.update(id, formData);
      await refreshClients();
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    setIsSubmitting(true);
    try {
      await contactService.delete(id);
      await refreshClients();
      setContactToDelete(null);
    } catch (error) {
      console.error('Deletion error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Client data loading
  const refreshClients = useCallback(async () => {
    try {
      const response = await clientService.getAllcc();
      setClients(response);
    } catch (error) {
      console.error('Error refreshing clients:', error);
    }
  }, [clientService]);

  useEffect(() => {
    refreshClients().finally(() => setLoading(false));
  }, [clientService, refreshClients]);

  // Memoized values
  const uniqueCategories = useMemo(() => {
    const categories = new Set(clients.map(client => client.categorie?.nom).filter((nom): nom is string => Boolean(nom)));
    return Array.from(categories);
  }, [clients]);

  const uniqueVilles = useMemo(() => {
    const villes = new Set(clients.map(client => client.ville.nom));
    return Array.from(villes);
  }, [clients]);

  const uniqueSecteurs = useMemo(() => {
    const secteurs = new Set(clients.map(client => client.secteur_activite));
    return Array.from(secteurs);
  }, [clients]);

  // Filter and sort logic
  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter(client => {
      const searchFields = [
        client.nom,
        client.secteur_activite,
        client.ville.nom,
        client.ville.region_nom,
        client.categorie?.nom || '',
        client.c_num,
        
        // client.entite,
      ].map(field => field.toLowerCase());
      
      const matchesSearch = searchFields.some(field => 
        field.includes(searchTerm.toLowerCase())
      );
      
     

      return matchesSearch;
    });
    

    if (sortConfig.key) {

      return _.orderBy<Client>(
        filtered,
        [(client: Client): string => {
          const key: keyof Client = sortConfig.key as keyof Client;
          return key === 'categorie' 
            ? client.categorie?.nom?.toLowerCase() || '' 
            : key === 'ville'
            ? client.ville.nom.toLowerCase()
            : String(client[key]).toLowerCase();
        }],
        [sortConfig.direction]
      );
    }

    return filtered;
  }, [clients, sortConfig, searchTerm]);

  const handleSort = (key: keyof Client) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Group clients based on selected grouping
  const groupedClients: Record<string, Client[]> = useMemo(() => {
    const getGroupValue = (client: Client) => {
      switch (groupBy) {
        case 'categorie':
          return client.categorie?.nom || 'Non catégorisé';
        case 'ville_nom':
          return client.ville.nom;
        case 'secteur':
          return client.secteur_activite;
        case 'region':
          return client.ville.region_nom;
        case 'entreprise':
          return client.nom;
        default:
          return 'Tous les clients';
      }
    };

    return groupBy
      ? _.groupBy(filteredAndSortedClients, getGroupValue)
      : { 'Tous les clients': filteredAndSortedClients };
  }, [filteredAndSortedClients, groupBy]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      

      {/* Search and filters */}
      <ClientSearch 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategories={selectedFilters.categories}
        selectedVilles={selectedFilters.villes}
        selectedSecteurs={selectedFilters.secteurs}
        onCategorySelect={(category) => handleSelect('categories', category)}
        onVilleSelect={(ville) => handleSelect('villes', ville)}
        onSecteurSelect={(secteur) => handleSelect('secteurs', secteur)}
        onCategoryRemove={(category) => handleRemove('categories', category)}
        onVilleRemove={(ville) => handleRemove('villes', ville)}
        onSecteurRemove={(secteur) => handleRemove('secteurs', secteur)}
        uniqueCategories={uniqueCategories}
        uniqueVilles={uniqueVilles}
        uniqueSecteurs={uniqueSecteurs}
        setGroupBy={setGroupBy}
        groupBy={groupBy}

      />

      {/* Client groups */}
      {Object.entries(groupedClients).map(([group, groupClients]) => (
        <Card key={group}>
          <div className="bg-muted p-4 font-medium flex items-center gap-2">
            {(() => {
              switch (groupBy) {
                case 'categorie': return <Building2 className="w-4 h-4" />;
                case 'ville_nom': return <MapPin className="w-4 h-4" />;
                case 'secteur': return <Briefcase className="w-4 h-4" />;
                default: return null;
              }
            })()}
            <span>{group}</span>
            <Badge variant="secondary">
              {groupClients.length} client{groupClients.length > 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <TableHeader 
                    label="Ville" 
                    sortKey="ville"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <TableHeader 
                    label="Secteur" 
                    sortKey="secteur_activite"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <TableHeader 
                    label="Catégorie" 
                    sortKey="categorie"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <TableHeader 
                    label="Nom" 
                    sortKey="nom"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <TableHeader 
                    label="Entite" 
                    sortKey="entite"
                    sortConfig={sortConfig}
                    onSort={handleSort}
                  />
                  <th className="p-4 text-left">Contacts</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {groupClients.map((client) => (
                  <React.Fragment key={client.id}>
                    <tr 
                      className={`
                        transition-colors hover:bg-muted/50
                        ${client.agreer ? 'bg-green-100' : ''}
                      `}
                      onClick={() => setExpandedRows(prev =>
                        prev.includes(client.id)
                          ? prev.filter(id => id !== client.id)
                          : [...prev, client.id]
                      )}
                    >
                      <td className="p-4">
                        <div>{client.ville.nom}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.ville.region_nom}
                        </div>
                      </td>
                      <td className="p-4">{client.secteur_activite}</td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {client.categorie?.nom || 'Non catégorisé'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{client.nom}</div>
                        <div className="text-sm text-muted-foreground">{client.c_num}</div>
                      </td>
                      <td className="p-4">
                        <div>{client.entite}</div>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Users className="w-4 h-4" />
                          {client.contacts.length}
                        </Button>
                      </td>
                    </tr>
                    {expandedRows.includes(client.id) && (
                      <tr>
                        <td colSpan={6} className="p-4 bg-muted/50">
                          <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Liste des contacts
                            </h3>
                            <ContactsTable 
                              contacts={client.contacts} 
                              itemsPerPage={5}
                              onEdit={(contact) => {
                                setContactToEdit({ ...contact });
                                setIsEditModalOpen(true);
                              }}
                              onDelete={(id) => setContactToDelete(id)}
                            />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

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
          title="Supprimer le contact"
          message="Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible."
          onConfirm={() => handleDelete(contactToDelete)}
          onCancel={() => setContactToDelete(null)}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default ClientTable;

