import { format, parseISO } from 'date-fns';
import { IAffaire } from '@/types/affaire';

/**
 * Interface pour les statistiques générées par l'analyse des affaires
 */
export interface AffairesAnalytics {
  // Données de base
  affaires: IAffaire[];
  totalCount: number;
  
  // Statistiques par statut
  statuts: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantFacture: number;
      montantPaye: number;
      enRetard: number;
    }
  };
  
  // Statistiques globales
  global: {
    montantTotal: number;
    montantFacture: number;
    montantPaye: number;
    tauxFacturation: number;
    tauxPaiement: number;
    montantMoyen: number;
    progressionMoyenne: number;
  };
  
  // Statistiques par client
  clients: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantFacture: number;
      montantPaye: number;
      enRetard: number;
      statuts: { [key: string]: number };
      entities: { [key: string]: number };
    }
  };
  
  // Statistiques par entité
  entities: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantFacture: number;
      enRetard: number;
    }
  };
  
  // Statistiques temporelles
  tempsParMois: {
    [key: string]: {
      count: number;
      montantTotal: number;
      enRetard: number;
    }
  };
  
  // Listes filtrées
  affairesEnRetard: IAffaire[];
  affairesRecentes: IAffaire[];
  clientsUniques: string[];
  responsablesUniques: string[];
  entitesUniques: string[];
  
  // Compteurs pour le tableau de bord
  compteurs: {
    affairesTotal: number;
    affairesEnRetard: number;
    pourcentageEnRetard: number;
    clientsUniques: number;
    responsablesUniques: number;
    entitesUniques: number;
  };
}

/**
 * Analyser un ensemble d'affaires pour extraire des statistiques utiles
 * @param affaires Liste des affaires à analyser
 * @returns Objet contenant les statistiques et données linéarisées
 */
export const analyzeAffaires = (affaires: IAffaire[]): AffairesAnalytics => {
  if (!affaires || !Array.isArray(affaires) || affaires.length === 0) {
    // Retourner un objet d'analyse vide si aucune donnée
    return {
      affaires: [],
      totalCount: 0,
      statuts: {},
      global: {
        montantTotal: 0,
        montantFacture: 0,
        montantPaye: 0,
        tauxFacturation: 0,
        tauxPaiement: 0,
        montantMoyen: 0,
        progressionMoyenne: 0
      },
      clients: {},
      entities: {},
      tempsParMois: {},
      affairesEnRetard: [],
      affairesRecentes: [],
      clientsUniques: [],
      responsablesUniques: [],
      entitesUniques: [],
      compteurs: {
        affairesTotal: 0,
        affairesEnRetard: 0,
        pourcentageEnRetard: 0,
        clientsUniques: 0,
        responsablesUniques: 0,
        entitesUniques: 0
      }
    };
  }

  // Structures pour collecter les statistiques
  const statuts: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantFacture: number;
      montantPaye: number;
      enRetard: number;
    }
  } = {};
  
  const clients: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantFacture: number;
      montantPaye: number;
      enRetard: number;
      statuts: { [key: string]: number };
      entities: { [key: string]: number };
    }
  } = {};
  
  const entities: {
    [key: string]: {
      count: number;
      montantTotal: number;
      montantFacture: number;
      enRetard: number;
    }
  } = {};
  
  const tempsParMois: {
    [key: string]: {
      count: number;
      montantTotal: number;
      enRetard: number;
    }
  } = {};
  
  // Ensembles pour collecter les valeurs uniques
  const clientsSet = new Set<string>();
  const responsablesSet = new Set<string>();
  const entitesSet = new Set<string>();
  
  // Listes spéciales
  const affairesEnRetard: IAffaire[] = [];
  
  // Variables pour les totaux globaux
  let montantTotalGlobal = 0;
  let montantFactureGlobal = 0;
  let montantPayeGlobal = 0;
  let progressionTotale = 0;
  
  // Trier les affaires par date de création (plus récentes en premier)
  const affairesSorted = [...affaires].sort((a, b) => 
    new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
  );
  
  // Collecter les 5 affaires les plus récentes
  const affairesRecentes = affairesSorted.slice(0, 5);
  
  // Analyser chaque affaire
  affaires.forEach(affaire => {
    // Extraire les valeurs numériques
    const montantTotal = parseFloat(affaire.montant_total) || 0;
    const montantFacture = parseFloat(affaire.montant_facture) || 0;
    const montantPaye = parseFloat(affaire.montant_paye) || 0;
    
    // Mise à jour des totaux globaux
    montantTotalGlobal += montantTotal;
    montantFactureGlobal += montantFacture;
    montantPayeGlobal += montantPaye;
    progressionTotale += affaire.progression || 0;
    
    // Collecter les ensembles de valeurs uniques
    clientsSet.add(affaire.client_nom);
    if (affaire.responsable_nom) responsablesSet.add(affaire.responsable_nom);
    
    // Extraire le code d'entité depuis l'offre
    let entityCode = '';
    if (typeof affaire.offre === 'object' && affaire.offre.entity && affaire.offre.entity.code) {
      entityCode = affaire.offre.entity.code;
      entitesSet.add(entityCode);
    }
    
    // Collecter les affaires en retard
    if (affaire.en_retard) {
      affairesEnRetard.push(affaire);
    }
    
    // Statistiques par statut
    const statut = affaire.statut;
    if (!statuts[statut]) {
      statuts[statut] = {
        count: 0,
        montantTotal: 0,
        montantFacture: 0,
        montantPaye: 0,
        enRetard: 0
      };
    }
    statuts[statut].count += 1;
    statuts[statut].montantTotal += montantTotal;
    statuts[statut].montantFacture += montantFacture;
    statuts[statut].montantPaye += montantPaye;
    if (affaire.en_retard) statuts[statut].enRetard += 1;
    
    // Statistiques par client
    const clientNom = affaire.client_nom;
    if (!clients[clientNom]) {
      clients[clientNom] = {
        count: 0,
        montantTotal: 0,
        montantFacture: 0,
        montantPaye: 0,
        enRetard: 0,
        statuts: {},
        entities: {}
      };
    }
    clients[clientNom].count += 1;
    clients[clientNom].montantTotal += montantTotal;
    clients[clientNom].montantFacture += montantFacture;
    clients[clientNom].montantPaye += montantPaye;
    if (affaire.en_retard) clients[clientNom].enRetard += 1;
    
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
          montantFacture: 0,
          enRetard: 0
        };
      }
      entities[entityCode].count += 1;
      entities[entityCode].montantTotal += montantTotal;
      entities[entityCode].montantFacture += montantFacture;
      if (affaire.en_retard) entities[entityCode].enRetard += 1;
    }
    
    // Statistiques temporelles (par mois)
    try {
      const dateDebut = parseISO(affaire.date_debut);
      const moisCle = format(dateDebut, 'yyyy-MM');
      
      if (!tempsParMois[moisCle]) {
        tempsParMois[moisCle] = {
          count: 0,
          montantTotal: 0,
          enRetard: 0
        };
      }
      
      tempsParMois[moisCle].count += 1;
      tempsParMois[moisCle].montantTotal += montantTotal;
      if (affaire.en_retard) tempsParMois[moisCle].enRetard += 1;
    } catch (error) {
      console.error('Erreur lors du traitement de la date:', error);
    }
  });
  
  // Calculer les moyennes et pourcentages globaux
  const totalCount = affaires.length;
  const montantMoyen = totalCount > 0 ? montantTotalGlobal / totalCount : 0;
  const progressionMoyenne = totalCount > 0 ? progressionTotale / totalCount : 0;
  const tauxFacturation = montantTotalGlobal > 0 ? (montantFactureGlobal / montantTotalGlobal) * 100 : 0;
  const tauxPaiement = montantFactureGlobal > 0 ? (montantPayeGlobal / montantFactureGlobal) * 100 : 0;
  
  // Calculer le pourcentage d'affaires en retard
  const pourcentageEnRetard = totalCount > 0 ? (affairesEnRetard.length / totalCount) * 100 : 0;
  
  // Construire l'objet de retour
  return {
    affaires: affaires,
    totalCount,
    statuts,
    global: {
      montantTotal: montantTotalGlobal,
      montantFacture: montantFactureGlobal,
      montantPaye: montantPayeGlobal,
      tauxFacturation,
      tauxPaiement,
      montantMoyen,
      progressionMoyenne
    },
    clients,
    entities,
    tempsParMois,
    affairesEnRetard,
    affairesRecentes,
    clientsUniques: Array.from(clientsSet),
    responsablesUniques: Array.from(responsablesSet),
    entitesUniques: Array.from(entitesSet),
    compteurs: {
      affairesTotal: totalCount,
      affairesEnRetard: affairesEnRetard.length,
      pourcentageEnRetard,
      clientsUniques: clientsSet.size,
      responsablesUniques: responsablesSet.size,
      entitesUniques: entitesSet.size
    }
  };
};

/**
 * Convertit les résultats d'analyse en format de tableau de bord
 * Compatible avec le format attendu par les composants KDStats
 */
export const convertToDashboardData = (analytics: AffairesAnalytics) => {
  // Créer le format de compteurs par statut pour KDStats
  const compteurs_statut = Object.entries(analytics.statuts).map(([statut, data]) => ({
    statut,
    count: data.count
  }));
  
  // Calculer le résumé financier global
  const resume_financier = {
    montant_total: analytics.global.montantTotal,
    montant_facture: analytics.global.montantFacture,
    montant_paye: analytics.global.montantPaye,
    montant_restant_a_facturer: analytics.global.montantTotal - analytics.global.montantFacture,
    montant_restant_a_payer: analytics.global.montantFacture - analytics.global.montantPaye
  };
  
  // Retourner les données au format attendu par KDStats
  return {
    compteurs_statut,
    resume_financier,
    dernieres_affaires: analytics.affairesRecentes,
    affaires_en_retard: analytics.affairesEnRetard
  };
};

/**
 * Extrait des données pour la visualisation sous forme de graphique
 */
export const extractChartData = (analytics: AffairesAnalytics) => {
  // Données pour un graphique de montants par statut
  const montantsParStatut = Object.entries(analytics.statuts).map(([statut, data]) => ({
    name: statut,
    value: data.montantTotal,
    count: data.count
  }));
  
  // Données pour un graphique de distribution des affaires par client
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
    .map(([mois, data]) => ({
      mois,
      count: data.count,
      montant: data.montantTotal,
      enRetard: data.enRetard
    }))
    .sort((a, b) => a.mois.localeCompare(b.mois));
  
  // Données pour un graphique de statut par entité
  const statutParEntite = Object.entries(analytics.entities).map(([entite, data]) => ({
    entite,
    count: data.count,
    montant: data.montantTotal,
    enRetard: data.enRetard
  }));
  
  return {
    montantsParStatut,
    distributionParClient,
    evolutionTemporelle,
    statutParEntite
  };
};