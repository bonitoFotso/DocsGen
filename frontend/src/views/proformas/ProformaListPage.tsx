import React from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { 
  FileDown, 
  Filter, 
  Plus, 
  RefreshCw, 
} from 'lucide-react';
import { useExportProforma } from '@/hooks/useExportProforma';
import { useProformas } from '@/hooks/useProformas';
import { linearizeProformaData } from '@/config/linearizeProformaData';
import { useEntityFromUrl } from '@/hooks/useEntityFromUrl';
import { extractKPIs } from '@/config/pro/extractKPIs';
import { getProformaColumns } from '@/config/proformas-table.config';
import KDTable from '@/components/table/KDTable2';
import ProformaAnalyticsDashboard from './ProformaAnalyticsDashboard';

// Méthode 1: Utilisation directe du composant dans ProformaListPage
const ProformaListPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    proformas, 
    isLoading, 
    kpi,
    filters, 
    fetchProformas, 
  } = useProformas();
  const { isExporting, exportToCsv } = useExportProforma();
  const [viewMode, setViewMode] = React.useState<'stats' | 'analytics'>('stats');

  const currentEntity = useEntityFromUrl();

  const title = currentEntity === "TOUTES" ? "Liste des Proformas" : `Liste des Proformas de ${currentEntity}`;

  // Filtrage des proformas par entity
  const filteredProformas = currentEntity !== "TOUTES" ? proformas.filter(proforma => proforma.offre.entity.code === currentEntity) : proformas;
  
  // Données linéarisées
  const entityLinearProformas = linearizeProformaData(filteredProformas);
  
  // KPI pour l'entity
  const entityKpi = kpi ? extractKPIs(entityLinearProformas) : null;

  const handleCreateProforma = () => {
    navigate('/proformas/create');
  };


  const handleViewDetails = (id: number) => {
    navigate(`/proformas/${id}`);
  };

  const handleEdit = (id: number) => {
    navigate(`/proformas/${id}/edit`);
  };

  const proformasGroupByOptions = [
    { key: 'client_pays', label: 'Par Pays' },
    { key: 'client_region', label: 'Par Région' },
    { key: 'client_ville', label: 'Par Ville' },
    { key: 'client_nom', label: 'Par Client' },
    { key: 'entity_code', label: 'Par Entity' },
    { key: 'statut', label: 'Par Statut' },
    { key: 'date_creation', label: 'Par Date de création' },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex space-x-2">
          <div className="mr-4">
            <Button 
              variant={viewMode === 'stats' ? 'default' : 'outline'} 
              onClick={() => setViewMode('stats')}
              className="rounded-r-none"
            >
              Statistiques
            </Button>
            <Button 
              variant={viewMode === 'analytics' ? 'default' : 'outline'} 
              onClick={() => setViewMode('analytics')}
              className="rounded-l-none"
            >
              Analytiques
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => fetchProformas()} 
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            onClick={() => console.log("Actualiser")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportToCsv(filters)} 
            disabled={isExporting}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleCreateProforma}>
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle Proforma
          </Button>
        </div>
      </div>

      {/* Vue conditionnelle basée sur le mode */}
      {viewMode === 'stats' ? (
        <KDTable 
        data={entityLinearProformas}
        columns={getProformaColumns({ navigate, handleViewDetails, handleEdit })}
        groupByOptions={proformasGroupByOptions}
      />
      ) : (
        <ProformaAnalyticsDashboard 
          kpis={entityKpi}
        />
      )}

    </div>
  );
};

export default ProformaListPage;
