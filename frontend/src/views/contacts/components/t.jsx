import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Building2,
  MapPin,
  Briefcase,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import { _ } from 'lodash';
import { useServices } from '@/AppHooks';
import ContactsTable from './ContactsTable2'; // Corrected import path
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ClientSearch from './ClientSearch';
import ContactModal from '../ContactModal';
import { ContactEdit } from '@/itf';

export interface Contact {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  poste: string;
  service: string;
  role_achat: string;
}

export interface Client {
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
}

interface SortConfig {
  key: keyof Client | null;
  direction: 'asc' | 'desc';
}

// Subcomponents
const TableHeader = ({ 
  label, 
  sortKey, 
  sortConfig, 
  onSort 
}: { 
  label: string; 
  sortKey?: keyof Client;
  sortConfig: SortConfig;
  onSort: (key: keyof Client) => void;
}) => (
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


const ClientTable = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupBy, setGroupBy] = useState<string>('');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
      const [isSubmitting, setIsSubmitting] = React.useState(false);
        const { contactService } = useServices();
        const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVilles, setSelectedVilles] = useState<string[]>([]);
  const { clientService } = useServices();
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [contactToEdit, setContactToEdit] = React.useState<ContactEdit & { id?: number }>({ nom: '' });
    const [contactToDelete, setContactToDelete] = React.useState<number | null>(null);
  
    
  
    const handleCreate = async (formData: ContactEdit) => {
        setIsSubmitting(true);
        try {
          await contactService.create(formData);
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategories(prev => [...prev, category]);
  };

  const handleCategoryRemove = (category: string) => {
    setSelectedCategories(prev => prev.filter(c => c !== category));
  };

  const handleVilleSelect = (ville: string) => {
    setSelectedVilles(prev => [...prev, ville]);
  };

  const handleVilleRemove = (ville: string) => {
    setSelectedVilles(prev => prev.filter(v => v !== ville));
  };

  const handleSecteurSelect = (secteur: string) => {
    setSelectedSecteurs(prev => [...prev, secteur]);
  };

  const [selectedSecteurs, setSelectedSecteurs] = useState<string[]>([]);

  const handleSecteurRemove = (secteur: string) => {
    setSelectedSecteurs(prev => prev.filter(s => s !== secteur));
  };



  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await clientService.getAllcc();
        setClients(response);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [clientService]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set(clients.map(client => client.categorie?.nom).filter((nom): nom is string => Boolean(nom)));
    return Array.from(categories);
  }, [clients]);

  const uniqueVilles = useMemo(() => {
    const villes = new Set(clients.map(client => client.ville.nom));
    return Array.from(villes);
  }, [clients]);

  const uniqueSecteur = useMemo(() => {
    const secteurs = new Set(clients.map(client => client.secteur_activite));
    return Array.from(secteurs);
  }, [clients]);

  const toggleRow = (clientId: number) => {
    setExpandedRows(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSort = (key: keyof Client) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedClients = useMemo(() => {
    const filtered = clients.filter(client => {
      const searchFields = [
        client.nom,
        client.secteur_activite,
        client.ville.nom
      ].map(field => field.toLowerCase());
      
      const matchesSearch = searchFields.some(field => 
        field.includes(searchTerm.toLowerCase())
      );
      
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.includes(client.categorie?.nom || 'Non catégorisé');
      
      const matchesVilles = selectedVilles.length === 0 || 
        selectedVilles.includes(client.ville.nom);

        const matchesSecteurs = selectedSecteurs.length === 0 ||
        selectedSecteurs.includes(client.secteur_activite);

      return matchesSearch && matchesCategories && matchesVilles && matchesSecteurs;
    });

    if (sortConfig.key) {
      const compareValues = (a: string | number | boolean, b: string | number | boolean) => {
        if (a < b) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a > b) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      };

      filtered.sort((a, b) => {
        const key = sortConfig.key as keyof Client;
        const aValue = key === 'categorie' ? a.categorie?.nom || '' 
                    : key === 'ville' ? a.ville.nom 
                    : a[key];
        const bValue = key === 'categorie' ? b.categorie?.nom || ''
                    : key === 'ville' ? b.ville.nom
                    : b[key];
        return compareValues(aValue, bValue);
      });
    }

    return filtered;
  }, [clients, sortConfig.key, sortConfig.direction, selectedCategories, selectedVilles, selectedSecteurs, searchTerm]);

  const getGroupValue = (client: Client, groupType: string) => {
    switch (groupType) {
      case 'categorie':
        return client.categorie?.nom || 'Non catégorisé';
      case 'ville':
        return client.ville.nom;
      case 'secteur':
        return client.secteur_activite;
      default:
        return 'Tous les clients';
    }
  };

  const groupedClients: Record<string, Client[]> = useMemo(() => {
    return groupBy
      ? _.groupBy(filteredAndSortedClients, (client: Client) => getGroupValue(client, groupBy))
      : { 'Tous les clients': filteredAndSortedClients };
  }, [filteredAndSortedClients, groupBy]);

  const renderGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'categorie':
        return <Building2 className="w-4 h-4" />;
      case 'ville':
        return <MapPin className="w-4 h-4" />;
      case 'secteur':
        return <Briefcase className="w-4 h-4" />;
      default:
        return null;
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des contacts</h1>
          
        </div>
        
            <button
                          onClick={() => setIsCreateModalOpen(true)}

              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />

              Nouveau contact
            </button>
      </div>
      {/* Search and filters */}
      <ClientSearch 
  searchTerm={searchTerm}
  onSearchChange={handleSearchChange}
  selectedCategories={selectedCategories}
  selectedVilles={selectedVilles}
  selectedSecteurs={selectedSecteurs}
  onCategorySelect={handleCategorySelect}
  onVilleSelect={handleVilleSelect}
  onSecteurSelect={handleSecteurSelect}
  onCategoryRemove={handleCategoryRemove}
  onVilleRemove={handleVilleRemove}
  onSecteurRemove={handleSecteurRemove}
  uniqueCategories={uniqueCategories}
  uniqueVilles={uniqueVilles}
  uniqueSecteurs={uniqueSecteur}
/>

      {/* Client groups */}
      {Object.entries(groupedClients).map(([group, groupClients]) => (
        <Card key={group}>
          <div className="bg-muted p-4 font-medium flex items-center gap-2">
            {renderGroupIcon(groupBy)}
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
                    <tr className={`
        transition-colors hover:bg-muted/50
        ${client.agreer ? 'bg-green-100' : ''}
      `}
      onClick={() => toggleRow(client.id)}
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



export default ClientTable;