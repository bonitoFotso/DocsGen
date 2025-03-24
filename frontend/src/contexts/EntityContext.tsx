import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { entities } from '@/components/layout/navigation';

interface EntityContextType {
  currentEntity: string;
  setCurrentEntity: (entity: string) => void;
  availableEntities: string[];
}

// Création du contexte avec des valeurs par défaut
export const EntityContext = createContext<EntityContextType>({
  currentEntity: entities[0], // Par défaut, utilisez la première entité
  setCurrentEntity: () => {},
  availableEntities: entities
});

interface EntityProviderProps {
  children: ReactNode;
}

export const EntityProvider: React.FC<EntityProviderProps> = ({ children }) => {
  const [currentEntity, setCurrentEntity] = useState<string>(entities[0]);
  const location = useLocation();
  const navigate = useNavigate();

  // Détecter l'entité à partir de l'URL
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    for (const entity of entities) {
      if (path.includes(`/${entity.toLowerCase()}/`) || path === `/${entity.toLowerCase()}`) {
        setCurrentEntity(entity);
        break;
      }
    }
  }, [location.pathname]);

  // Gérer le changement d'entité avec la navigation
  const handleEntityChange = (entity: string) => {
    console.log('handleEntityChange', entity);
    setCurrentEntity(entity);
    
    // Si nous sommes sur une page spécifique à une entité, redirectionnez vers la nouvelle entité
    const currentPath = location.pathname;
    for (const e of entities) {
      const lowerEntity = e.toLowerCase();
      if (currentPath.includes(`/${lowerEntity}/`)) {
        const restOfPath = currentPath.split(`/${lowerEntity}/`)[1];
        navigate(`/${entity.toLowerCase()}/${restOfPath}`);
        return;
      }
    }
  };

  return (
    <EntityContext.Provider
      value={{
        currentEntity,
        setCurrentEntity: handleEntityChange,
        availableEntities: entities
      }}
    >
      {children}
    </EntityContext.Provider>
  );
};

