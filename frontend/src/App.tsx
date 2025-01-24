import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/layout';
import { Dashboard } from './views/dashboard';
import EntityManagement from './views/entities/entities';
import ClientManagement from './views/clients/clients';
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="entities" element={<EntityManagement />} />
            <Route path="clients" element={<ClientManagement />} />
            <Route path="sites" element={<SiteManagement />} />
            <Route path="offres" element={<OffreManagement/>} />
            <Route path="affaires" element={<AffaireManagement/>} />
            <Route path="proformas" element={<ProformaManagement/>} />
            <Route path="rapports" element={<RapportManagement/>} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="formations" element={<FormationManagement />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;