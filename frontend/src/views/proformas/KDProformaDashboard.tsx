import { useEffect, useState } from "react";
import analyseProformas, { ProformaStats } from "./dash.config";
import { useProformas } from "@/hooks/useProformas";
import { useEntityFromUrl } from "@/hooks/useEntityFromUrl";
import KDProformaStats from "./KDProformaStats";

const KDProformaDashboard: React.FC = () => {
  const currentEntity = useEntityFromUrl();
  const title = currentEntity === "TOUTES" ? "Tableau de bord des Proformas" : `Tableau de bord des Proformas de ${currentEntity}`;
  const { proformas, isLoading, error, fetchProformas } = useProformas();
  const [stats, setStats] = useState<ProformaStats | null>(null);
  const [filteredProformas, setFilteredProformas] = useState([]);

  useEffect(() => {
    fetchProformas();
  }, [fetchProformas]);

  useEffect(() => {
    const filtered = proformas.filter((proforma) => 
      currentEntity === "TOUTES" || proforma.offre.entity.code === currentEntity
    );
    setFilteredProformas(filtered);
    console.log(filtered);
  }, [currentEntity, proformas]);

  useEffect(() => {
    if (filteredProformas.length > 0) {
      const calculatedStats = analyseProformas(filteredProformas);
      setStats(calculatedStats);
    }
  }, [filteredProformas]);
  console.log(stats);

  if (isLoading) return <div>Chargement des données...</div>;
  if (error) return <div>Erreur lors du chargement des données: {error}</div>;

  return (
    <div className="container mx-auto p-4">
    <h1 className="text-2xl font-bold mb-6">{title}</h1>
    {stats && (
      <div className="stats-container">
        <KDProformaStats stats={stats} />
      </div>
    )}
    {!stats && !isLoading && (
      <div className="text-center p-8 bg-slate-100 rounded-lg">
        Aucune donnée disponible pour cette entité
      </div>
    )}
  </div>
  );
};

export default KDProformaDashboard;