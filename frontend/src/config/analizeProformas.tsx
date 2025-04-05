import { format, parseISO, isAfter } from 'date-fns';
import { IProforma } from '@/services/proformaService';

/**
 * Interface pour les statistiques générées par l'analyse des proformas
 */
export interface ProformasAnalytics {
  // Données de base
  proformas: IProforma[];
  totalCount: number;
  
  // Statistiques par statut
  statuts: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantHT: number;
      montantTVA: number;
      expirant: number;
    }
  };
  
  // Statistiques globales
  global: {
    montantTotalHT: number;
    montantTotalTTC: number;
    montantTotalTVA: number;
    tauxValidation: number;
    tauxConversion: number;
    montantMoyen: number;
  };
  
  // Statistiques par client
  clients: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantHT: number;
      montantTVA: number;
      expirant: number;
      statuts: { [key: string]: number };
      entities: { [key: string]: number };
    }
  };
  
  // Statistiques par entité
  entities: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantHT: number;
      expirant: number;
    }
  };
  
  // Statistiques temporelles
  tempsParMois: {
    [key: string]: {
      count: number;
      montantTotal: number;
      expirant: number;
    }
  };
  
  // Listes filtrées
  proformasExpirant: IProforma[];
  proformasRecentes: IProforma[];
  clientsUniques: string[];
  entitesUniques: string[];
  
  // Compteurs pour le tableau de bord
  compteurs: {
    proformasTotal: number;
    proformasEnCours: number;
    proformasValidees: number;
    proformasRefusees: number;
    proformasExpirant: number;
    pourcentageValidation: number;
    clientsUniques: number;
    entitesUniques: number;
  };
}

/**
 * Analyser un ensemble de proformas pour extraire des statistiques utiles
 * @param proformas Liste des proformas à analyser
 * @returns Objet contenant les statistiques et données linéarisées
 */
export const analyzeProformas = (proformas: IProforma[]): ProformasAnalytics => {
  if (!proformas || !Array.isArray(proformas) || proformas.length === 0) {
    // Retourner un objet d'analyse vide si aucune donnée
    return {
      proformas: [],
      totalCount: 0,
      statuts: {},
      global: {
        montantTotalHT: 0,
        montantTotalTTC: 0,
        montantTotalTVA: 0,
        tauxValidation: 0,
        tauxConversion: 0,
        montantMoyen: 0
      },
      clients: {},
      entities: {},
      tempsParMois: {},
      proformasExpirant: [],
      proformasRecentes: [],
      clientsUniques: [],
      entitesUniques: [],
      compteurs: {
        proformasTotal: 0,
        proformasEnCours: 0,
        proformasValidees: 0,
        proformasRefusees: 0,
        proformasExpirant: 0,
        pourcentageValidation: 0,
        clientsUniques: 0,
        entitesUniques: 0
      }
    };
  }

  // Structures pour collecter les statistiques
  const statuts: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantHT: number;
      montantTVA: number;
      expirant: number;
    }
  } = {};
  
  const clients: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantHT: number;
      montantTVA: number;
      expirant: number;
      statuts: { [key: string]: number };
      entities: { [key: string]: number };
    }
  } = {};
  
  const entities: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantHT: number;
      expirant: number;
    }
  } = {};
  
  const tempsParMois: {
    [key: string]: {
      count: number;
      montantTotal: number;
      expirant: number;
    }
  } = {};
  
  // Ensembles pour collecter les valeurs uniques
  const clientsSet = new Set<string>();
  const entitesSet = new Set<string>();
  
  // Listes spéciales
  const proformasExpirant: IProforma[] = [];
  
  // Variables pour les totaux globaux
  let montantTotalHT = 0;
  let montantTotalTTC = 0;
  let montantTotalTVA = 0;
  
  // Compteurs pour les statuts spécifiques
  let countValidees = 0;
  let countEnCours = 0;
  let countRefusees = 0;
  
  // Trier les proformas par date de création (plus récentes en premier)
  const proformasSorted = [...proformas].sort((a, b) => 
    new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
  );
  
  // Collecter les 5 proformas les plus récentes
  const proformasRecentes = proformasSorted.slice(0, 5);

  // Date courante pour évaluer les proformas expirant dans 7 jours
  const currentDate = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(currentDate.getDate() + 7);
  
  // Analyser chaque proforma
  proformas.forEach(proforma => {
    // Extraire les valeurs numériques
    const montantHT = Number(proforma.montant_ht) || 0;
    const montantTVA = Number(proforma.montant_tva) || 0;
    const montantTTC = Number(proforma.montant_ttc) || 0;
    
    // Mise à jour des totaux globaux
    montantTotalHT += montantHT;
    montantTotalTVA += montantTVA;
    montantTotalTTC += montantTTC;
    
    // Incrémenter les compteurs par statut
    if (proforma.statut === 'VALIDE') countValidees++;
    if (proforma.statut === 'EN_COURS') countEnCours++;
    if (proforma.statut === 'REFUSE') countRefusees++;
    
    // Collecter les ensembles de valeurs uniques
    const clientNom = typeof proforma.offre === 'object' ? proforma.offre.client.nom : proforma.client_nom;
    clientsSet.add(clientNom);
    
    // Extraire le code d'entité
    let entityCode = '';
    if (typeof proforma.offre === 'object' && proforma.offre.entity && proforma.offre.entity.code) {
      entityCode = proforma.offre.entity.code;
    } else {
      entityCode = proforma.entity_code;
    }
    entitesSet.add(entityCode);
    
    // Vérifier si la proforma expire bientôt (dans les 7 prochains jours)
    let estExpirant = false;
    if (proforma.date_expiration && proforma.statut === 'EN_COURS') {
      const dateExpiration = parseISO(proforma.date_expiration);
      if (isAfter(dateExpiration, currentDate) && isAfter(sevenDaysLater, dateExpiration)) {
        estExpirant = true;
        proformasExpirant.push(proforma);
      }
    }
    
    // Statistiques par statut
    const statut = proforma.statut;
    if (!statuts[statut]) {
      statuts[statut] = {
        count: 0,
        montantTotal: 0,
        montantHT: 0,
        montantTVA: 0,
        expirant: 0
      };
    }
    statuts[statut].count += 1;
    statuts[statut].montantTotal += montantTTC;
    statuts[statut].montantHT += montantHT;
    statuts[statut].montantTVA += montantTVA;
    if (estExpirant) statuts[statut].expirant += 1;
    
    // Statistiques par client
    if (!clients[clientNom]) {
      clients[clientNom] = {
        count: 0,
        montantTotal: 0,
        montantHT: 0,
        montantTVA: 0,
        expirant: 0,
        statuts: {},
        entities: {}
      };
    }
    clients[clientNom].count += 1;
    clients[clientNom].montantTotal += montantTTC;
    clients[clientNom].montantHT += montantHT;
    clients[clientNom].montantTVA += montantTVA;
    if (estExpirant) clients[clientNom].expirant += 1;
    
    // Compter les statuts par client
    if (!clients[clientNom].statuts[statut]) {
      clients[clientNom].statuts[statut] = 0;
    }
    clients[clientNom].statuts[statut] += 1;
    
    // Compter les entités par client
    if (entityCode) {
      if (!clients[clientNom].entities[entityCode]) {
        clients[clientNom].entities[entityCode] = 0;
      }
      clients[clientNom].entities[entityCode] += 1;
    }
    
    // Statistiques par entité
    if (entityCode) {
      if (!entities[entityCode]) {
        entities[entityCode] = {
          count: 0,
          montantTotal: 0,
          montantHT: 0,
          expirant: 0
        };
      }
      entities[entityCode].count += 1;
      entities[entityCode].montantTotal += montantTTC;
      entities[entityCode].montantHT += montantHT;
      if (estExpirant) entities[entityCode].expirant += 1;
    }
    
    // Statistiques temporelles (par mois)
    try {
      const dateCreation = parseISO(proforma.date_creation);
      const moisCle = format(dateCreation, 'yyyy-MM');
      
      if (!tempsParMois[moisCle]) {
        tempsParMois[moisCle] = {
          count: 0,
          montantTotal: 0,
          expirant: 0
        };
      }
      
      tempsParMois[moisCle].count += 1;
      tempsParMois[moisCle].montantTotal += montantTTC;
      if (estExpirant) tempsParMois[moisCle].expirant += 1;
    } catch (error) {
      console.error('Erreur lors du traitement de la date:', error);
    }
  });
  
  // Calculer les moyennes et pourcentages globaux
  const totalCount = proformas.length;
  const montantMoyen = totalCount > 0 ? montantTotalTTC / totalCount : 0;
  const tauxValidation = totalCount > 0 ? (countValidees / totalCount) * 100 : 0;
  
  // Calculer le taux de conversion (ici défini comme proformas validées / proformas traitées)
  const proformasTraitees = countValidees + countRefusees;
  const tauxConversion = proformasTraitees > 0 ? (countValidees / proformasTraitees) * 100 : 0;
  
  // Calculer le pourcentage de proformas expirantes
  const pourcentageExpirant = totalCount > 0 ? (proformasExpirant.length / totalCount) * 100 : 0;
  
  // Construire l'objet de retour
  return {
    proformas: proformas,
    totalCount,
    statuts,
    global: {
      montantTotalHT,
      montantTotalTTC,
      montantTotalTVA,
      tauxValidation,
      tauxConversion,
      montantMoyen
    },
    clients,
    entities,
    tempsParMois,
    proformasExpirant,
    proformasRecentes,
    clientsUniques: Array.from(clientsSet),
    entitesUniques: Array.from(entitesSet),
    compteurs: {
      proformasTotal: totalCount,
      proformasEnCours: countEnCours,
      proformasValidees: countValidees,
      proformasRefusees: countRefusees,
      proformasExpirant: proformasExpirant.length,
      pourcentageValidation: tauxValidation,
      clientsUniques: clientsSet.size,
      entitesUniques: entitesSet.size
    }
  };
};

/**
 * Convertit les résultats d'analyse en format de tableau de bord
 * Compatible avec le format attendu par les composants KDStats
 */
export const convertToDashboardData = (analytics: ProformasAnalytics) => {
  // Créer le format de compteurs par statut pour KDStats
  const compteurs_statut = Object.entries(analytics.statuts).map(([statut, data]) => ({
    statut,
    count: data.count
  }));
  
  // Calculer le résumé financier global
  const resume_financier = {
    montant_total_ttc: analytics.global.montantTotalTTC,
    montant_total_ht: analytics.global.montantTotalHT,
    montant_total_tva: analytics.global.montantTotalTVA,
    taux_validation: analytics.global.tauxValidation,
    taux_conversion: analytics.global.tauxConversion
  };
  
  // Retourner les données au format attendu par KDStats
  return {
    compteurs_statut,
    resume_financier,
    dernieres_proformas: analytics.proformasRecentes,
    proformas_expirant: analytics.proformasExpirant
  };
};

/**
 * Extrait des données pour la visualisation sous forme de graphique
 */
export const extractChartData = (analytics: ProformasAnalytics) => {
  // Données pour un graphique de montants par statut
  const montantsParStatut = Object.entries(analytics.statuts).map(([statut, data]) => {
    const statuts = {
      'BROUILLON': 'Brouillon',
      'EN_COURS': 'En cours',
      'VALIDE': 'Validé',
      'REFUSE': 'Refusé',
      'EXPIRE': 'Expiré',
      'ANNULE': 'Annulé'
    };
    
    return {
      name: statuts[statut as keyof typeof statuts] || statut,
      value: data.montantTotal,
      count: data.count
    };
  });
  
  // Données pour un graphique de distribution des proformas par client
  const distributionParClient = Object.entries(analytics.clients)
    .map(([client, data]) => ({
      name: client,
      value: data.count,
      montant: data.montantTotal
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Prendre les 10 premiers clients
  
  // Données pour un graphique d'évolution temporelle
  const evolutionTemporelle = Object.entries(analytics.tempsParMois)
    .map(([mois, data]) => {
      // Convertir le format yyyy-MM à un format plus lisible
      const [year, month] = mois.split('-');
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const displayMonth = months[parseInt(month, 10) - 1];
      
      return {
        mois: `${displayMonth} ${year}`,
        count: data.count,
        montant: data.montantTotal,
        expirant: data.expirant
      };
    })
    .sort((a, b) => a.mois.localeCompare(b.mois));
  
  // Données pour un graphique de statut par entité
  const statutParEntite = Object.entries(analytics.entities).map(([entite, data]) => ({
    entite,
    count: data.count,
    montant: data.montantTotal,
    expirant: data.expirant
  }));
  
  return {
    montantsParStatut,
    distributionParClient,
    evolutionTemporelle,
    statutParEntite
  };
};