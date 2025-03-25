// components/client/ClientTabContainer.tsx
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  User,
  FileText,
  Briefcase,
  Receipt,
  BarChart4,
  MapPin,
  Phone,
} from "lucide-react";
import OffresTab from "./tabs/OffresTab";
import AffairesTab from "./tabs/AffairesTab";
import ContactsTab from "./tabs/ContactsTab";
import SitesTab from "./tabs/SitesTab";
import FacturesTab from "./tabs/FacturesTab";
import RapportsTab from "./tabs/RapportsTab";
import OpportunitiesTab from "./tabs/OpportunitiesTab";

// Types basés sur vos modèles Django
interface Client {
  id: number;
  nom: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  c_num?: string;
  ville_id?: number;
  ville_nom?: string;
  region_nom?: string;
  is_client: boolean;
  secteur_activite?: string;
  categorie_id?: number;
  bp?: string;
  quartier?: string;
  matricule?: string;
  agreer: boolean;
  agreement_fournisseur: boolean;
  entite?: string;
  created_at: string;
  updated_at: string;
}

interface Offre {
  id: number;
  reference: string;
  client_nom: string;
  entity_code: string;
  produit_name?: string;
  statut: string;
  date_creation: string;
  date_modification?: string;
  date_validation?: string;
  contact_id?: number;
  montant?: number;
  validite_date?: string;
  produits_count?: number;
  description?: string;
}

interface Affaire {
  id: number;
  reference: string;
  client_nom: string;
  offre_reference?: string;
  statut: string;
  date_debut: string;
  date_fin_prevu?: string;
  montant_total?: number;
  taux_avancement?: number;
  produits_count?: number;
}

interface Contact {
  id: number;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  mobile?: string;
  poste?: string;
  service?: string;
  client_id: number;
  site_id?: number;
}

interface Site {
  id: number;
  nom: string;
  client_id: number;
  s_num?: string;
  localisation?: string;
  ville_id?: number;
  ville_nom?: string;
}

interface Facture {
  id: number;
  reference: string;
  client_nom: string;
  affaire_reference: string;
  statut: string;
  date_creation: string;
  montant?: number;
}

interface Opportunite {
  id: number;
  reference: string;
  client_nom: string;
  produit_name: string;
  statut: string;
  date_detection: string;
  contact_id: number;
  montant_estime: number;
  probabilite: number;
  description?: string;
}

interface Formation {
  id: number;
  titre: string;
  client_id: number;
  affaire_id: number;
  rapport_id: number;
  date_debut?: string;
  date_fin?: string;
  description?: string;
  participants_count?: number;
}

interface Rapport {
  id: number;
  reference: string;
  affaire_id: number;
  produit_id: number;
  produit_name?: string;
  statut: string;
  date_creation: string;
}

interface ClientTabContainerProps {
  client: Client;
  offres: Offre[];
  affaires: Affaire[];
  contacts: Contact[];
  sites: Site[];
  factures: Facture[];
  opportunites: Opportunite[];
  formations: Formation[];
  rapports: Rapport[];
  navigateToOffre: (id: number) => void;
  navigateToAffaire: (id: number) => void;
  navigateToContact: (id: number) => void;
  navigateToSite: (id: number) => void;
  navigateToFacture: (id: number) => void;
  navigateToOpportunite: (id: number) => void;
  navigateToFormation: (id: number) => void;
  navigateToRapport: (id: number) => void;
  onCreateOpportunite?: () => void;
}

const ClientTabContainer: React.FC<ClientTabContainerProps> = ({
  client,
  offres,
  affaires,
  contacts,
  sites,
  factures,
  opportunites,
  formations,
  rapports,
  navigateToOffre,
  navigateToAffaire,
  navigateToContact,
  navigateToSite,
  navigateToFacture,
  navigateToOpportunite,
  navigateToFormation,
  navigateToRapport,
  onCreateOpportunite,
}) => {
  const [activeTab, setActiveTab] = useState("opportunites");

  const tabCounts = {
    opportunites: opportunites.length,
    offres: offres.length,
    affaires: affaires.length,
    contacts: contacts.length,
    sites: sites.length,
    factures: factures.length,
    formations: formations.length,
    rapports: rapports.length,
  };

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid grid-cols-8 mb-6">
        <TabsTrigger value="opportunites" className="flex items-center gap-2">
          <BarChart4 className="h-4 w-4" />
          <span className="hidden sm:inline">Opportunités</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.opportunites}
          </span>
        </TabsTrigger>

        <TabsTrigger value="offres" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Offres</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.offres}
          </span>
        </TabsTrigger>

        <TabsTrigger value="affaires" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span className="hidden sm:inline">Affaires</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.affaires}
          </span>
        </TabsTrigger>

        <TabsTrigger value="contacts" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">Contacts</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.contacts}
          </span>
        </TabsTrigger>

        <TabsTrigger value="sites" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Sites</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.sites}
          </span>
        </TabsTrigger>

        <TabsTrigger value="factures" className="flex items-center gap-2">
          <Receipt className="h-4 w-4" />
          <span className="hidden sm:inline">Factures</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.factures}
          </span>
        </TabsTrigger>

        <TabsTrigger value="formations" className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <span className="hidden sm:inline">Formations</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.formations}
          </span>
        </TabsTrigger>

        <TabsTrigger value="rapports" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Rapports</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5">
            {tabCounts.rapports}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="opportunites">
        <OpportunitiesTab
          opportunites={opportunites}
          navigateToOpportunite={navigateToOpportunite}
          onCreateOpportunite={onCreateOpportunite}
        />
      </TabsContent>

      <TabsContent value="offres">
        <OffresTab offres={offres} navigateToOffre={navigateToOffre} />
      </TabsContent>

      <TabsContent value="affaires">
        <AffairesTab
          affaires={affaires}
          navigateToAffaire={navigateToAffaire}
        />
      </TabsContent>

      <TabsContent value="contacts">
        <ContactsTab
          contacts={contacts}
          navigateToContact={navigateToContact}
        />
      </TabsContent>

      <TabsContent value="sites">
        <SitesTab sites={sites} navigateToSite={navigateToSite} />
      </TabsContent>

      <TabsContent value="factures">
        <FacturesTab
          factures={factures}
          navigateToFacture={navigateToFacture}
        />
      </TabsContent>

      <TabsContent value="rapports">
        <RapportsTab
          rapports={rapports}
          navigateToRapport={navigateToRapport}
        />
      </TabsContent>

      <TabsContent value="rapports">
        <RapportsTab
          rapports={rapports}
          navigateToRapport={navigateToRapport}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ClientTabContainer;
