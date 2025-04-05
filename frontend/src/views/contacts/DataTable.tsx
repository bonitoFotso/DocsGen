import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronRight, 
  Search,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ArrowRight,
} from "lucide-react";
import { useServices } from '@/AppHooks';
import React from 'react';
import { Contact } from '@/itf';

interface Employee {
  id: number;
  region: string;
  ville_nom: string;
  entreprise: string;
  secteur: string;
  prenom: string | null;
  nom: string;
  poste: string | null;
  service: string | null;
  role_achat: string | null;
  telephone: string | null;
  email: string;
  status: string;
  agrement: boolean;
}

interface SortConfig {
  key: keyof Employee | null;
  direction: 'asc' | 'desc';
}

const DataTable = () => {
  const { contactService } = useServices();
  const [data, setData] = useState<Contact[]>([]);
  const [filteredData, setFilteredData] = useState<Contact[]>([]);
  const [groupBy, setGroupBy] = useState<'none' | 'region' | 'ville_nom' | 'entreprise' | 'secteur' | 'categorie'>('none');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await contactService.getAlls();
        setData(response);
        setFilteredData(response);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [contactService]);

  useEffect(() => {
    let result = [...data];

    // Appliquer la recherche globale
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(contact => {
        return (
          contact.nom.toLowerCase().includes(searchLower) ||
          (contact.prenom?.toLowerCase() || '').includes(searchLower) ||
          (contact.email?.toLowerCase() || '').includes(searchLower) ||
          (contact.poste?.toLowerCase() || '').includes(searchLower) ||
          contact.region?.toLowerCase().includes(searchLower) ||
          contact.ville_nom?.toLowerCase().includes(searchLower) ||
          contact.entreprise?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Appliquer le tri
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key!]?.toString().toLowerCase() ?? '';
        const bValue = b[sortConfig.key!]?.toString().toLowerCase() ?? '';
        
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      });
    }

    setFilteredData(result);
  }, [data, search, sortConfig]);

  const handleSort = (key: keyof Employee) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key: keyof Employee) => {
    if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4" />;
    return sortConfig.direction === 'asc' ? 
      <ArrowUp className="w-4 h-4" /> : 
      <ArrowDown className="w-4 h-4" />;
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const groupData = () => {
    if (groupBy === 'none') return [{ group: 'all', data: filteredData }];

    const groups = new Map<string, Contact[]>();
    
    filteredData.forEach(employee => {
      const groupKey = employee[groupBy] || '';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)?.push(employee);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([group, employees]) => ({
        group,
        data: employees
      }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-4 mt-4">
          {/* Recherche globale */}
          <div className="relative w-full max-w-sm">
            
            <Input className="peer pe-9 ps-9" type="search" 
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} strokeWidth={2} />
        </div>
        <button
          className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Submit search"
          type="submit"
        >
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
          </div>

          {/* Boutons de groupement */}
          <div className="flex gap-4">
            <Button 
              variant={groupBy === 'none' ? "default" : "outline"}
              
              onClick={() => setGroupBy('none')}
            >
              Aucun groupement
            </Button>
            <Button 
              variant={groupBy === 'region' ? "default" : "outline"}
              onClick={() => setGroupBy('region')}
            >
              Grouper par Région
            </Button>
            <Button 
              variant={groupBy === 'ville_nom' ? "default" : "outline"}
              onClick={() => setGroupBy('ville_nom')}
            >
              Grouper par Ville
            </Button>
            <Button 
              variant={groupBy === 'secteur' ? "default" : "outline"}
              onClick={() => setGroupBy('secteur')}
            >
              Grouper par Secteur d'activité
            </Button>
            <Button 
              variant={groupBy === 'categorie' ? "default" : "outline"}
              onClick={() => setGroupBy('categorie')}
            >
              Grouper par categorie
            </Button>
            <Button 
              variant={groupBy === 'entreprise' ? "default" : "outline"}
              onClick={() => setGroupBy('entreprise')}
            >
              Grouper par Entreprise
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {[
                  { key: 'region', label: 'Région' },
                  { key: 'ville_nom', label: 'Ville' },
                  { key: 'secteur', label: 'Secteur' },
                  { key: 'categorie', label: 'categorie' },
                  { key: 'entreprise', label: 'Entreprise' },
                  { key: 'nom', label: 'Nom' },
                  { key: 'prenom', label: 'Prénom' },
                  { key: 'service', label: 'Service' },
                  { key: 'poste', label: 'Poste' },
                  { key: 'email', label: 'Email' },
                  { key: 'telephone', label: 'Téléphone' }
                ].map(({ key, label }) => (
                  <TableHead key={key}>
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort(key as keyof Employee)}
                    >
                      {label}
                      {getSortIcon(key as keyof Employee)}
                    </button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupData().map(({ group, data: groupData }) => (
                <React.Fragment key={group}>
                  {groupBy !== 'none' && (
                    <TableRow className="bg-gray-50 hover:bg-gray-100">
                      <TableCell colSpan={8}>
                        <button
                          className="flex items-center w-full"
                          onClick={() => toggleGroup(group)}
                        >
                          {expandedGroups.has(group) ? (
                            <ChevronDown className="w-4 h-4 mr-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2" />
                          )}
                          <span className="font-medium">
                            {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}: {group}
                          </span>
                          <span className="ml-2 text-gray-500">
                            ({groupData.length} contacts)
                          </span>
                        </button>
                      </TableCell>
                    </TableRow>
                  )}
                  {(groupBy === 'none' || expandedGroups.has(group)) &&
                    groupData.map(employee => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.region}</TableCell>
                        <TableCell>{employee.ville_nom}</TableCell>
                        <TableCell>{employee.secteur}</TableCell>
                        <TableCell>{employee.categorie}</TableCell>
                        <TableCell>{employee.entreprise}</TableCell>
                        <TableCell>{employee.nom}</TableCell>
                        <TableCell>{employee.prenom ?? '-'}</TableCell>
                        <TableCell>{employee.service ?? '-'}</TableCell>
                        <TableCell>{employee.poste ?? '-'}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.telephone ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucun résultat trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataTable;