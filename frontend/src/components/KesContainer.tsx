import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

type ContainerVariant = 'default' | 'card' | 'transparent';
type ContainerSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ContainerPadding = 'none' | 'sm' | 'md' | 'lg';

interface KesContainerProps {
  /**
   * Le contenu à afficher dans le conteneur
   */
  children: ReactNode;
  
  /**
   * Le titre du conteneur (optionnel)
   */
  title?: string;
  
  /**
   * Description ou sous-titre du conteneur (optionnel)
   */
  description?: string;
  
  /**
   * Variante du style de conteneur
   * - default: fond blanc avec ombre légère
   * - card: utilise le composant Card de shadcn/ui
   * - transparent: aucun fond, juste le contenu
   */
  variant?: ContainerVariant;
  
  /**
   * Largeur maximale du conteneur
   * - sm: max-w-md (448px)
   * - md: max-w-2xl (672px)
   * - lg: max-w-4xl (896px)
   * - xl: max-w-6xl (1152px)
   * - full: w-full (100%)
   */
  size?: ContainerSize;
  
  /**
   * Espacement intérieur du conteneur
   */
  padding?: ContainerPadding;
  
  /**
   * Classes CSS supplémentaires à appliquer au conteneur
   */
  className?: string;
  
  /**
   * Actions à afficher dans l'en-tête (boutons, etc.)
   */
  headerActions?: ReactNode;
  
  /**
   * Centrer le contenu horizontalement
   */
  centerContent?: boolean;
  
  /**
   * Identifiant HTML du conteneur (utile pour les ancres)
   */
  id?: string;
  
  /**
   * Propriétés HTML supplémentaires
   */
  [x: string]: unknown;
}

/**
 * KesContainer - Un composant conteneur réutilisable pour toutes les pages
 * 
 * Ce composant sert de conteneur standard pour le contenu des pages,
 * avec diverses options de style et mise en page.
 */
export const KesContainer: React.FC<KesContainerProps> = ({
  children,
  title,
  description,
  variant = 'default',
  size = 'full',
  padding = 'md',
  className,
  headerActions,
  centerContent = false,
  id,
  ...props
}) => {
  // Mapping des tailles aux classes de largeur maximale
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'w-full'
  };
  
  // Mapping des tailles de padding
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  // Classes de base pour tous les conteneurs
  const baseClasses = cn(
    sizeClasses[size],
    paddingClasses[padding],
    'mx-auto',
    centerContent && 'flex flex-col items-center',
    className
  );
  
  // Rendu conditionnel de l'en-tête du conteneur
  const renderHeader = () => {
    if (!title && !description && !headerActions) return null;
    
    return (
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          {title && (
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-50">
              {title}
            </h2>
          )}
          
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    );
  };
  
  // Rendu selon la variante
  switch (variant) {
    case 'card':
      return (
        <Card 
          className={cn(baseClasses, 'shadow-md')} 
          id={id}
          {...props}
        >
          <div className={paddingClasses[padding]}>
            {renderHeader()}
            {children}
          </div>
        </Card>
      );
      
    case 'transparent':
      return (
        <div 
          className={baseClasses} 
          id={id}
          {...props}
        >
          {renderHeader()}
          {children}
        </div>
      );
      
    case 'default':
    default:
      return (
        <div 
          className={cn(
            baseClasses,
            'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700'
          )} 
          id={id}
          {...props}
        >
          {renderHeader()}
          {children}
        </div>
      );
  }
};

export default KesContainer;