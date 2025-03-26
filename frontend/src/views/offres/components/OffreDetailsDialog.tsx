import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, FileText } from "lucide-react";
import { OffreDetail } from "@/types/offre";

interface OffreDetailsDialogProps {
  offre: OffreDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
  onViewDetails: () => void;
}

export const OffreDetailsDialog = ({
  offre,
  open,
  onOpenChange,
  onEdit,
  onViewDetails,
}: OffreDetailsDialogProps) => {
  // Fonction pour déterminer la couleur du badge de statut
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'GAGNE': return 'bg-green-100 text-green-800';
      case 'PERDU': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Détails de l'offre</span>
            <Badge 
              variant="outline" 
              className={getStatusBadgeClass(offre.statut)}
            >
              {offre.statut}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
            <TabsTrigger value="produits">Produits</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Référence</div>
                    <div className="font-medium">{offre.reference}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Entité</div>
                    <div>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">
                        {offre.entity.name} ({offre.entity.code})
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date de création</div>
                    <div>{new Date(offre.date_creation).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Date de modification</div>
                    <div>{new Date(offre.date_modification).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Montant</div>
                    <div className="font-medium">
                      {new Intl.NumberFormat('fr-FR', { 
                        style: 'currency', 
                        currency: 'XAF',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0 
                      }).format(Number(offre.montant || '0'))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Fichier</div>
                    <div>
                      {offre.fichier ? (
                        <a 
                          href={offre.fichier} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Télécharger
                        </a>
                      ) : (
                        <span className="text-gray-400">Aucun fichier</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="client">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Client</div>
                    <div className="font-medium">{offre.client.nom}</div>
                    <div className="text-sm text-gray-500 mt-1">ID: {offre.client.c_num}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Secteur d'activité</div>
                    <div>{offre.client.secteur_activite}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div>
                      <a href={`mailto:${offre.client.email}`} className="text-blue-600 hover:underline">
                        {offre.client.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <div>
                      <a href={`tel:${offre.client?.telephone}`} className="text-blue-600 hover:underline">
                        {offre.client?.telephone || "Non disponible"}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Lieu</div>
                    <div>{offre.client.ville_nom}, {offre.client.region_nom}, {offre.client.pays_nom}</div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4">
                  <div className="text-sm font-medium mb-2">Contact principal</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Nom</div>
                      <div className="font-medium">{offre.contact?.nom || "Non disponible"}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div>
                        <a href={`mailto:${offre.contact?.email}`} className="text-blue-600 hover:underline">
                          {offre.contact?.email || "Non disponible"}
                        </a>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Téléphone</div>
                      <div>
                        <a href={`tel:${offre.contact?.telephone}`} className="text-blue-600 hover:underline">
                          {offre.contact?.telephone || "Non disponible"}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="produits">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Produit principal</div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      {offre.produit_principal.category}
                    </Badge>
                    <span className="font-medium">{offre.produit_principal.name}</span>
                    <span className="text-gray-500 text-sm">({offre.produit_principal.code})</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="text-sm font-medium mb-2">Autres produits</div>
                  {offre.produits && offre.produits.length > 0 ? (
                    <div className="space-y-2">
                      {offre.produits.map((produit) => (
                        <div key={produit.id} className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            {produit.category}
                          </Badge>
                          <span>{produit.name}</span>
                          <span className="text-gray-500 text-sm">({produit.code})</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">Aucun produit supplémentaire</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notes">
            <Card>
              <CardContent className="pt-6">
                {offre.notes ? (
                  <div className="whitespace-pre-wrap">{offre.notes}</div>
                ) : (
                  <div className="text-gray-500 italic">Aucune note disponible</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between items-center">
          <div>
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={() => onOpenChange(false)}
            >
              Fermer
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-1"
              onClick={onViewDetails}
            >
              <Eye size={16} />
              Voir la page détaillée
            </Button>
            <Button 
              size="sm"
              className="gap-1"
              onClick={onEdit}
            >
              <Edit size={16} />
              Modifier
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};