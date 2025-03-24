// Hook personnalisé pour utiliser le contexte d'entité
import { useContext } from 'react';
import { EntityContext } from '@/contexts/EntityContext';

export const useEntityContext = () => useContext(EntityContext);