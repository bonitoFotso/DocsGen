import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  PlusCircle,
  Download,
  Filter,
  Mail,
  Phone,
  MessageSquare,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import KDTable from './t2';

// Exemple de type de données
interface Contact {
  id: number;
  region: string;
  ville_nom: string;
  entreprise: string;
  secteur: string;
  categorie: string;
  prenom: string | null;
  nom: string;
  poste: string | null;
  service: string | null;
  role_achat: string | null;
  telephone: string | null;
  email: string;
  status: 'actif' | 'inactif' | 'archivé';
  derniere_interaction: string | null;
  date_creation: string;
  notes: string | null;
}

// Service fictif pour simuler un appel API
const fetchContacts = async (): Promise<Contact[]> => {
  // Simuler un délai de chargement
  await new Promise(resolve => setTimeout(resolve, 800));

  // Générer des données fictives
  return Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    region: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur', 'Hauts-de-France'][Math.floor(Math.random() * 4)],
    ville_nom: ['Paris', 'Lyon', 'Marseille', 'Lille', 'Bordeaux', 'Toulouse'][Math.floor(Math.random() * 6)],
    entreprise: ['TechSolutions', 'EcoInnovate', 'DigitalWave', 'GreenTech', 'SmartSystems'][Math.floor(Math.random() * 5)],
    secteur: ['Technologie', 'Santé', 'Finance', 'Éducation', 'Industrie'][Math.floor(Math.random() * 5)],
    categorie: ['Premium', 'Standard', 'Basique'][Math.floor(Math.random() * 3)],
    prenom: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Thomas', 'Emma'][Math.floor(Math.random() * 6)],
    nom: ['Dupont', 'Martin', 'Durand', 'Lefebvre', 'Bernard', 'Petit'][Math.floor(Math.random() * 6)],
    poste: ['Directeur', 'Responsable', 'Développeur', 'Designer', 'Consultant'][Math.floor(Math.random() * 5)],
    service: ['Commercial', 'Marketing', 'R&D', 'Ressources Humaines', 'Finance'][Math.floor(Math.random() * 5)],
    role_achat: ['Acheteur', 'Décideur', 'Influenceur', null][Math.floor(Math.random() * 4)],
    telephone: Math.random() > 0.2 ? `0${Math.floor(Math.random() * 9) + 1}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}` : null,
    email: `${['contact', 'info', 'support', 'commercial', 'service'][Math.floor(Math.random() * 5)]}@${['example.com', 'demo.fr', 'test.net', 'company.org'][Math.floor(Math.random() * 4)]}`,
    status: ['actif', 'inactif', 'archivé'][Math.floor(Math.random() * 3)] as 'actif' | 'inactif' | 'archivé',
    derniere_interaction: Math.random() > 0.3 ? new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    date_creation: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: Math.random() > 0.7 ? 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.' : null,
  }));
};

const ContactsTableExample = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    status: string[];
    categorie: string[];
  }>({
    status: [],
    categorie: []
  });

  // Charger les données
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchContacts();
      setContacts(data);

      toast("Contacts chargés", {
        description: `${data.length} contacts ont été chargés avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      toast("Erreur lors du chargement des contacts", {
        description: "Impossible de charger les contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Définition des colonnes avec rendu personnalisé
  const columns = [
    { 
      key: 'status', 
      label: 'Statut',
      render: (row: Contact) => {
        const statusConfig = {
          actif: { bg: 'bg-green-100', text: 'text-green-800', label: 'Actif' },
          inactif: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactif' },
          archivé: { bg: 'bg-red-100', text: 'text-red-800', label: 'Archivé' }
        };
        
        const status = row.status || 'Inconnu';
        const config = statusConfig[status as keyof typeof statusConfig] || { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800', 
          label: status 
        };
        
        return (
          <Badge variant="outline" className={`${config.bg} ${config.text} px-2 py-1`}>
            {config.label}
          </Badge>
        );
      }
    },
    {
      key: 'nom',
      label: 'Nom',
      render: (row: Contact) => (
        <div className="font-medium">{row.nom}</div>
      )
    },
    { key: 'prenom', label: 'Prénom' },
    {
      key: 'entreprise',
      label: 'Entreprise',
      render: (row: Contact) => (
        <div className="font-medium">{row.entreprise}</div>
      )
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (row: Contact) => {
        const catConfig = {
          Premium: { bg: 'bg-purple-100', text: 'text-purple-800' },
          Standard: { bg: 'bg-blue-100', text: 'text-blue-800' },
          Basique: { bg: 'bg-gray-100', text: 'text-gray-800' }
        };
        const config = catConfig[row.categorie as keyof typeof catConfig] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        return (
          <Badge variant="outline" className={`${config.bg} ${config.text} px-2 py-1`}>
            {row.categorie}
          </Badge>
        );
      }
    },
    { key: 'secteur', label: 'Secteur' },
    { key: 'ville_nom', label: 'Ville' },
    { key: 'region', label: 'Région', hidden: true },
    { key: 'poste', label: 'Poste', hidden: true },
    { key: 'service', label: 'Service', hidden: true },
    
    {
      key: 'email',
      label: 'Email',
      width: '200px',
      render: (row: Contact) => (
        <div className="flex items-center">
          <a href={`mailto:${row.email}`} className="text-blue-600 hover:underline flex items-center">
            <Mail size={14} className="mr-1" />
            {row.email}
          </a>
        </div>
      )
    },
    
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      width: '100px',
      align: 'center',
      render: (row: Contact) => (
        <div className="flex justify-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(row);
            }}
          >
            <MessageSquare size={16} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  toast("Édition", {
                    description: `Édition de ${row.prenom || ''} ${row.nom}`,
                  });
                }}
              >
                <Edit size={14} className="mr-2" />
                Modifier
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  toast("Email envoyé", {
                    description: `Email envoyé à ${row.email}`,
                  });
                }}
              >
                <Mail size={14} className="mr-2" />
                Envoyer un email
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row);
                }}
              >
                <Trash2 size={14} className="mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  // Options de groupement
  const groupByOptions = [
    { key: 'status', label: 'Par Statut' },
    { key: 'region', label: 'Par Région' },
    { key: 'secteur', label: 'Par Secteur' },
    { key: 'categorie', label: 'Par Catégorie' },
    { key: 'entreprise', label: 'Par Entreprise' }
  ];

  // Gérer les filtres
  const handleFilterChange = (type: 'status' | 'categorie', value: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[type].includes(value)) {
        newFilters[type] = newFilters[type].filter(v => v !== value);
      } else {
        newFilters[type] = [...newFilters[type], value];
      }
      return newFilters;
    });
  };

  // Filtrer les contacts selon les filtres actifs
  const filteredContacts = contacts.filter(contact => {
    // Filtrer par statut si des filtres de statut sont actifs
    if (activeFilters.status.length > 0 && !activeFilters.status.includes(contact.status)) {
      return false;
    }

    // Filtrer par catégorie si des filtres de catégorie sont actifs
    if (activeFilters.categorie.length > 0 && !activeFilters.categorie.includes(contact.categorie)) {
      return false;
    }

    return true;
  });

  // Gérer le clic sur une ligne
  const handleRowClick = (contact: Contact) => {
    handleViewDetails(contact);
  };

  // Afficher les détails d'un contact
  const handleViewDetails = (contact: Contact) => {
    setDetailContact(contact);
    setShowDetails(true);
  };

  // Supprimer un contact
  const handleDelete = (contact: Contact) => {
    toast("Confirmation", {
      description: `Voulez-vous vraiment supprimer ${contact.prenom || ''} ${contact.nom} ?`,
      action: (
        <Button
          variant="destructive"
          onClick={() => {
            setContacts(prev => prev.filter(c => c.id !== contact.id));
            toast("Contact supprimé", {
              description: `${contact.prenom || ''} ${contact.nom} a été supprimé`,
            });
          }}
        >
          Supprimer
        </Button>
      ),
    });
  };

  // Actions personnalisées pour le header
  const headerActions = (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Filter size={16} />
            Filtres
            {(activeFilters.status.length > 0 || activeFilters.categorie.length > 0) && (
              <Badge variant="secondary" className="ml-1 px-1">
                {activeFilters.status.length + activeFilters.categorie.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="p-2">
            <div className="font-medium mb-1">Statut</div>
            <div className="grid grid-cols-1 gap-1">
              {['actif', 'inactif', 'archivé'].map(status => (
                <div key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`status-${status}`}
                    checked={activeFilters.status.includes(status)}
                    onChange={() => handleFilterChange('status', status)}
                    className="rounded"
                  />
                  <label htmlFor={`status-${status}`} className="text-sm capitalize">
                    {status}
                  </label>
                </div>
              ))}
            </div>

            <div className="font-medium mb-1 mt-2">Catégorie</div>
            <div className="grid grid-cols-1 gap-1">
              {['Premium', 'Standard', 'Basique'].map(categorie => (
                <div key={categorie} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`categorie-${categorie}`}
                    checked={activeFilters.categorie.includes(categorie)}
                    onChange={() => handleFilterChange('categorie', categorie)}
                    className="rounded"
                  />
                  <label htmlFor={`categorie-${categorie}`} className="text-sm">
                    {categorie}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button className="gap-2">
        <PlusCircle size={16} />
        Nouveau contact
      </Button>
    </div>
  );

  // État vide personnalisé
  const emptyState = (
    <div className="text-center p-8">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">Aucun contact trouvé</h3>
      <p className="text-gray-500 mb-4">Ajoutez votre premier contact pour commencer</p>
      <Button>
        <PlusCircle size={16} className="mr-2" />
        Ajouter un contact
      </Button>
    </div>
  );

  // Exporter les contacts
  const handleExportContacts = (data: Contact[]) => {
    toast("Exportation réussie", {
      description: `${data.length} contacts ont été exportés`,
    });
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Contacts</h1>

      <KDTable
        data={filteredContacts}
        columns={columns}
        groupByOptions={groupByOptions}
        title="Base de contacts"
        onRowClick={handleRowClick}
        initialGroupBy="none"
        initialSort={{ key: 'nom', direction: 'asc' }}
        searchPlaceholder="Rechercher un contact..."
        noGroupText="Tous les contacts"
        noResultsText="Aucun contact ne correspond aux critères"
        selectable={true}
        onSelectionChange={setSelectedContacts}
        pagination={{
          enabled: true,
          pageSize: 10,
          pageSizeOptions: [5, 10, 25, 50, 100]
        }}
        loading={loading}
        loadingText="Chargement des contacts..."
        headerActions={headerActions}
        exportable={true}
        exportFilename="contacts-export.csv"
        exportFunction={handleExportContacts}
        emptyState={contacts.length === 0 ? emptyState : undefined}
        showColumnSelector={true}
        showColoredRows={true}
        refreshable={true}
        onRefresh={loadData}
        className="shadow-sm"
      />

      {/* Afficher les actions sur les contacts sélectionnés */}
      {selectedContacts.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-auto bg-white shadow-lg rounded-lg border p-4 z-10 flex justify-between items-center">
          <div className="text-sm font-medium">
            {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Exportation",
                  description: `${selectedContacts.length} contacts exportés`,
                });
              }}
            >
              <Download size={16} className="mr-2" />
              Exporter
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                toast({
                  title: "Suppression",
                  description: `${selectedContacts.length} contacts supprimés`,
                });
                // Filtrer les contacts sélectionnés
                setContacts(prev => prev.filter(contact =>
                  !selectedContacts.some(sel => sel.id === contact.id)
                ));
                // Réinitialiser la sélection
                setSelectedContacts([]);
              }}
            >
              Supprimer
            </Button>
          </div>
        </div>
      )}

      {/* Modal de détails du contact */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[600px]">
          {detailContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span>{detailContact.prenom} {detailContact.nom}</span>
                  <Badge variant="outline" className={
                    detailContact.status === 'actif' ? 'bg-green-100 text-green-800' :
                      detailContact.status === 'inactif' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                  }>
                    {detailContact.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="info">Informations</TabsTrigger>
                  <TabsTrigger value="contact">Contact</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Entreprise</div>
                          <div className="font-medium">{detailContact.entreprise}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Catégorie</div>
                          <div>
                            <Badge variant="outline" className={
                              detailContact.categorie === 'Premium' ? 'bg-purple-100 text-purple-800' :
                                detailContact.categorie === 'Standard' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                            }>
                              {detailContact.categorie}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Secteur</div>
                          <div>{detailContact.secteur}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Poste</div>
                          <div>{detailContact.poste || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Service</div>
                          <div>{detailContact.service || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Rôle d'achat</div>
                          <div>{detailContact.role_achat || '-'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Date de création</div>
                          <div>{new Date(detailContact.date_creation).toLocaleDateString('fr-FR')}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contact">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500">Email</div>
                          <div className="font-medium">
                            <a href={`mailto:${detailContact.email}`} className="text-blue-600 hover:underline flex items-center">
                              <Mail size={14} className="mr-1" />
                              {detailContact.email}
                            </a>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Téléphone</div>
                          <div>
                            {detailContact.telephone ? (
                              <a href={`tel:${detailContact.telephone}`} className="text-blue-600 hover:underline flex items-center">
                                <Phone size={14} className="mr-1" />
                                {detailContact.telephone}
                              </a>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Région</div>
                          <div>{detailContact.region}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Ville</div>
                          <div>{detailContact.ville_nom}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Dernière interaction</div>
                          <div>
                            {detailContact.derniere_interaction ? (
                              new Date(detailContact.derniere_interaction).toLocaleDateString('fr-FR')
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="notes">
                  <Card>
                    <CardContent className="pt-6">
                      {detailContact.notes ? (
                        <p>{detailContact.notes}</p>
                      ) : (
                        <p className="text-gray-400 italic">Aucune note disponible</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fermer
                </Button>
                <Button>
                  <Edit size={16} className="mr-2" />
                  Modifier
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactsTableExample;