import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout/layout";
import { Dashboard } from "./views/dashboard";
import EntityManagement from "./views/entities/entities";
import SiteManagement from "./views/sites/sites";
import OffreManagement from "./views/offres/offres";
import RapportManagement from "./views/rapports";
import ProductManagement from "./views/products";
import FormationManagement from "./views/formations/formations";
import LoginPage from "./views/auth/login";
import { AuthProvider } from "./contexts/AuthContext";
import { PrivateRoute } from "./PrivateRoute";
import ContactsPage from "./views/contacts/contacts2";
import ClientManagement from "./views/clients/ClientManagement";
import ClientDetailsPage from "./views/clients/pages/ClientDetails";
import OpportunityDetails from "./views/opportunites/opportunityDetails";
import { Toaster } from "sonner";
import OpportuniteCreation from "./views/opportunites/OpportuniteCreation";
import OpportuniteEditionPage from "./views/opportunites/OpportuniteEdition";
import CourriersManagementPage from "./views/courriers/CourriersManagementPage";
import CourrierForm from "./views/courriers/CourrierForm";
import CourrierDetailPage from "./views/courriers/CourrierDetailPage";
import ClientFormPage from "./views/clients/ClientFormPage";
import OffreForm from "./views/offres/OffreForm";
import OffreDetails from "./views/offres/OfferDetails";
import AffaireDetailPage from "./views/affaires/AffaireDetailPage";
import AffaireEditPage from "./views/affaires/AffaireEditPage";
import { TablesDemoPage } from "./views/SimplePage";
import ProformaListPage from "./views/proformas/ProformaListPage";
import ProformaDetailPage from "./views/proformas/ProformaDetailPage";
import ProformaCreatePage from "./views/proformas/ProformaCreatePage";
import FactureListPage from "./views/factures/FactureListPage";
import FactureDetailPage from "./views/factures/FactureDetailPage";
import FactureCreatePage from "./views/factures/FactureCreatePage";
import { entities } from "./components/layout/navigation";
import { EntityProvider } from "./contexts/EntityContext";
import AffairesDashboard from "./views/affaires/AffairesDashboard";
import OpportunityManagement from "./views/opportunites/oportuityPage";
import PortalSelection from "./components/layout/PortalSelection";

function App() {
  const defaultEntity = entities[0].toLowerCase();

  return (
    <AuthProvider>
      <Router>
        <EntityProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            {/* Portail */}
            <Route path="portail" element={<PortalSelection />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              

              {/* Authentification */}
              {/* Page d'accueil */}
              <Route index element={<Dashboard />} />

              {/* Routes groupées par fonctionnalité */}
              {/* Entités et sites */}
              <Route path="entities" element={<EntityManagement />} />
              <Route path="sites" element={<SiteManagement />} />

              {/* Routes clients et contacts (non liées aux entités) */}
              <Route path="clients">
                <Route index element={<ClientManagement />} />
                <Route path=":id" element={<ClientDetailsPage />} />
                <Route path=":id/edit" element={<ClientFormPage />} />
                <Route path="new" element={<ClientFormPage />} />
              </Route>
              <Route path="contacts" element={<ContactsPage />} />
              <Route path="contacts_grid" element={<ContactsPage />} />

              {/* Pages détaillées et formulaires (indépendantes des entités) */}
              <Route path="opportunities/:id" element={<OpportunityDetails />} />
              <Route path="opportunities/:id/edit" element={<OpportuniteEditionPage />} />
              <Route path="opportunities/create" element={<OpportuniteCreation />} />
              
              <Route path="offres/:id" element={<OffreDetails />} />
              <Route path="offres/:id/edit" element={<OffreForm />} />
              <Route path="offres/new" element={<OffreForm />} />
              
              <Route path="affaires/:id" element={<AffaireDetailPage />} />
              <Route path="affaires/:id/edit" element={<AffaireEditPage />} />
              
              <Route path="proformas/:id" element={<ProformaDetailPage />} />
              <Route path="proformas/create" element={<ProformaCreatePage />} />
              
              <Route path="factures/:id" element={<FactureDetailPage />} />
              <Route path="factures/create" element={<FactureCreatePage />} />
              <Route path="factures/:factureId/edit" element={<FactureCreatePage isEdit={true} />} />

              {/* Routes par entité (uniquement pour les vues de liste) */}
              {entities.map((entity) => {
                const entityPath = entity.toLowerCase();
                return (
                  <Route key={entity} path={entityPath}>
                    {/* dashbord */}
                    <Route index element={<Dashboard />} />
                    {/* Commercial - uniquement les vues de liste */}
                    <Route path="opportunities" element={<OpportunityManagement />} />
                    <Route path="offres" element={<OffreManagement />} />
                    <Route path="affaires" element={<AffairesDashboard />} />
                    <Route path="proformas" element={<ProformaListPage />} />
                    <Route path="factures" element={<FactureListPage />} />

                    {/* Catalogue et formations */}
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="formations" element={<FormationManagement />} />
                  </Route>
                );
              })}

              {/* Redirections vers les entités par défaut pour les listes */}
              <Route
                path="opportunities"
                element={<Navigate to={`/${defaultEntity}/opportunities`} replace />}
              />
              <Route
                path="offres"
                element={<Navigate to={`/${defaultEntity}/offres`} replace />}
              />
              <Route
                path="affaires"
                element={<Navigate to={`/${defaultEntity}/affaires`} replace />}
              />
              <Route
                path="proformas"
                element={<Navigate to={`/${defaultEntity}/proformas`} replace />}
              />
              <Route
                path="factures"
                element={<Navigate to={`/${defaultEntity}/factures`} replace />}
              />
              <Route
                path="products"
                element={<Navigate to={`/${defaultEntity}/products`} replace />}
              />
              <Route
                path="formations"
                element={<Navigate to={`/${defaultEntity}/formations`} replace />}
              />

              {/* Rapports */}
              <Route path="rapports" element={<RapportManagement />} />

              {/* Courriers */}
              <Route path="courriers">
                <Route index element={<CourriersManagementPage />} />
                <Route path=":id" element={<CourrierDetailPage />} />
                <Route path=":id/edit" element={<CourrierForm />} />
                <Route path="create" element={<CourrierForm />} />
              </Route>
              
              <Route path="simple" element={<TablesDemoPage />} />

              {/* Redirection pour les routes inconnues */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </EntityProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;