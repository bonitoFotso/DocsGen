import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/AppHooks';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Plus, Eye, Edit } from "lucide-react";
import { toast } from "sonner"

// Définition des types
interface OpportuniteListItem {
  id: string | number;
  reference: string;
  client_nom: string;
  statut: string;
  montant_estime: number;
  probabilite: number;
  date_detection: string;
}

const OpportunityPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportuniteListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  
  const navigate = useNavigate();
  const { opportuniteService } = useServices();

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await opportuniteService.getAll();
      setOpportunities(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error("Erreur", {
        description: `Erreur lors du chargement des opportunités: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  }, [opportuniteService]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  // Filtrage des données
  const filteredData = opportunities.filter((opp) => {
    const matchesSearch = searchTerm === "" || 
      opp.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.client_nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "" || opp.statut === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination sur les données filtrées
  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );
  
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterStatus]);

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  // Liste des statuts disponibles
  const statuses = ['En cours', 'Gagnée', 'Perdue', 'En négociation', 'Qualifiée', 'PROSPECT'];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Liste des opportunités</h1>
        <Button onClick={() => navigate('/opportunities/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle opportunité
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Opportunités commerciales</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par référence ou client..."
                className="w-full px-3 py-2 border rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select
                className="px-3 py-2 border rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setFilterStatus("");
              }}
            >
              Réinitialiser
            </Button>
          </div>

          {loading ? (
            // Affichage du squelette pendant le chargement
            <div className="space-y-4">
              {Array(5).fill(0).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Référence</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Montant estimé</TableHead>
                      <TableHead className="text-right">Probabilité</TableHead>
                      <TableHead>Date de détection</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          {filteredData.length === 0 && opportunities.length > 0 ? 
                            "Aucune opportunité ne correspond à vos critères de recherche" : 
                            "Aucune opportunité trouvée"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedData.map((opportunity) => (
                        <TableRow 
                          key={opportunity.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => navigate(`/opportunities/${opportunity.id}`)}
                        >
                          <TableCell className="font-medium">{opportunity.reference}</TableCell>
                          <TableCell>{opportunity.client_nom}</TableCell>
                          <TableCell>{getStatusBadge(opportunity.statut)}</TableCell>
                          <TableCell className="text-right">{opportunity.montant_estime.toLocaleString()} €</TableCell>
                          <TableCell className="text-right">{opportunity.probabilite}%</TableCell>
                          <TableCell>{new Date(opportunity.date_detection).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/opportunities/${opportunity.id}`);
                                }}>
                                  <Eye className="mr-2 h-4 w-4" /> Voir
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/opportunities/${opportunity.id}/edit`);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" /> Modifier
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination avec informations améliorées */}
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 py-4">
                <div className="text-sm text-muted-foreground">
                  Affichage de {paginatedData.length} sur {filteredData.length} opportunités
                  {filteredData.length !== opportunities.length && (
                    <span> (filtré depuis {opportunities.length} au total)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <div className="text-sm font-medium">
                    Page {page} sur {totalPages || 1}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages || totalPages === 0}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OpportunityPage;