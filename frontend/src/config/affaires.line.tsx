import { IAffaire } from "@/types/affaire";

export interface AffaireLine {
  id: number;
  reference:string;
  dateCreation:string;
  dateModification:string;
  statut:string;
  montant:string;
  dateDebut:string;
  dateFinPrevue:string | null;
  dateFinReelle:string | null;
  responsable:string | null;
  progression:number;
  enRetard:boolean;
  montantRestantAFacturer:string;
  montantRestantAPayer:string;
  notes:string;
  //ostring;ffre
  offreRefference:string;
  offreMontant:string;
  offreFichier:string | null;
  // string;Client
  clientId:number;
  clientNum:string;
  clientNom:string;
  clientEmail:string;
  clientTelephone:string;
  clientVille:string;
  clientRegion:string;
  clientPays:string;
  clientSecteur:string;
  // string;Contact
  contactId:number;
  contactNom:string;
  contactEmail:string;
  contactTelephone:string;
  // string;Entity
  entityId:number;
  entityCode:string;
  entityName:string;
  // string;Produit
  produitId:number;
  produitCode:string;
  produitName:string;
  produitCategory:string;
  produitCount:number;
}

/**
 * Fonction qui linéarise les données d'affaires pour les rendre plus faciles à manipuler
 * 
 * @param data - Tableau d'objets Affaire avec structure imbriquée
 * @returns Tableau d'objets linéarisés
 */
// Fonction de linéarisation pour référence
export function linearizeAffaire(data: IAffaire[]): AffaireLine[] {
  return data.map(affaire => {
    const dateCreation = new Date(affaire.date_creation);
    const dateModification = new Date(affaire.date_modification);
    return {
      id: affaire.id,
      reference: affaire.reference,
      dateCreation: dateCreation.toLocaleDateString(),
      dateModification: dateModification.toLocaleDateString(),
      statut: affaire.statut,
      montant: affaire.montant_total,
      dateDebut: affaire.date_debut,
      dateFinPrevue: affaire.date_fin_prevue,
      dateFinReelle: affaire.date_fin_reelle,
      responsable: affaire.responsable_nom,
      progression: affaire.progression,
      enRetard: affaire.en_retard,
      montantRestantAFacturer: affaire.montant_restant_a_facturer,
      montantRestantAPayer: affaire.montant_restant_a_payer,
      notes: affaire.notes,
      //offre data
      offreRefference: affaire.offre.reference,
      offreMontant: affaire.offre.montant,
      offreFichier: affaire.offre.fichier,
      // Client data
      clientId: affaire.offre.client.id,
      clientNum: affaire.offre.client.c_num,
      clientNom: affaire.offre.client.nom,
      clientEmail: affaire.offre.client.email,
      clientTelephone: affaire.offre.client.telephone,
      clientVille: affaire.offre.client.ville_nom,
      clientRegion: affaire.offre.client.region_nom,
      clientPays: affaire.offre.client.pays_nom,
      clientSecteur: affaire.offre.client.secteur_activite,
      // Contact data
      contactId: affaire.offre.contact.id,
      contactNom: affaire.offre.contact.nom,
      contactEmail: affaire.offre.contact.email,
      contactTelephone: affaire.offre.contact.telephone,
      // Entity data
      entityId: affaire.offre.entity.id,
      entityCode: affaire.offre.entity.code,
      entityName: affaire.offre.entity.name,
      // Produit data
      produitId: affaire.offre.produit_principal.id,
      produitCode: affaire.offre.produit_principal.code,
      produitName: affaire.offre.produit_principal.name,
      produitCategory: affaire.offre.produit_principal.category,
      produitCount: affaire.offre.produits.length,
    };
  });
}