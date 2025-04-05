import { Proforma } from "@/types/Proforma";


// Types pour les résultats
interface ClientStats {
  client: string;
  nbProformas: number;
  montantTTC: number;
  pourcentage: number;
}

interface EntiteStats {
  entite: string;
  nbProformas: number;
  montantTTC: number;
}

interface DateStats {
  date: string;
  count: number;
}

interface TopProforma {
  reference: string;
  client: string;
  entity: string;
  montantTTC: number;
  pourcentage: string;
}

interface GraphiqueData {
  clients: { name: string; value: number }[];
  temporel: { date: string; count: number }[];
}

interface StatistiquesGenerales {
  nbProformas: number;
  montantTotalHT: number;
  montantTotalTVA: number;
  montantTotalTTC: number;
  nbClients: number;
  tauxTVA: string[];
}

export interface ProformaStats {
  statistiquesGenerales: StatistiquesGenerales;
  clients: string[];
  entites: string[];
  statuts: { [key: string]: number };
  repartitionParClient: ClientStats[];
  repartitionParEntite: EntiteStats[];
  repartitionTemporelle: DateStats[];
  topProformas: TopProforma[];
  produitsPrincipaux: { [key: string]: number };
  graphiques: GraphiqueData;
}

interface ErrorResult {
  error: string;
}

/**
 * Analyse une liste de proformas et génère des statistiques
 * 
 * @param proformas Liste des proformas à analyser
 * @returns Statistiques des proformas ou erreur
 */
function analyseProformas(proformas: Proforma[]): ProformaStats | ErrorResult {
  // Vérifier si l'entrée est valide
  if (!Array.isArray(proformas) || proformas.length === 0) {
    return {
      error: "Données de proformas invalides ou vides"
    };
  }

  try {
    // 1. Statistiques générales
    const nbProformas = proformas.length;
    const montantTotalHT = proformas.reduce((sum, item) => sum + parseFloat(item.montant_ht || '0'), 0);
    const montantTotalTVA = proformas.reduce((sum, item) => sum + parseFloat(item.montant_tva || '0'), 0);
    const montantTotalTTC = proformas.reduce((sum, item) => sum + parseFloat(item.montant_ttc || '0'), 0);
    
    // 2. Clients et entités
    const clients = [...new Set(proformas.map(item => item.client_nom))];
    const entites = [...new Set(proformas.map(item => item.entity_code))];
    
    // 3. Répartition par statut
    const statuts: { [key: string]: number } = proformas.reduce((acc: { [key: string]: number }, item) => {
      const statut = item.statut || "Non défini";
      acc[statut] = (acc[statut] || 0) + 1;
      return acc;
    }, {});
    
    // 4. Répartition par client
    const repartitionParClient: ClientStats[] = clients.map(client => {
      const proformasClient = proformas.filter(item => item.client_nom === client);
      const montantTTC = proformasClient.reduce((sum, item) => sum + parseFloat(item.montant_ttc || '0'), 0);
      const pourcentage = parseFloat(((montantTTC / montantTotalTTC) * 100).toFixed(2));
      return {
        client,
        nbProformas: proformasClient.length,
        montantTTC,
        pourcentage
      };
    }).sort((a, b) => b.montantTTC - a.montantTTC);
    
    // 5. Répartition par entité
    const repartitionParEntite: EntiteStats[] = entites.map(entite => {
      const proformasEntite = proformas.filter(item => item.entity_code === entite);
      const montantTTC = proformasEntite.reduce((sum, item) => sum + parseFloat(item.montant_ttc || '0'), 0);
      return {
        entite,
        nbProformas: proformasEntite.length,
        montantTTC
      };
    }).sort((a, b) => b.montantTTC - a.montantTTC);
    
    // 6. Répartition temporelle
    const repartitionTemporelle: { [key: string]: number } = proformas.reduce((acc: { [key: string]: number }, item) => {
      const date = item.date_creation ? item.date_creation.split('T')[0] : "Date inconnue";
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    const repartitionTemporelleArray: DateStats[] = Object.entries(repartitionTemporelle)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // 7. Top proformas par montant
    const topProformas: TopProforma[] = [...proformas]
      .sort((a, b) => parseFloat(b.montant_ttc || '0') - parseFloat(a.montant_ttc || '0'))
      .slice(0, 5)
      .map(item => ({
        reference: item.reference,
        client: item.client_nom,
        entity: item.entity_code,
        montantTTC: parseFloat(item.montant_ttc || '0'),
        pourcentage: ((parseFloat(item.montant_ttc || '0') / montantTotalTTC) * 100).toFixed(2)
      }));
    
    // 8. Produits principaux
    const produitsPrincipaux: { [key: string]: number } = proformas.reduce((acc: { [key: string]: number }, item) => {
      if (item.offre && item.offre.produit_principal) {
        const produit = item.offre.produit_principal.name;
        acc[produit] = (acc[produit] || 0) + 1;
      }
      return acc;
    }, {});
    
    // 9. Taux de TVA
    const tauxTVA = [...new Set(proformas.map(item => item.taux_tva))];
    
    // 10. Données pour graphiques
    const donneesGraphiqueClients = repartitionParClient.map(item => ({
      name: item.client,
      value: item.montantTTC
    }));
    
    const donneesGraphiqueTemporel = repartitionTemporelleArray.map(item => ({
      date: item.date,
      count: item.count
    }));
    
    // Résultat final
    return {
      statistiquesGenerales: {
        nbProformas,
        montantTotalHT,
        montantTotalTVA,
        montantTotalTTC,
        nbClients: clients.length,
        tauxTVA
      },
      clients,
      entites,
      statuts,
      repartitionParClient,
      repartitionParEntite,
      repartitionTemporelle: repartitionTemporelleArray,
      topProformas,
      produitsPrincipaux,
      graphiques: {
        clients: donneesGraphiqueClients,
        temporel: donneesGraphiqueTemporel
      }
    };
  } catch (error) {
    return {
      error: `Erreur lors de l'analyse: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

export default analyseProformas;