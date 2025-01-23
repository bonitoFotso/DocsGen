import { useContext } from "react";
import ServicesContext from "./AppProviders";

// Créer le hook personnalisé pour utiliser le contexte
export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};