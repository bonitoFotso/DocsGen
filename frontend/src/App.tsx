import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import { Dashboard } from './views/dashboard';
import EntityManagement from './views/entities/entities';
import SiteManagement from './views/sites/sites';
import OffreManagement from './views/offres/offres';
import AffaireManagement from './views/affaires/affaies';
import ProformaManagement from './views/proformas/Proformas';
import RapportManagement from './views/rapports';
import ProductManagement from './views/products';
import FormationManagement from './views/formations/formations';
import LoginPage from './views/auth/login';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './PrivateRoute';
import FactureManagement from './views/factures/Facture';
import ContactsPage from './views/contacts/contacts2';
import ClientManagement from './views/clients/ClientManagement';
import ClientDetailsPage from './views/clients/pages/ClientDetails';
import OpportunityPage from './views/opportunites/oportuityPage';
import OpportunityDetails from './views/opportunites/opportunityDetails';
import { Toaster } from 'sonner';
import OpportuniteCreation from './views/opportunites/OpportuniteCreation';
import OpportuniteEditionPage from './views/opportunites/OpportuniteEdition';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />

            {/* Routes groupées par fonctionnalité */}
            {/* Entités et sites */}
            <Route path="entities" element={<EntityManagement />} />
            <Route path="sites" element={<SiteManagement />} />

            {/* Gestion commerciale */}
            <Route path="clients">
              <Route index element={<ClientManagement />} />
              <Route path=":id" element={<ClientDetailsPage />} />
            </Route>

            <Route path="contacts" element={<ContactsPage />} />
            <Route path="contacts_grid" element={<ContactsPage />} />

            <Route path="opportunities">
              <Route index element={<OpportunityPage />} />
              <Route path=":id" element={<OpportunityDetails />} />
              <Route path=":id/edit" element={<OpportuniteEditionPage/>} />
              <Route path="new" element={<OpportuniteCreation/>} />
              <Route path="new" element={<OpportuniteCreation/>} />
            </Route>

            {/* Documents commerciaux */}
            <Route path="offres" element={<OffreManagement />} />
            <Route path="affaires" element={<AffaireManagement />} />
            <Route path="factures" element={<FactureManagement />} />
            <Route path="proformas" element={<ProformaManagement />} />

            {/* Catalogue et formations */}
            <Route path="products" element={<ProductManagement />} />
            <Route path="formations" element={<FormationManagement />} />

            {/* Rapports */}
            <Route path="rapports" element={<RapportManagement />} />

            {/* Redirection pour les routes inconnues */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;