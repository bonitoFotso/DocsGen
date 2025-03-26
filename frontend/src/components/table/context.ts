import { createContext, useContext } from 'react';
import { KDTableContext } from './types';

// Création du contexte avec un type générique
export const createKDTableContext = <T,>() => {
  // Valeur par défaut vide - sera remplie dans le provider
  const TableContext = createContext<KDTableContext<T> | undefined>(undefined);
  
  // Hook personnalisé pour accéder au contexte
  const useTableContext = () => {
    const context = useContext(TableContext);
    if (context === undefined) {
      throw new Error('useTableContext must be used within a TableProvider');
    }
    return context;
  };
  
  return {
    TableContext,
    useTableContext
  };
};

// Note: La création réelle du contexte sera faite dans KDTable.tsx
// car nous avons besoin que T soit inféré à partir des props