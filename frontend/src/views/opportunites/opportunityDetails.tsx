import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Calendar, DollarSign, User, Package, FileText } from "lucide-react";
import { toast } from "sonner";
import { Opportunite } from '@/types/contact';

const OpportunityDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { opportuniteService, clientService, contactService, productService } = useServices();

    const [opportunity, setOpportunity] = useState<Opportunite | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [clientName, setClientName] = useState<string>("");
    const [contactName, setContactName] = useState<string>("");
    const [produitName, setProduitName] = useState<string>("");
    const [productsNames, setProductsNames] = useState<string[]>([]);

    const fetchOpportunity = useCallback(async () => {
        if (!id) return;

        try {
            setLoading(true);
            const data = await opportuniteService.getById(Number(id));
            setOpportunity(data);

            // Charger les informations associées
            if (data.client_id) {
                const client = await clientService.getById(data.client_id);
                setClientName(client.nom);
            }

            if (data.contact_id) {
                const contact = await contactService.getById(data.contact_id);
                setContactName(`${contact.prenom} ${contact.nom}`);
            }

            if (data.produit_principal) {
                const produit = await productService.getById(data.produit_principal);
                setProduitName(produit.name);
            }

            if (data.produits && data.produits.length > 0) {
                const products = await Promise.all(data.produits.map((productId) => productService.getById(productId)));
                setProductsNames(products.map((product) => product.name));
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            toast.error("Erreur", {
                description: `Erreur lors du chargement de l'opportunité: ${errorMessage}`,
            });
        } finally {
            setLoading(false);
        }
    }, [id, opportuniteService, clientService, contactService, productService]);

    useEffect(() => {
        fetchOpportunity();
    }, [fetchOpportunity]);

    // Fonction pour gérer le statut avec couleur
    const getStatusBadge = (status: string) => {
        const statusClasses = {
            'En cours': 'bg-blue-100 text-blue-800',
            'Gagnée': 'bg-green-100 text-green-800',
            'Perdue': 'bg-red-100 text-red-800',
            'En négociation': 'bg-amber-100 text-amber-800',
            'Qualifiée': 'bg-purple-100 text-purple-800',
            'PROSPECT': 'bg-blue-100 text-blue-800',
        };

        const defaultClass = 'bg-gray-100 text-gray-800';
        const statusClass = status in statusClasses ? statusClasses[status as keyof typeof statusClasses] : defaultClass;

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Skeleton className="h-8 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                    <Skeleton className="h-40" />
                </div>
                <Skeleton className="h-64" />
            </div>
        );
    }

    if (!opportunity) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Opportunité non trouvée</h1>
                </div>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center h-64">
                        <p className="text-muted-foreground">Cette opportunité n'existe pas ou a été supprimée.</p>
                        <Button className="mt-4" onClick={() => navigate('/opportunities')}>
                            Retour à la liste
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{opportunity.reference}</h1>
                        <p className="text-muted-foreground">{clientName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(opportunity.statut)}
                    <Button onClick={() => navigate(`/opportunities/${id}/edit`)} className="gap-2">
                        <Edit className="h-4 w-4" />
                        Modifier
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Informations financières
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Montant estimé</span>
                                <span className="font-medium">{opportunity.montant_estime.toLocaleString()} €</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Probabilité</span>
                                <span className="font-medium">{opportunity.probabilite}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Dates clés
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Détection</span>
                                <span className="font-medium">{new Date(opportunity.date_detection).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dernière modification</span>
                                <span className="font-medium">{new Date(opportunity.date_modification).toLocaleDateString()}</span>
                            </div>
                            {opportunity.date_cloture && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Clôture</span>
                                    <span className="font-medium">{new Date(opportunity.date_cloture).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Client</span>
                                <span className="font-medium">{clientName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Contact principal</span>
                                <span className="font-medium">{contactName || "Non spécifié"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Détails</TabsTrigger>
                    <TabsTrigger value="products">Produits</TabsTrigger>
                    <TabsTrigger value="followup">Suivi</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {opportunity.description ? (
                                <p className="whitespace-pre-line">{opportunity.description}</p>
                            ) : (
                                <p className="text-muted-foreground italic">Aucune description fournie</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Besoins du client
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {opportunity.besoins_client ? (
                                <p className="whitespace-pre-line">{opportunity.besoins_client}</p>
                            ) : (
                                <p className="text-muted-foreground italic">Aucun besoin spécifié</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="products">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Produits concernés
                            </CardTitle>
                            <CardDescription>
                                Produit principal: {produitName || "Non spécifié"}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {opportunity.produits && opportunity.produits.length > 0 ? (
                                <ul className="space-y-2">
                                    {productsNames.map((produitId) => (
                                        <li key={produitId} className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            <span>{produitId}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground italic">Aucun produit associé</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="followup">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Suivi et relances
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {opportunity.relance ? (
                                <p className="whitespace-pre-line">{opportunity.relance}</p>
                            ) : (
                                <p className="text-muted-foreground italic">Aucune information de suivi</p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline">Ajouter une note de suivi</Button>
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default OpportunityDetails;