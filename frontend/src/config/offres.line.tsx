import { OffreDetail } from "@/types/offre";

/**
 * Fonction qui linéarise les données d'offres pour les rendre plus faciles à manipuler
 * 
 * @param data - Tableau d'objets Offre avec structure imbriquée
 * @returns Tableau d'objets linéarisés
 */
export function linearizeOffre(data: OffreDetail[]): unknown[] {
  return data.map(offre => {
    // Date formatting
    const dateCreation = new Date(offre.date_creation);
    const dateModification = new Date(offre.date_modification);
    
    // Base linearized object
    const linearizedObj = {
      id: offre.id,
      reference: offre.reference,
      dateCreation: dateCreation.toLocaleDateString(),
      dateModification: dateModification.toLocaleDateString(),
      statut: offre.statut,
      montant: offre.montant,
      dateRelance: offre.relance ? new Date(offre.relance).toLocaleDateString() : null,
      // Client data
      clientId: offre.client.id,
      clientNum: offre.client.c_num,
      clientNom: offre.client.nom,
      clientEmail: offre.client.email,
      clientTelephone: offre.client.telephone,
      clientVille: offre.client.ville_nom,
      clientRegion: offre.client.region_nom,
      clientPays: offre.client.pays_nom,
      clientSecteur: offre.client.secteur_activite,
      
      // Contact data
      contactId: offre.contact.id,
      contactNom: offre.contact.nom,
      contactEmail: offre.contact.email,
      contactTelephone: offre.contact.telephone,
      
      // Entity data
      entityId: offre.entity.id,
      entityCode: offre.entity.code,
      entityName: offre.entity.name,
      
      // Produit principal data
      produitPrincipalId: offre.produit_principal.id,
      produitPrincipalCode: offre.produit_principal.code,
      produitPrincipalCategory: offre.produit_principal.category,
      produitPrincipalName: offre.produit_principal.name,
      
      // Nombre de produits associés
      nombreProduits: offre.produits.length,
      
      // Liste des codes de produits
      produitsCode: offre.produits.map(p => p.code).join(', '),
      
      // Liste des noms de produits
      produitsNom: offre.produits.map(p => p.name).join(', '),
      
      notes: offre.notes,
      sequenceNumber: offre.sequence_number,
      fichier: offre.fichier,
      
      // Ajout d'indicateurs pour faciliter l'analyse
      hasFichier: offre.fichier !== null,
      annee: dateCreation.getFullYear(),
      mois: dateCreation.getMonth() + 1,
      trimestre: Math.floor(dateCreation.getMonth() / 3) + 1,
    };
    
    return linearizedObj;
  });
}
