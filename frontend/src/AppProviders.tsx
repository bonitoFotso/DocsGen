import React, { createContext } from 'react';
import {
  entityService,
  clientService,
  siteService,
  categoryService,
  productService,
  offreService,
  proformaService,
  affaireService,
  factureService,
  rapportService,
  formationService,
  participantService,
  attestationFormationService,
  opportuniteService,
} from './services';
import { contactService, paysService, regionService, villeService } from './clientServices';

// Créer le type pour le contexte
type ServicesContextType = {
  entityService: typeof entityService;
  clientService: typeof clientService;
  siteService: typeof siteService;
  categoryService: typeof categoryService;
  productService: typeof productService;
  offreService: typeof offreService;
  proformaService: typeof proformaService;
  affaireService: typeof affaireService;
  factureService: typeof factureService;
  rapportService: typeof rapportService;
  formationService: typeof formationService;
  participantService: typeof participantService;
  attestationFormationService: typeof attestationFormationService;
  contactService: typeof contactService;
  villeService: typeof villeService;
  regionService: typeof regionService;
  paysService: typeof paysService;
  opportuniteService: typeof opportuniteService;
};

// Créer le contexte
const ServicesContext = createContext<ServicesContextType | null>(null);



// Props type pour le Provider
type ServicesProviderProps = {
  children: React.ReactNode;
};

// Créer le Provider
export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
  const services: ServicesContextType = {
    entityService,
    clientService,
    siteService,
    categoryService,
    productService,
    offreService,
    proformaService,
    affaireService,
    factureService,
    rapportService,
    formationService,
    participantService,
    attestationFormationService,
    contactService,
    villeService,
    regionService,
    paysService,
    opportuniteService,
  };

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

// Export du contexte pour les cas où on aurait besoin d'y accéder directement
export default ServicesContext;