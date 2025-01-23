import React from 'react';

interface Entity {
  id: number;
  code: string;
  name: string;
}

interface Client {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
}

interface Category {
  id: number;
  code: string;
  name: string;
  entity: number;
}

interface Produit {
  id: number;
  category: Category;
  code: string;
  name: string;
}

interface Site {
  id: number;
  client: Client;
  nom: string;
  localisation: string;
  description: string;
}

interface Offre {
  id: number;
  entity: Entity;
  client: Client;
  produit: Produit[];
  sites: Site[];
  reference: string;
  date_creation: string;
  statut: string;
  doc_type: string;
  sequence_number: number;
  date_modification: string;
  date_validation: string | null;
}

interface Rapport {
  id: number;
  reference: string;
  date_creation: string;
  statut: string;
  doc_type: string;
  sequence_number: number;
  entity: number;
  client: number;
  affaire: number;
  site: number;
  produit: number;
}

interface Affaire {
  reference: string;
  date_creation: string;
  statut: string;
  date_debut: string;
  date_fin_prevue: string | null;
  offre: Offre;
  facture: null;
  rapports: Rapport[];
  attestations: unknown[];
}

interface AffaireDisplayProps {
  affaires: Affaire[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const AffaireDisplay: React.FC<AffaireDisplayProps> = ({ affaires }) => {
  return (
    <div className="space-y-6 p-4">
      {affaires.map((affaire) => (
        <div key={affaire.reference} className="bg-white rounded-lg shadow-md p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Référence: {affaire.reference}
            </h2>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Date de création:</p>
                <p className="font-medium">{formatDate(affaire.date_creation)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut:</p>
                <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                  {affaire.statut}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Offre</h3>
            <div className="bg-gray-50 p-4 rounded">
              <p>Référence: {affaire.offre.reference}</p>
              <p>Client: {affaire.offre.client.nom}</p>
              <div className="mt-2">
                <p className="font-medium">Produits:</p>
                <ul className="list-disc list-inside ml-4">
                  {affaire.offre.produit.map((prod) => (
                    <li key={prod.id}>{prod.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {affaire.rapports.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Rapports</h3>
              <div className="space-y-2">
                {affaire.rapports.map((rapport) => (
                  <div key={rapport.id} className="bg-gray-50 p-3 rounded">
                    <p>Référence: {rapport.reference}</p>
                    <p>Statut: {rapport.statut}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AffaireDisplay;