import { OffreDetail } from "@/types/offre";

/**
 * Interface pour les données d'offre linéarisées
 * Définit clairement la structure de données retournée par linearizeOffre
 */
export interface LinearizedOffre {
  // Informations principales de l'offre
  id: number;
  reference: string;
  dateCreation: string;
  dateModification: string;
  statut: string;
  montant: number;
  dateRelance: string | null;
  notes: string | null;
  sequenceNumber: number;
  fichier: string | null;
  hasFichier: boolean;

  // date 
  date_envoi : string | null
  date_validation : string | null
  date_cloture : string | null

  // Métadonnées temporelles pour analyses
  annee: number;
  mois: number;
  trimestre: number;
  semaine: number;
  jourSemaine: number;
  
  // Informations sur l'utilisateur
  userId: number;
  userNom: string;
  userEmail: string;
  
  // Informations sur le client
  clientId: number;
  clientNum: string;
  clientNom: string;
  clientEmail: string | null;
  clientTelephone: string | null;
  clientVille: string | null;
  clientRegion: string | null;
  clientPays: string | null;
  clientSecteur: string | null;
  
  // Informations sur le contact
  contactId: number;
  contactNom: string;
  contactEmail: string | null;
  contactTelephone: string | null;
  
  // Informations sur l'entité
  entityId: number;
  entityCode: string;
  entityName: string;
  
  // Informations sur le produit principal
  produitPrincipalId: number;
  produitPrincipalCode: string;
  produitPrincipalCategory: string;
  produitPrincipalName: string;
  
  // Informations sur les produits associés
  nombreProduits: number;
  produitsCode: string;
  produitsNom: string;
  // produitsMontantTotal: number;
  produitsCategories: string[];
}

/**
 * Fonction qui linéarise les données d'offres pour les rendre plus faciles à manipuler
 * Version améliorée avec typage fort et métadonnées supplémentaires
 *
 * @param data - Tableau d'objets Offre avec structure imbriquée
 * @returns Tableau d'objets linéarisés avec typage fort
 */
export function linearizeOffre(data: OffreDetail[]): LinearizedOffre[] {
  return data.map(offre => {
    // Traitement des dates
    const dateCreation = new Date(offre.date_creation);
    const dateModification = new Date(offre.date_modification);
    const dateRelance = offre.relance ? new Date(offre.relance) : null;
    
    const date_envoi = offre.date_envoi ? new Date(offre.date_envoi) : null;
    const date_validation = offre.date_validation ? new Date(offre.date_validation) : null;
    const date_cloture = offre.date_cloture ? new Date(offre.date_cloture) : null;
    // Calcul des métadonnées temporelles
    const annee = dateCreation.getFullYear();
    const mois = dateCreation.getMonth() + 1;
    const trimestre = Math.floor(dateCreation.getMonth() / 3) + 1;
    const semaine = getWeekNumber(dateCreation);
    const jourSemaine = dateCreation.getDay();
    
    // Calcul du montant total des produits
    // const produitsMontantTotal = offre.produits.reduce((sum, produit) => 
    //   sum + (produit.montant || 0), 0);
    
    // Extraction des catégories uniques de produits
    const produitsCategories = Array.from(
      new Set(offre.produits.map(p => p.category))
    );

    // Construction de l'objet linéarisé
    const linearizedObj: LinearizedOffre = {
      // Informations principales
      id: offre.id,
      reference: offre.reference,
      dateCreation: formatDate(dateCreation),
      dateModification: formatDate(dateModification),
      statut: offre.statut,
      montant: offre.montant,
      dateRelance: dateRelance ? formatDate(dateRelance) : null,
      notes: offre.notes,
      sequenceNumber: offre.sequence_number,
      fichier: offre.fichier,
      hasFichier: offre.fichier !== null && offre.fichier !== "",
      
      // Métadonnées temporelles
      annee,
      mois,
      trimestre,
      semaine,
      jourSemaine,

      // Dates spécifiques
      date_envoi: date_envoi ? formatDate(date_envoi) : null,
      date_validation: date_validation ? formatDate(date_validation) : null,
      date_cloture: date_cloture ? formatDate(date_cloture) : null,
      
      // Utilisateur
      userId: offre.user.id,
      userNom: offre.user.username,
      userEmail: offre.user.email,
      
      // Client
      clientId: offre.client.id,
      clientNum: offre.client.c_num,
      clientNom: offre.client.nom,
      clientEmail: offre.client.email,
      clientTelephone: offre.client.telephone,
      clientVille: offre.client.ville_nom,
      clientRegion: offre.client.region_nom,
      clientPays: offre.client.pays_nom,
      clientSecteur: offre.client.secteur_activite,
      
      // Contact
      contactId: offre.contact.id,
      contactNom: offre.contact.nom,
      contactEmail: offre.contact.email,
      contactTelephone: offre.contact.telephone,
      
      // Entité
      entityId: offre.entity.id,
      entityCode: offre.entity.code,
      entityName: offre.entity.name,
      
      // Produit principal
      produitPrincipalId: offre.produit_principal.id,
      produitPrincipalCode: offre.produit_principal.code,
      produitPrincipalCategory: offre.produit_principal.category,
      produitPrincipalName: offre.produit_principal.name,
      
      // Produits associés
      nombreProduits: offre.produits.length,
      produitsCode: offre.produits.map(p => p.code).join(', '),
      produitsNom: offre.produits.map(p => p.name).join(', '),
      // produitsMontantTotal,
      produitsCategories,
    };

    return linearizedObj;
  });
}

/**
 * Fonction utilitaire pour formater les dates de manière cohérente
 * 
 * @param date - Date à formater
 * @returns Chaîne de date formatée (JJ/MM/AAAA)
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Fonction utilitaire pour calculer le numéro de semaine dans l'année
 * 
 * @param date - Date pour laquelle calculer le numéro de semaine
 * @returns Numéro de semaine (1-53)
 */
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}