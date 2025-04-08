import { OpportuniteDetail } from "@/types/opportunite.types";




// Interface for linearized opportunity
export interface LinearizedOpportunity {
  // Opportunity core details
  id: number;
  reference: string;
  statut: string;
  statut_display: string;
  montant: number;
  montant_estime: number;
  probabilite: number;
  valeur_ponderee: number;
  date_creation: string;
  date_modification: string;
  date_cloture: string | null;
  relance: string | null;
  description: string | null;
  besoins_client: string | null;
  commentaire: string | null;

  responsable_id: number;
  responsable_nom: string;
  responsable_email: string | undefined;


  // Client details
  client_id: number;
  client_nom: string;
  client_email: string | undefined;
  client_telephone: string | undefined;
  client_ville: string | undefined;
  client_region: string | undefined;
  client_pays: string | undefined;
  client_secteur_activite: string | undefined;

  // Contact details
  contact_id: number;
  contact_nom: string;
  contact_prenom: string | undefined;
  contact_email: string | undefined;
  contact_telephone: string | undefined;

  // Entity details
  entity_id: number;
  entity_code: string;
  entity_name: string;

  // Main Product details
  produit_principal_id: number;
  produit_principal_code: string;
  produit_principal_name?: string;
  produit_principal_category: string | undefined;

  // Associated Products
  produits_codes: string[];
  produits_names: string[];
}

export class OpportunityProcessor {
  /**
   * Linearize opportunities by flattening nested data
   * @param opportunities Array of original opportunity objects
   * @returns Array of linearized opportunities
   */
  static linearizeOpportunities(opportunities: OpportuniteDetail[]): LinearizedOpportunity[] {
    return opportunities.map(opp => ({
      // Opportunity core details
      id: opp.id,
      reference: opp.reference,
      statut: opp.statut,
      statut_display: opp.statut_display,
      montant: opp.montant,
      montant_estime: opp.montant_estime,
      probabilite: opp.probabilite,
      valeur_ponderee: opp.valeur_ponderee,
      date_creation: opp.date_creation,
      date_modification: opp.date_modification,
      date_cloture: opp.date_cloture,
      relance: opp.relance,
      description: opp.description,
      besoins_client: opp.besoins_client,
      commentaire: opp.commentaire,
      responsable_id: opp.created_by,
      responsable_nom: opp.responsable.username,
      responsable_email: opp.responsable.email,

      // Client details
      client_id: opp.client.id,
      client_nom: opp.client.nom,
      client_email: opp.client.email,
      client_telephone: opp.client.telephone,
      client_ville: opp.client.ville_nom,
      client_region: opp.client.region_nom,
      client_pays: opp.client.pays_nom,
      client_secteur_activite: opp.client.secteur_activite,

      // Contact details
      contact_id: opp.contact.id,
      contact_nom: opp.contact.nom,
      contact_prenom: opp.contact.prenom,
      contact_email: opp.contact.email,
      contact_telephone: opp.contact.telephone,

      // Entity details
      entity_id: opp.entity.id,
      entity_code: opp.entity.code,
      entity_name: opp.entity.nom,

      // Main Product details
      produit_principal_id: opp.produit_principal.id,
      produit_principal_code: opp.produit_principal.code,
      produit_principal_name: opp.produit_principal.name,
      produit_principal_category: opp.produit_principal.category_name,

      // Associated Products
      produits_codes: opp.produits.map(p => p.code),
      produits_names: opp.produits.map(p => p.nom)
    }));
  }

  /**
   * Process raw JSON string of opportunities
   * @param rawData JSON string of opportunities
   * @returns Linearized opportunities
   */
  static processOpportunities(rawData: string): LinearizedOpportunity[] {
    try {
      const opportunities: OpportuniteDetail[] = JSON.parse(rawData);
      return this.linearizeOpportunities(opportunities);
    } catch (error) {
      console.error('Error processing opportunities:', error);
      return [];
    }
  }

  /**
   * Export linearized opportunities to CSV
   * @param linearizedOpps Linearized opportunities
   * @param filename Output CSV filename
   */
  static exportToCsv(linearizedOpps: LinearizedOpportunity[], filename: string = 'linearized_opportunities.csv'): void {
    if (linearizedOpps.length === 0) {
      console.log('No opportunities to export.');
      return;
    }

    // Create CSV content
    const headers = Object.keys(linearizedOpps[0]).join(',');
    const rows = linearizedOpps.map(opp => 
      Object.values(opp)
        .map(value => {
          // Handle array values
          if (Array.isArray(value)) return `"${value.join(';')}"`;
          // Escape double quotes and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    // For browser environment
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
