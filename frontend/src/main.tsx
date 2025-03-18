import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ServicesProvider } from './AppProviders.tsx';
import { ProformaProvider } from './contexts/ProformaContext.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ServicesProvider>
      <ProformaProvider>
        <App />

      </ProformaProvider>
    </ServicesProvider>

  </StrictMode>
);
