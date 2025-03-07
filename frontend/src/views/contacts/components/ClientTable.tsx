import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Users,
  Building2,
  MapPin,
  Briefcase,
  ArrowUpDown,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import _ from 'lodash';
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
import { toast } from 'sonner';
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

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
  onClose: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry, onClose }) => (
  <AlertDialog open={true}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Erreur
        </AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        {onRetry && (
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        )}
        <AlertDialogAction onClick={onClose}>Fermer</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

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
          {isSubmitting ? 'Suppression...' : 'Supprimer'}
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<ContactEdit & { id?: number }>({ nom: '' });
  const [contactToDelete, setContactToDelete] = useState<string | number | null>(null);
  const [currentAction, setCurrentAction] = useState<'create' | 'edit' | 'delete' | null>(null);

  const { clientService, contactService } = useServices();

  const {
    selectedFilters,
    handleSelect,
    handleRemove
  } = useFilters();

  // Contact CRUD operations with improved error handling
  const handleCreate = async (formData: ContactEdit) => {
    setIsSubmitting(true);
    setCurrentAction('create');
    try {
      if (!formData.nom || formData.nom.trim() === '') {
        throw new Error("Le nom du contact est requis");
      }
      
      // Email validation if provided
      if (formData.email && !validateEmail(formData.email)) {
        throw new Error("L'adresse email n'est pas valide");
      }

      await contactService.create(formData);
      await refreshClients();
      setIsCreateModalOpen(false);
      toast.success('Contact créé avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la création du contact";
      setActionError(errorMessage);
      toast.error('Erreur lors de la création', {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      setCurrentAction(null);
    }
  };

  const handleEdit = async (id: number, formData: ContactEdit) => {
    setIsSubmitting(true);
    setCurrentAction('edit');
    try {
      if (!id) {
        throw new Error("ID du contact manquant");
      }
      
      if (!formData.nom || formData.nom.trim() === '') {
        throw new Error("Le nom du contact est requis");
      }
      
      // Email validation if provided
      if (formData.email && !validateEmail(formData.email)) {
        throw new Error("L'adresse email n'est pas valide");
      }

      await contactService.update(id, formData);
      await refreshClients();
      setIsEditModalOpen(false);
      toast.success('Contact mis à jour avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour du contact";
      setActionError(errorMessage);
      toast.error('Erreur lors de la mise à jour', {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      setCurrentAction(null);
    }
  };

  const handleDelete = async (id: string | number) => {
    setIsSubmitting(true);
    setCurrentAction('delete');
    try {
      if (!id) {
        throw new Error("ID du contact manquant");
      }
      
      await contactService.delete(id);
      await refreshClients();
      setContactToDelete(null);
      toast.success('Contact supprimé avec succès');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue lors de la suppression du contact";
      setActionError(errorMessage);
      toast.error('Erreur lors de la suppression', {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      setCurrentAction(null);
    }
  };

  // Email validation helper
  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  // Client data loading with improved error handling
  const refreshClients = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await clientService.getAllcc();
      if (!Array.isArray(response)) {
        throw new Error("Format de réponse invalide");
      }
      setClients(response);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de charger les données clients";
      setLoadError(errorMessage);
      toast.error('Erreur de chargement', {
        description: errorMessage
      });
      return false;
    }
  }, [clientService]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await refreshClients();
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [refreshClients]);

  // Handle network errors and retries
  const handleConnectionError = () => {
    if (navigator.onLine) {
      toast.error('Problème de connexion au serveur', {
        description: 'Vérifiez que le serveur est accessible'
      });
    } else {
      toast.error('Pas de connexion Internet', {
        description: 'Vérifiez votre connexion réseau'
      });
    }
  };

  // Safe access for nested properties to prevent type errors
  const safeGetProperty = (obj: any, path: string, defaultValue: any = ''): any => {
    return _.get(obj, path, defaultValue);
  };

  // Memoized values
  const uniqueCategories = useMemo(() => {
    try {
      const categories = new Set(
        clients
          .map(client => safeGetProperty(client, 'categorie.nom'))
          .filter(nom => Boolean(nom) && typeof nom === 'string')
      );
      return Array.from(categories);
    } catch (error) {
      console.error('Error processing categories:', error);
      return [];
    }
  }, [clients]);

  const uniqueVilles = useMemo(() => {
    try {
      const villes = new Set(
        clients
          .map(client => safeGetProperty(client, 'ville.nom'))
          .filter(nom => Boolean(nom))
      );
      return Array.from(villes);
    } catch (error) {
      console.error('Error processing villes:', error);
      return [];
    }
  }, [clients]);

  const uniqueSecteurs = useMemo(() => {
    try {
      const secteurs = new Set(
        clients
          .map(client => client.secteur_activite)
          .filter(secteur => Boolean(secteur))
      );
      return Array.from(secteurs);
    } catch (error) {
      console.error('Error processing secteurs:', error);
      return [];
    }
  }, [clients]);

  // Filter and sort logic with improved error handling
  const filteredAndSortedClients = useMemo(() => {
    try {
      // First ensure all clients have valid data structure
      const validClients = clients.filter(client => {
        return (
          client && 
          typeof client === 'object' && 
          client.nom && 
          client.ville && 
          typeof client.ville === 'object'
        );
      });

      const filtered = validClients.filter(client => {
        try {
          const searchFields = [
            safeGetProperty(client, 'nom', ''),
            safeGetProperty(client, 'secteur_activite', ''),
            safeGetProperty(client, 'ville.nom', ''),
            safeGetProperty(client, 'ville.region_nom', ''),
            safeGetProperty(client, 'categorie.nom', ''),
            safeGetProperty(client, 'c_num', ''),
          ].map(field => String(field).toLowerCase());
          
          const matchesSearch = searchFields.some(field => 
            field.includes(searchTerm.toLowerCase())
          );
          
          const matchesCategories = !selectedFilters.categories.length || 
            (client.categorie && selectedFilters.categories.includes(client.categorie.nom));
            
          const matchesVilles = !selectedFilters.villes.length || 
            selectedFilters.villes.includes(client.ville.nom);
            
          const matchesSecteurs = !selectedFilters.secteurs.length || 
            selectedFilters.secteurs.includes(client.secteur_activite);
    
          return matchesSearch && matchesCategories && matchesVilles && matchesSecteurs;
        } catch (error) {
          console.error('Error filtering client:', error, client);
          return false;
        }
      });
      
      if (sortConfig.key) {
        return _.orderBy<Client>(
          filtered,
          [(client: Client): string => {
            try {
              const key: keyof Client = sortConfig.key as keyof Client;
              if (key === 'categorie') {
                return safeGetProperty(client, 'categorie.nom', '').toLowerCase();
              } else if (key === 'ville') {
                return safeGetProperty(client, 'ville.nom', '').toLowerCase();
              } else {
                return String(client[key] || '').toLowerCase();
              }
            } catch (error) {
              console.error('Error sorting client:', error, client);
              return '';
            }
          }],
          [sortConfig.direction]
        );
      }
  
      return filtered;
    } catch (error) {
      console.error('Error in filteredAndSortedClients:', error);
      return [];
    }
  }, [clients, sortConfig, searchTerm, selectedFilters]);

  const handleSort = (key: keyof Client) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Group clients based on selected grouping
  const groupedClients: Record<string, Client[]> = useMemo(() => {
    try {
      const getGroupValue = (client: Client): string => {
        try {
          switch (groupBy) {
            case 'categorie':
              return safeGetProperty(client, 'categorie.nom', 'Non catégorisé');
            case 'ville_nom':
              return safeGetProperty(client, 'ville.nom', 'Inconnue');
            case 'secteur':
              return client.secteur_activite || 'Non spécifié';
            case 'region':
              return safeGetProperty(client, 'ville.region_nom', 'Inconnue');
            case 'entreprise':
              return client.nom || 'Sans nom';
            default:
              return 'Tous les clients';
          }
        } catch (error) {
          console.error('Error getting group value:', error, client);
          return 'Erreur';
        }
      };
  
      if (groupBy === 'none') {
        return { 'Tous les clients': filteredAndSortedClients };
      }
      
      return _.groupBy(filteredAndSortedClients, getGroupValue);
    } catch (error) {
      console.error('Error in groupedClients:', error);
      return { 'Erreur de groupement': [] };
    }
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

  if (loadError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold">Erreur de chargement</h3>
            <p>{loadError}</p>
            <Button 
              onClick={() => {
                setLoading(true);
                refreshClients().finally(() => setLoading(false));
              }}
              className="flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
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

      {/* No results message */}
      {Object.values(groupedClients).every(group => group.length === 0) && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Aucun client ne correspond aux critères de recherche.</p>
          </CardContent>
        </Card>
      )}

      {/* Client groups */}
      {Object.entries(groupedClients).map(([group, groupClients]) => (
        groupClients.length > 0 && (
          <Card key={group}>
            <div className="bg-muted p-4 font-medium flex items-center gap-2">
              {(() => {
                switch (groupBy) {
                  case 'categorie': return <Building2 className="w-4 h-4" />;
                  case 'ville_nom': return <MapPin className="w-4 h-4" />;
                  case 'secteur': return <Briefcase className="w-4 h-4" />;
                  case 'region': return <MapPin className="w-4 h-4" />;
                  case 'entreprise': return <Building2 className="w-4 h-4" />;
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
                          <div>{safeGetProperty(client, 'ville.nom', 'N/A')}</div>
                          <div className="text-sm text-muted-foreground">
                            {safeGetProperty(client, 'ville.region_nom', 'N/A')}
                          </div>
                        </td>
                        <td className="p-4">{client.secteur_activite || 'N/A'}</td>
                        <td className="p-4">
                          <Badge variant="outline">
                            {safeGetProperty(client, 'categorie.nom', 'Non catégorisé')}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{client.nom || 'Sans nom'}</div>
                          <div className="text-sm text-muted-foreground">{client.c_num || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div>{client.entite || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Users className="w-4 h-4" />
                            {Array.isArray(client.contacts) ? client.contacts.length : 0}
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
                              {Array.isArray(client.contacts) && client.contacts.length > 0 ? (
                                <ContactsTable 
                                  contacts={client.contacts} 
                                  itemsPerPage={5}
                                  onEdit={(contact) => {
                                    setContactToEdit({ ...contact });
                                    setIsEditModalOpen(true);
                                  }}
                                  onDelete={(id) => setContactToDelete(id)}
                                />
                              ) : (
                                <p className="text-muted-foreground">Aucun contact disponible.</p>
                              )}
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
        )
      ))}

      {/* Modals */}
      {isCreateModalOpen && (
        <ContactModal
          title="Nouveau contact"
          initialData={{ nom: '' }}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
          isSubmitting={isSubmitting && currentAction === 'create'}
        />
      )}

      {isEditModalOpen && (
        <ContactModal
          title="Modifier contact"
          initialData={contactToEdit}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(data) => contactToEdit.id && handleEdit(contactToEdit.id, data)}
          isSubmitting={isSubmitting && currentAction === 'edit'}
        />
      )}

      {contactToDelete && (
        <DeleteConfirmationModal
          title="Supprimer le contact"
          message="Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible."
          onConfirm={() => handleDelete(contactToDelete)}
          onCancel={() => setContactToDelete(null)}
          isSubmitting={isSubmitting && currentAction === 'delete'}
        />
      )}

      {actionError && (
        <ErrorAlert
          message={actionError}
          onClose={() => setActionError(null)}
          onRetry={() => {
            setActionError(null);
            switch (currentAction) {
              case 'create':
                // Retry logic for create
                break;
              case 'edit':
                // Retry logic for edit
                break;
              case 'delete':
                // Retry logic for delete
                break;
              default:
                break;
            }
          }}
        />
      )}
    </div>
  );
};

export default ClientTable;