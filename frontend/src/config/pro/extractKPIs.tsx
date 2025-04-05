import { format } from 'date-fns';
import { LinearProforma } from '../linearizeProformaData';



// Interface pour les KPI financiers
interface FinancialKPIs {
  montantMoyenHT: number;
  montantMoyenTTC: number;
  montantTotalHT: number;
  montantTotalTTC: number;
  repartitionParEntite: Record<string, number>;
}

// Interface pour les KPI clients
interface ClientKPIs {
  nombreProformasParClient: Record<string, number>;
  montantMoyenParClient: Record<string, number>;
  topClients: Array<{nom: string, montant: number}>;
  repartitionParSecteur: Record<string, number>;
}

// Interface pour les KPI produits
interface ProductKPIs {
  produitsPrincipaux: Record<string, number>;
  produitsAdditionnelsPopulaires: Record<string, number>;
  montantMoyenParCategorie: Record<string, number>;
  repartitionParCategorie: Record<string, {count: number, montant: number}>;
}

// Interface pour les KPI temporels
interface TemporalKPIs {
  delaiMoyenCreationOffreProforma: number;
  tauxConversion: number;
  dureeValiditeMoyenne: number;
  repartitionParPeriode: Record<string, number>;
}

// Interface pour les KPI géographiques
interface GeoKPIs {
  distributionParVille: Record<string, number>;
  distributionParRegion: Record<string, number>;
  distributionParPays: Record<string, number>;
  montantMoyenParRegion: Record<string, number>;
}

// Interface pour les KPI de performance commerciale
interface SalesKPIs {
  performanceParCommercial: Record<string, number>;
  tauxRelanceNecessaire: number;
  dureeMoyenneCycleVente: number;
}

// Interface pour les KPI de documentation
interface DocKPIs {
  pourcentageAvecFichier: number;
  qualiteNotes: {
    avecNotes: number,
    sansNotes: number,
    longueurMoyenne: number
  };
}

// Interface pour les KPI de suivi opérationnel
interface OperationalKPIs {
  delaiMoyenCreationValidation: number;
  pourcentageProformasExpirees: number;
  repartitionParStatut: Record<string, number>;
}

// Interface pour tous les KPI combinés
export interface AllKPIs {
  financial: FinancialKPIs;
  client: ClientKPIs;
  product: ProductKPIs;
  temporal: TemporalKPIs;
  geo: GeoKPIs;
  sales: SalesKPIs;
  doc: DocKPIs;
  operational: OperationalKPIs;
  dataMining: {
    dateRange: { min: string, max: string };
    nombreTotal: number;
  };
}

/**
 * Fonction qui extrait tous les KPI à partir des données proforma linéarisées
 * @param data - Tableau de données proforma linéarisées
 * @returns Objet contenant tous les KPI calculés
 */
export function extractKPIs(data: LinearProforma[]): AllKPIs {
  if (!data || data.length === 0) {
    throw new Error("Aucune donnée à analyser");
  }

  // Fonction utilitaire pour calculer la moyenne
  const average = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  // Fonction utilitaire pour obtenir les N premiers éléments d'un objet trié
  const getTopN = (obj: Record<string, number>, n: number): Array<{nom: string, montant: number}> => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([nom, montant]) => ({ nom, montant }));
  };

  // 1. KPI financiers
  const montantsTotauxParEntite: Record<string, number> = {};
  data.forEach(item => {
    montantsTotauxParEntite[item.entity_code] = (montantsTotauxParEntite[item.entity_code] || 0) + item.montant_ht;
  });

  const financial: FinancialKPIs = {
    montantMoyenHT: average(data.map(item => item.montant_ht)),
    montantMoyenTTC: average(data.map(item => item.montant_ttc)),
    montantTotalHT: data.reduce((sum, item) => sum + item.montant_ht, 0),
    montantTotalTTC: data.reduce((sum, item) => sum + item.montant_ttc, 0),
    repartitionParEntite: montantsTotauxParEntite
  };

  // 2. KPI clients
  const nombreProformasParClient: Record<string, number> = {};
  const montantTotalParClient: Record<string, number> = {};
  const secteurs: Record<string, number> = {};
  
  data.forEach(item => {
    nombreProformasParClient[item.client_nom] = (nombreProformasParClient[item.client_nom] || 0) + 1;
    montantTotalParClient[item.client_nom] = (montantTotalParClient[item.client_nom] || 0) + item.montant_ht;
    secteurs[item.client_secteur] = (secteurs[item.client_secteur] || 0) + 1;
  });

  const montantMoyenParClient: Record<string, number> = {};
  Object.keys(nombreProformasParClient).forEach(client => {
    montantMoyenParClient[client] = montantTotalParClient[client] / nombreProformasParClient[client];
  });

  const client: ClientKPIs = {
    nombreProformasParClient,
    montantMoyenParClient,
    topClients: getTopN(montantTotalParClient, 3),
    repartitionParSecteur: secteurs
  };

  // 3. KPI produits
  const produitsPrincipaux: Record<string, number> = {};
  const produitsAdditionnels: Record<string, number> = {};
  const categoriesProduits: Record<string, number[]> = {};
  const categoriesService: Record<string, {count: number, montant: number}> = {};
  
  data.forEach(item => {
    // Produits principaux
    produitsPrincipaux[item.produit_principal_name] = (produitsPrincipaux[item.produit_principal_name] || 0) + 1;
    
    // Catégories de services
    if (!categoriesService[item.produit_principal_category]) {
      categoriesService[item.produit_principal_category] = { count: 0, montant: 0 };
    }
    categoriesService[item.produit_principal_category].count += 1;
    categoriesService[item.produit_principal_category].montant += item.montant_ht;
    
    // Produits additionnels
    if (item.produits_names) {
      const additionalProducts = item.produits_names.split(',');
      additionalProducts.forEach(product => {
        produitsAdditionnels[product.trim()] = (produitsAdditionnels[product.trim()] || 0) + 1;
      });
    }
    
    // Montant par catégorie
    if (!categoriesProduits[item.produit_principal_category]) {
      categoriesProduits[item.produit_principal_category] = [];
    }
    categoriesProduits[item.produit_principal_category].push(item.montant_ht);
  });

  const montantMoyenParCategorie: Record<string, number> = {};
  Object.keys(categoriesProduits).forEach(category => {
    montantMoyenParCategorie[category] = average(categoriesProduits[category]);
  });

  const product: ProductKPIs = {
    produitsPrincipaux,
    produitsAdditionnelsPopulaires: produitsAdditionnels,
    montantMoyenParCategorie,
    repartitionParCategorie: categoriesService
  };

  // 4. KPI temporels
  const delaisCreation: number[] = [];
  let proformasGagnees = 0;
  const dureesValidite: number[] = [];
  const proformasParMois: Record<string, number> = {};
  
  data.forEach(item => {
    // Délai entre création offre et proforma
    const dateOffre = new Date(item.offre_date_creation);
    const dateProforma = new Date(item.date_creation);
    const delai = Math.floor((dateProforma.getTime() - dateOffre.getTime()) / (1000 * 60 * 60 * 24));
    delaisCreation.push(delai);
    
    // Conversion
    if (item.offre_statut === "GAGNE") {
      proformasGagnees++;
    }
    
    // Durée validité
    if (item.date_expiration) {
      const dateExpiration = new Date(item.date_expiration);
      const duree = Math.floor((dateExpiration.getTime() - dateProforma.getTime()) / (1000 * 60 * 60 * 24));
      dureesValidite.push(duree);
    }
    
    // Répartition par mois
    const moisAnnee = format(dateProforma, 'yyyy-MM');
    proformasParMois[moisAnnee] = (proformasParMois[moisAnnee] || 0) + 1;
  });

  const temporal: TemporalKPIs = {
    delaiMoyenCreationOffreProforma: average(delaisCreation),
    tauxConversion: (proformasGagnees / data.length) * 100,
    dureeValiditeMoyenne: average(dureesValidite),
    repartitionParPeriode: proformasParMois
  };

  // 5. KPI géographiques
  const proformasParVille: Record<string, number> = {};
  const proformasParRegion: Record<string, number> = {};
  const proformasParPays: Record<string, number> = {};
  const montantsParRegion: Record<string, number[]> = {};
  
  data.forEach(item => {
    proformasParVille[item.client_ville] = (proformasParVille[item.client_ville] || 0) + 1;
    proformasParRegion[item.client_region] = (proformasParRegion[item.client_region] || 0) + 1;
    proformasParPays[item.client_pays] = (proformasParPays[item.client_pays] || 0) + 1;
    
    if (!montantsParRegion[item.client_region]) {
      montantsParRegion[item.client_region] = [];
    }
    montantsParRegion[item.client_region].push(item.montant_ht);
  });

  const montantMoyenParRegion: Record<string, number> = {};
  Object.keys(montantsParRegion).forEach(region => {
    montantMoyenParRegion[region] = average(montantsParRegion[region]);
  });

  const geo: GeoKPIs = {
    distributionParVille: proformasParVille,
    distributionParRegion: proformasParRegion,
    distributionParPays: proformasParPays,
    montantMoyenParRegion
  };

  // 6. KPI de performance commerciale
  const montantParCommercial: Record<string, number> = {};
  const proformasAvecRelanceNecessaire = 0;
  const cyclesVente: number[] = [];
  
  data.forEach(item => {
    const commercialId = item.created_by.toString();
    montantParCommercial[commercialId] = (montantParCommercial[commercialId] || 0) + item.montant_ht;
    
    // Pour les proformas avec relance nécessaire (si cette information existe)
    if (item.offre_statut === "GAGNE") {
      const dateOffre = new Date(item.offre_date_creation);
      const dateStatut = new Date(item.offre_date_creation); // Utiliser date_modification si disponible
      const cycle = Math.floor((dateStatut.getTime() - dateOffre.getTime()) / (1000 * 60 * 60 * 24));
      cyclesVente.push(cycle);
    }
  });

  const sales: SalesKPIs = {
    performanceParCommercial: montantParCommercial,
    tauxRelanceNecessaire: (proformasAvecRelanceNecessaire / data.length) * 100,
    dureeMoyenneCycleVente: average(cyclesVente)
  };

  // 7. KPI de documentation
  let proformasAvecFichier = 0;
  let proformasAvecNotes = 0;
  const longueursNotes: number[] = [];
  
  data.forEach(item => {
    if (item.fichier) {
      proformasAvecFichier++;
    }
    
    if (item.notes && item.notes.trim() !== "") {
      proformasAvecNotes++;
      longueursNotes.push(item.notes.length);
    }
  });

  const doc: DocKPIs = {
    pourcentageAvecFichier: (proformasAvecFichier / data.length) * 100,
    qualiteNotes: {
      avecNotes: proformasAvecNotes,
      sansNotes: data.length - proformasAvecNotes,
      longueurMoyenne: average(longueursNotes)
    }
  };

  // 8. KPI de suivi opérationnel
  const delaisValidation: number[] = [];
  let proformasExpirees = 0;
  const statutsProforma: Record<string, number> = {};
  
  data.forEach(item => {
    if (item.date_validation) {
      const dateCreation = new Date(item.date_creation);
      const dateValidation = new Date(item.date_validation);
      const delai = Math.floor((dateValidation.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24));
      delaisValidation.push(delai);
    }
    
    if (item.date_expiration && new Date(item.date_expiration) < new Date()) {
      proformasExpirees++;
    }
    
    statutsProforma[item.statut] = (statutsProforma[item.statut] || 0) + 1;
  });

  const operational: OperationalKPIs = {
    delaiMoyenCreationValidation: average(delaisValidation),
    pourcentageProformasExpirees: (proformasExpirees / data.length) * 100,
    repartitionParStatut: statutsProforma
  };

  // Informations générales sur les données
  const dateMin = new Date(Math.min(...data.map(item => new Date(item.date_creation).getTime())));
  const dateMax = new Date(Math.max(...data.map(item => new Date(item.date_creation).getTime())));

  // Assembler tous les KPI
  return {
    financial,
    client,
    product,
    temporal,
    geo,
    sales,
    doc,
    operational,
    dataMining: {
      dateRange: {
        min: dateMin.toISOString(),
        max: dateMax.toISOString()
      },
      nombreTotal: data.length
    }
  };
}

// Exemple d'utilisation
// const linearData = linearizeProformaData(jsonString);
// const kpis = extractKPIs(linearData);
// console.log(JSON.stringify(kpis, null, 2));