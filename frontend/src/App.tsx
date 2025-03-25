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
import OpportunityPage from "./views/opportunites/oportuityPage";
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
import AffaireListPage from "./views/affaires/AffairesListPage";
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

function App() {
  const defaultEntity = entities[0].toLowerCase();

  return (
    <AuthProvider>
      <Router>
        <EntityProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
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

              {/* Routes par entité */}
              {entities.map((entity) => {
                const entityPath = entity.toLowerCase();
                return (
                  <Route key={entity} path={entityPath}>
                    {/* Commercial */}
                    <Route path="opportunities">
                      <Route index element={<OpportunityPage />} />
                      <Route path=":id" element={<OpportunityDetails />} />
                      <Route
                        path=":id/edit"
                        element={<OpportuniteEditionPage />}
                      />
                      <Route
                        path="creation"
                        element={<OpportuniteCreation />}
                      />
                      <Route path="new" element={<OpportuniteCreation />} />
                    </Route>
                    <Route path="offres">
                      <Route index element={<OffreManagement />} />
                      <Route path=":id" element={<OffreDetails />} />
                      <Route path=":id/edit" element={<OffreForm />} />
                      <Route path="creation" element={<OffreForm />} />
                      <Route path="new" element={<OffreForm />} />
                    </Route>
                    <Route path="affaires">
                      <Route index element={<AffaireListPage />} />
                      <Route path=":id" element={<AffaireDetailPage />} />
                      <Route path=":id/edit" element={<AffaireEditPage />} />
                    </Route>
                    <Route path="proformas">
                      <Route index element={<ProformaListPage />} />
                      <Route path=":id" element={<ProformaDetailPage />} />
                      <Route path="create" element={<ProformaCreatePage />} />
                    </Route>
                    <Route path="factures">
                      <Route index element={<FactureListPage />} />
                      <Route path=":id" element={<FactureDetailPage />} />
                      <Route path="create" element={<FactureCreatePage />} />
                      <Route
                        path=":factureId/edit"
                        element={<FactureCreatePage isEdit={true} />}
                      />
                    </Route>

                    {/* Catalogue et formations */}
                    <Route path="products" element={<ProductManagement />} />
                    <Route
                      path="formations"
                      element={<FormationManagement />}
                    />
                  </Route>
                );
              })}

              {/* Redirections vers les entités par défaut */}
              <Route
                path="opportunities"
                element={
                  <Navigate to={`/${defaultEntity}/opportunities`} replace />
                }
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
                element={
                  <Navigate to={`/${defaultEntity}/proformas`} replace />
                }
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
                element={
                  <Navigate to={`/${defaultEntity}/formations`} replace />
                }
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
              <Route path="affaires/:id" element={<AffaireDetailPage />} />
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
