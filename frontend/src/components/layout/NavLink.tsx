import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary';
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  category?: 'main' | 'business';
  badge?: BadgeProps;
  children?: NavigationItem[];
}

interface NavLinkChildProps {
  item: NavigationItem;
  depth: number;
  isActive: boolean;
  hasRouterContext: boolean;
  handleNavigation: (href: string, e: React.MouseEvent) => void;
}

interface ParentNavLinkProps {
  item: NavigationItem;
  isItemCollapsed: boolean;
  toggleCollapse: (name: string, e: React.MouseEvent) => void;
  children: React.ReactNode;
}

interface NavLinkProps {
  item: NavigationItem;
  depth?: number;
  currentPath: string;
  collapsed: Record<string, boolean>;
  toggleCollapse: (name: string, e: React.MouseEvent) => void;
  hasRouterContext: boolean;
  handleNavigation: (href: string, e: React.MouseEvent) => void;
}

// Séparons le sous-composant pour les enfants
const NavLinkChild: React.FC<NavLinkChildProps> = React.memo(({ 
  item, 
  depth, 
  isActive, 
  hasRouterContext, 
  handleNavigation 
}) => {
  const Icon = item.icon;
  
  // Si nous n'avons pas de contexte de routeur, utiliser les liens <a> standard
  if (!hasRouterContext) {
    return (
      <a
        href={item.href}
        className={cn(
          'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-gray-800 text-white shadow-sm'
            : 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
          depth > 0 && 'pl-11'
        )}
      >
        <Icon
          className={cn(
            'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
            isActive
              ? 'text-indigo-400'
              : 'text-gray-400 group-hover:text-gray-300'
          )}
        />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <Badge className="ml-auto">
            {item.badge.text}
          </Badge>
        )}
      </a>
    );
  }

  // Si nous avons un contexte de routeur, utiliser les composants Link personnalisés
  return (
    <Link
      to={item.href || '/'}
      onClick={(e) => handleNavigation(item.href || '/', e)}
      className={cn(
        'group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-gray-800 text-white shadow-sm'
          : 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
        depth > 0 && 'pl-11'
      )}
    >
      <div className="flex items-center">
        <Icon
          className={cn(
            'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
            isActive
              ? 'text-indigo-400'
              : 'text-gray-400 group-hover:text-gray-300'
          )}
        />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <Badge>
          {item.badge.text}
        </Badge>
      )}
    </Link>
  );
});

// Séparons le composant parent
const ParentNavLink: React.FC<ParentNavLinkProps> = React.memo(({ 
  item, 
  isItemCollapsed, 
  toggleCollapse, 
  children 
}) => {
  const Icon = item.icon;
  
  // Memoize the toggle handler
  const handleToggle = useCallback((e: React.MouseEvent): void => {
    toggleCollapse(item.name, e);
  }, [item.name, toggleCollapse]);
  
  return (
    <div>
      <button
        onClick={handleToggle}
        className={cn(
          'group flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
          'text-gray-300 hover:bg-gray-800/50 hover:text-white'
        )}
      >
        <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <Badge className="ml-2 mr-2">
            {item.badge.text}
          </Badge>
        )}
        {isItemCollapsed ? (
          <ChevronDown className="ml-3 h-4 w-4" />
        ) : (
          <ChevronRight className="ml-3 h-4 w-4" />
        )}
      </button>
      {isItemCollapsed && children}
    </div>
  );
});

// Optimisons le NavLink principal avec React.memo
const NavLink: React.FC<NavLinkProps> = React.memo(({ 
  item, 
  depth = 0,
  currentPath,
  collapsed,
  toggleCollapse,
  hasRouterContext,
  handleNavigation
}) => {
  const isActive = currentPath === item.href;
  const hasChildren = 'children' in item && item.children && item.children.length > 0;
  const isItemCollapsed = collapsed[item.name];
  
  if (hasChildren && 'children' in item && item.children) {
    return (
      <ParentNavLink 
        item={item} 
        isItemCollapsed={isItemCollapsed} 
        toggleCollapse={toggleCollapse}
      >
        <div className="mt-1 space-y-1 px-3">
          {item.children.map((child) => (
            <NavLink 
              key={child.name} 
              item={child} 
              depth={depth + 1}
              currentPath={currentPath}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              hasRouterContext={hasRouterContext}
              handleNavigation={handleNavigation}
            />
          ))}
        </div>
      </ParentNavLink>
    );
  }

  return (
    <NavLinkChild 
      item={item} 
      depth={depth} 
      isActive={isActive} 
      hasRouterContext={hasRouterContext} 
      handleNavigation={handleNavigation}
    />
  );
});

// Pour l'utilisation dans le composant parent (Sidebar)
// Exemple de NavSection modifié:

/*
interface NavSectionProps {
  items: NavigationItem[];
  title?: string;
  currentPath: string;
  collapsed: Record<string, boolean>;
  toggleCollapse: (name: string, e: React.MouseEvent) => void;
  hasRouterContext: boolean;
  handleNavigation: (href: string, e: React.MouseEvent) => void;
}

const NavSection: React.FC<NavSectionProps> = ({ 
  items, 
  title,
  currentPath,
  collapsed,
  toggleCollapse,
  hasRouterContext,
  handleNavigation
}) => (
  <div className="space-y-1">
    {title && (
      <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        {title}
      </h2>
    )}
    {items.map((item) => (
      <NavLink 
        key={item.name} 
        item={item} 
        currentPath={currentPath}
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
        hasRouterContext={hasRouterContext}
        handleNavigation={handleNavigation}
      />
    ))}
  </div>
);
*/

export default NavLink;