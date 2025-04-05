import { Proforma } from "@/types/Proforma";

export interface LinearProforma {
  created_by: string | number;
  id: number;
  reference: string;
  statut: string;
  date_creation: string;
  date_validation: string | null;
  date_expiration: string | null;
  montant_ht: number;
  taux_tva: number;
  montant_tva: number;
  montant_ttc: number;
  notes: string | null;
  fichier: string | null;
  sequence_number: number;
  
  // Offre info
  offre_id: number;
  offre_reference: string;
  offre_date_creation: string;
  offre_statut: string;
  offre_montant: number;
  offre_notes: string;
  
  // Client info
  client_id: number;
  client_num: string;
  client_nom: string;
  client_email: string | null;
  client_telephone: string | null;
  client_ville: string;
  client_region: string;
  client_pays: string;
  client_secteur: string;
  
  // Contact info
  contact_id: number;
  contact_nom: string;
  contact_email: string | null;
  contact_telephone: string | null;
  
  // Entity info
  entity_id: number;
  entity_code: string;
  entity_name: string;
  
  // Produit principal
  produit_principal_id: number;
  produit_principal_code: string;
  produit_principal_category: string;
  produit_principal_name: string;
  
  // Produits additionnels (sous forme de chaîne séparée par des virgules)
  produits_ids: string;
  produits_codes: string;
  produits_categories: string;
  produits_names: string;
}

// fonction pour formater la date
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Convertit les données de factures proforma en format linéaire
 * @param jsonData - Données JSON des factures proforma
 * @returns Tableau de factures proforma en format linéaire
 */
function linearizeProformaData(data: Proforma[]): LinearProforma[] {
  try {
    // Analyser les données JSON
    const proformas = data;
    // Transformer chaque proforma en format linéaire
    return proformas.map(proforma => {
      // Extraire les produits additionnels
      const produits = proforma.offre.produits || [];
      const produits_ids = produits.map(p => p.id).join(',');
      const produits_codes = produits.map(p => p.code).join(',');
      const created_by = proforma.created_by; // Ajout du champ manquant
      const produits_categories = produits.map(p => p.category).join(',');
      const produits_names = produits.map(p => p.name).join(',');
      
      // Créer et retourner l'objet linéarisé
      return {
        id: proforma.id,
        created_by: created_by,
        reference: proforma.reference,
        statut: proforma.statut,
        date_creation: formatDate(proforma.date_creation),
        date_validation: proforma.date_validation ? formatDate(proforma.date_validation) : null,
        date_expiration: proforma.date_expiration ? formatDate(proforma.date_expiration) : null,
        montant_ht: parseFloat(proforma.montant_ht),
        taux_tva: parseFloat(proforma.taux_tva),
        montant_tva: parseFloat(proforma.montant_tva),
        montant_ttc: parseFloat(proforma.montant_ttc),
        notes: proforma.notes,
        fichier: proforma.fichier,
        sequence_number: proforma.sequence_number,
        
        // Offre info
        offre_id: proforma.offre.id,
        offre_reference: proforma.offre.reference,
        offre_date_creation: formatDate(proforma.offre.date_creation),
        offre_statut: proforma.offre.statut,
        offre_montant: proforma.offre.montant,
        offre_notes: proforma.offre.notes,
        
        // Client info
        client_id: proforma.offre.client.id,
        client_num: proforma.offre.client.c_num,
        client_nom: proforma.offre.client.nom,
        client_email: proforma.offre.client.email || null,
        client_telephone: proforma.offre.client.telephone || null,
        client_ville: proforma.offre.client.ville_nom,
        client_region: proforma.offre.client.region_nom,
        client_pays: proforma.offre.client.pays_nom,
        client_secteur: proforma.offre.client.secteur_activite,
        
        // Contact info
        contact_id: proforma.offre.contact.id,
        contact_nom: proforma.offre.contact.nom,
        contact_email: proforma.offre.contact.email || null,
        contact_telephone: proforma.offre.contact.telephone || null,
        
        // Entity info
        entity_id: proforma.offre.entity.id,
        entity_code: proforma.offre.entity.code,
        entity_name: proforma.offre.entity.name,
        
        // Produit principal
        produit_principal_id: proforma.offre.produit_principal.id,
        produit_principal_code: proforma.offre.produit_principal.code,
        produit_principal_category: proforma.offre.produit_principal.category,
        produit_principal_name: proforma.offre.produit_principal.name,
        
        // Produits additionnels
        produits_ids,
        produits_codes,
        produits_categories,
        produits_names
      };
    });
  } catch (error) {
    console.error('Erreur lors de la linéarisation des données:', error);
    throw new Error('Erreur lors de la linéarisation des données');
  }
}

// Exemple d'utilisation
// const jsonData = '[...]'; // Votre JSON ici
// const linearData = linearizeProformaData(jsonData);
// console.log(linearData);

export { linearizeProformaData };