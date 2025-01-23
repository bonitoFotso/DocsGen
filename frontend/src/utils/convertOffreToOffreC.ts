import { IOffre, IOffreC } from "../interfaces";

export function convertOffreToOffreC(offre: IOffre): IOffreC {
    return {
      id: offre.id,
      entity: offre.entity.id, // Assuming IEntity has an `id` property
      reference: offre.reference,
      client: offre.client.id, // Assuming IClient has an `id` property
      date_creation: offre.date_creation,
      statut: offre.statut,
      doc_type: offre.doc_type,
      sequence_number: offre.sequence_number,
      produit: offre.produit.map(product => product.id), // Assuming IProduct has an `id` property
      date_modification: offre.date_modification,
      date_validation: offre.date_validation || null,
      sites: offre.sites.map(site => site.id), // Assuming ISite has an `id` property
    };
  }
  