import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
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
          {/*
          <Route path="documents" element={<Documents />} />
          <Route path="rapports" element={<RapportManagement/>} />
          <Route path="*" element={<h1>Not Found</h1>} />*/}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;