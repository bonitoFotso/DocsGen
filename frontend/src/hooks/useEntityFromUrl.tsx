import { useLocation } from "react-router-dom";

// Hook personnalisé pour faciliter l'extraction de l'entité
export function useEntityFromUrl() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  
  // Retourne l'entité ou une valeur par défaut
  return pathSegments.length > 0 ? pathSegments[0].toUpperCase() : 'TOUTES';
}