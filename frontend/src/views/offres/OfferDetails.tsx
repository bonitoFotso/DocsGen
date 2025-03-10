import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Building, 
  Calendar, 
  User, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  FileDown, 
  Edit, 
  Archive, 
  Printer, 
  Trash2, 
  MoreHorizontal, 
  Mail, 
  Phone,
  AlertTriangle
} from 'lucide-react';

// Composants UI
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableFooter, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types
interface Produit {
  id: number;
  name: string;
  code: string;
  prix: number;
}

interface Contact {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  fonction?: string;
}

interface Client {
  id: number;
  nom: string;
  c_num: string;
}

interface Entity {
  id: number;
  nom: string;
  code: string;
}

interface OffreDetail {
  id: number;
  reference: string;
  statut: 'BROUILLON' | 'ENVOYE' | 'GAGNE' | 'PERDU';
  date_creation: string;
  date_modification: string;
  date_validation?: string;
  montant: number;
  client: Client;
  contact?: Contact;
  entity: Entity;
  produits: Produit[];
  relance?: string;
  necessite_relance: boolean;
  sequence_number: number;
}

interface HistoriqueEntry {
  id: number;
  date: string;
  action: string;
  utilisateur: string;
  commentaire?: string;
}



const OffreDetails = () => {
  // État pour simuler le chargement des données
  const [loading, setLoading] = useState(true);
  
  // État pour les données de l'offre
  const [offre, setOffre] = useState<OffreDetail | null>(null);

  const [offreId, setOffreId] = useState<number | null>(null);

  const onBack = () => {
    console.log('Retour à la liste des offres');
  };


  
  // État pour l'historique des actions
  const [historique, setHistorique] = useState<HistoriqueEntry[]>([]);
  
  // Simuler le chargement des données
  useEffect(() => {
    // Ici, vous feriez l'appel API pour récupérer les données de l'offre
    // API.getOffreById(offreId).then(data => setOffre(data))
    
    setTimeout(() => {
      // Données simulées
      setOffre({
        id: offreId || 0,
        reference: `SD/OFF/CL123/2503/SERV/1/0001`,
        statut: 'ENVOYE',
        date_creation: '2025-03-01T10:30:00',
        date_modification: '2025-03-05T14:20:00',
        montant: 4500000,
        client: {
          id: 123,
          nom: 'Entreprise ABC',
          c_num: 'CL123'
        },
        contact: {
          id: 456,
          nom: 'Jean Dupont',
          fonction: 'Directeur Commercial',
          email: 'j.dupont@entrepriseabc.com',
          telephone: '+237 691234567'
        },
        entity: {
          id: 1,
          nom: 'Siège',
          code: 'SD'
        },
        produits: [
          { id: 1, name: 'Serveur Dell PowerEdge', code: 'SERV', prix: 2500000 },
          { id: 2, name: 'Licence Windows Server', code: 'WLIC', prix: 1250000 },
          { id: 3, name: 'Installation et configuration', code: 'INST', prix: 750000 }
        ],
        relance: '2025-03-12T10:00:00',
        necessite_relance: true,
        sequence_number: 1
      });

      setHistorique([
        { 
          id: 1, 
          date: '2025-03-01T10:30:00', 
          action: 'Création', 
          utilisateur: 'Admin Système', 
          commentaire: 'Création de l\'offre' 
        },
        { 
          id: 2, 
          date: '2025-03-03T09:15:00', 
          action: 'Modification', 
          utilisateur: 'Commercial A', 
          commentaire: 'Ajout de produits supplémentaires' 
        },
        { 
          id: 3, 
          date: '2025-03-05T14:20:00', 
          action: 'Envoi', 
          utilisateur: 'Commercial A', 
          commentaire: 'Offre envoyée par email au client' 
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [offreId]);

  // Fonctions utilitaires pour le formatage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'XAF',
      maximumFractionDigits: 0
    }).format(montant);
  };

  // Obtenir les initiales pour l'avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    const nameArray = name.split(' ');
    if (nameArray.length >= 2) {
      return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Couleur et icône en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'GAGNE':
        return 'text-green-600 border-green-200 bg-green-50';
      case 'PERDU':
        return 'text-red-600 border-red-200 bg-red-50';
      case 'ENVOYE':
        return 'text-blue-600 border-blue-200 bg-blue-50';
      case 'BROUILLON':
        return 'text-amber-600 border-amber-200 bg-amber-50';
      default:
        return 'text-gray-600 border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (statut: string) => {
    switch(statut) {
      case 'GAGNE':
        return <CheckCircle2 className="h-4 w-4 mr-1" />;
      case 'PERDU':
        return <XCircle className="h-4 w-4 mr-1" />;
      case 'ENVOYE':
      case 'BROUILLON':
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  // Calcul du montant total des produits
  const calculerMontantTotal = (produits: Produit[]) => {
    return produits.reduce((total, produit) => total + produit.prix, 0);
  };

  // Affichage de l'état de chargement
  if (loading) {
    return (
      <div className="container py-8 space-y-6">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={onBack} className="mr-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Chargement des détails...</h1>
        </div>
        <Card className="animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage en cas d'absence de données
  if (!offre) {
    return (
      <div className="container py-8">
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Offre non trouvée</h2>
            <p className="text-muted-foreground mb-4">L'offre que vous recherchez n'existe pas ou a été supprimée.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Détails de l'offre</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Imprimer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon">
                  <FileDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Télécharger PDF</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Archive className="h-4 w-4 mr-2" />
                Archiver
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Envoyer par email
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Alerte de relance si nécessaire */}
      {offre.necessite_relance && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            Cette offre nécessite une relance depuis le {formatDate(offre.relance || '')}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-3 gap-6">
        {/* Section principale */}
        <div className="col-span-2 space-y-6">
          {/* Carte de détails de l'offre */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {offre.entity.code}
                    </Badge>
                    <Badge className={getStatusColor(offre.statut)}>
                      {getStatusIcon(offre.statut)}
                      {offre.statut}
                    </Badge>
                    {offre.necessite_relance && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Relance nécessaire
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl">{offre.reference}</CardTitle>
                  <CardDescription>
                    Séquence #{offre.sequence_number}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Montant total</div>
                  <div className="text-2xl font-bold text-primary">{formatMontant(offre.montant)}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Client</div>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="font-medium">{offre.client.nom}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {offre.client.c_num}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Créée le</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(offre.date_creation)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Contact</div>
                  {offre.contact ? (
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {offre.contact.nom}
                      {offre.contact.fonction && (
                        <span className="text-xs text-muted-foreground ml-2">({offre.contact.fonction})</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground italic">Non spécifié</div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Dernière modification</div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(offre.date_modification)}
                  </div>
                </div>
                
                {offre.statut === 'GAGNE' && offre.date_validation && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Date de validation</div>
                    <div className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                      {formatDate(offre.date_validation)}
                    </div>
                  </div>
                )}
                
                {offre.relance && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Prochaine relance</div>
                    <div className="flex items-center">
                      <AlertTriangle className={`h-4 w-4 mr-2 ${offre.necessite_relance ? 'text-amber-600' : 'text-muted-foreground'}`} />
                      {formatDate(offre.relance)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Onglets */}
          <Tabs defaultValue="produits">
            <TabsList className="mb-4">
              <TabsTrigger value="produits">Produits</TabsTrigger>
              <TabsTrigger value="historique">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="produits" className="space-y-4">
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produit</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offre.produits.map((produit) => (
                      <TableRow key={produit.id}>
                        <TableCell className="font-medium">{produit.name}</TableCell>
                        <TableCell>{produit.code}</TableCell>
                        <TableCell className="text-right">{formatMontant(produit.prix)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={2} className="text-right font-bold">Total</TableCell>
                      <TableCell className="text-right font-bold">{formatMontant(calculerMontantTotal(offre.produits))}</TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </Card>
            </TabsContent>
            
            <TabsContent value="historique" className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {historique.map((entry, index) => (
                      <div key={entry.id} className="flex gap-4">
                        <div className="relative">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {entry.action === "Création" && <FileText className="h-4 w-4" />}
                            {entry.action === "Modification" && <Edit className="h-4 w-4" />}
                            {entry.action === "Envoi" && <Mail className="h-4 w-4" />}
                          </div>
                          {index < historique.length - 1 && (
                            <div className="absolute top-8 bottom-0 left-4 w-0.5 bg-border" />
                          )}
                        </div>
                        <div className="space-y-1 pb-4">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium">{entry.action}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</span>
                          </div>
                          <div className="text-sm">par <span className="font-medium">{entry.utilisateur}</span></div>
                          {entry.commentaire && (
                            <div className="text-sm text-muted-foreground">{entry.commentaire}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="col-span-1 space-y-6">
          {/* Carte client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 bg-primary/10">
                  <AvatarFallback className="text-primary">{getInitials(offre.client.nom)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{offre.client.nom}</div>
                  <div className="text-xs text-muted-foreground">{offre.client.c_num}</div>
                </div>
              </div>
              
              {offre.contact && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Contact principal</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{offre.contact.nom}</span>
                      </div>
                      
                      {offre.contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${offre.contact.email}`} className="hover:underline">{offre.contact.email}</a>
                        </div>
                      )}
                      
                      {offre.contact.telephone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${offre.contact.telephone}`} className="hover:underline">{offre.contact.telephone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Voir le profil client
              </Button>
            </CardFooter>
          </Card>
          
          {/* Statut de l'offre */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Statut actuel</span>
                  <Badge className={getStatusColor(offre.statut)}>
                    {getStatusIcon(offre.statut)}
                    {offre.statut}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3">
              {offre.statut !== 'GAGNE' && (
                <Button className="w-full">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marquer comme gagnée
                </Button>
              )}
              
              {offre.statut !== 'PERDU' && (
                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                  <XCircle className="h-4 w-4 mr-2" />
                  Marquer comme perdue
                </Button>
              )}
              
              {offre.necessite_relance && (
                <Button variant="outline" className="w-full">
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer une relance
                </Button>
              )}
            </CardFooter>
          </Card>
          
          {/* Documents liés */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun document lié</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Ajouter un document
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OffreDetails;