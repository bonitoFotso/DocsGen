import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Package, 
  FileText, 
  GraduationCap,
  Home,
  HandCoins,
  Contact,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Briefcase,
  FileBarChart,
  X,
  Menu,
  Search as SearchIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import NavLink from './NavLink'; // Importez le composant NavLink optimisé

// Définir les types pour les éléments de navigation
interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary';
}

interface NavigationChild {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: BadgeProps;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  category: 'main' | 'business';
  badge?: BadgeProps;
  children?: NavigationChild[];
}

interface FooterItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  onNavigate?: () => void;
}

interface NavSectionProps {
  items: NavigationItem[];
  title?: string;
  currentPath: string;
  collapsed: Record<string, boolean>;
  toggleCollapse: (name: string, e: React.MouseEvent) => void;
  hasRouterContext: boolean;
  handleNavigation: (href: string, e: React.MouseEvent) => void;
}

interface FooterLinkProps {
  item: FooterItem;
  onClick: (href: string, e: React.MouseEvent) => void;
  hasRouterContext: boolean;
  isDesktop: boolean;
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigate?: () => void;
}

// Définition des éléments de navigation
const navigation: NavigationItem[] = [
  // Navigation principale
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'main' },
  { name: 'simple', href: '/simple', icon: LayoutDashboard, category: 'main' },
  { name: 'Entités', href: '/entities', icon: Building2, category: 'main' },
  { name: 'Contacts', href: '/contacts', icon: Contact, category: 'main' },
  { name: 'Clients', href: '/clients', icon: Users, category: 'main', badge: { text: '4', variant: 'default' } },

  // Opérations commerciales
  { 
    name: 'Commercial',
    icon: HandCoins,
    category: 'business',
    children: [
      { name: 'Opportunites', href: '/opportunities', icon: Briefcase, badge: { text: 'New', variant: 'success' } },
      { name: 'Offres', href: '/offres', icon: FileText },
      { name: 'Affaires', href: '/affaires', icon: FileText },
      { name: 'Proformas', href: '/proformas', icon: FileText },
      { name: 'Factures', href: '/factures', icon: FileText },
    ]
  },
  { name: 'Produits', href: '/products', icon: Package, category: 'business' },
  { name: 'Formations', href: '/formations', icon: GraduationCap, category: 'business' },
  { name: 'Rapports', href: '/rapports', icon: FileBarChart, category: 'business' },
  { name: 'Courriers', href: '/courriers', icon: Mail, category: 'business' },
];

const footerNavigation: FooterItem[] = [
  { name: 'Aide', href: '/help', icon: HelpCircle },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

// Hook personnalisé pour les media queries
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (): void => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]); // Removed matches from dependencies to prevent re-renders

  return matches;
}

// Optimized NavSection component
const NavSection: React.FC<NavSectionProps> = React.memo(({ 
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
));

// Optimized FooterLink component
const FooterLink: React.FC<FooterLinkProps> = React.memo(({ 
  item, 
  onClick, 
  hasRouterContext,
}) => {
  const Icon = item.icon;
  
  const handleClick = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    onClick(item.href, e);
  }, [item.href, onClick]);
  
  if (hasRouterContext) {
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={handleClick}
        className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800/50 hover:text-white transition-colors duration-150"
      >
        <Icon className="mr-3 h-5 w-5 text-gray-400" />
        {item.name}
      </Link>
    );
  }
  
  return (
    <a
      key={item.name}
      href={item.href}
      className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800/50 hover:text-white transition-colors duration-150"
    >
      <Icon className="mr-3 h-5 w-5 text-gray-400" />
      {item.name}
    </a>
  );
});

// Optimized LogoLink component
const LogoLink: React.FC<{
  onLogoClick: (e: React.MouseEvent) => void;
  hasRouterContext: boolean;
}> = React.memo(({ onLogoClick, hasRouterContext }) => {
  if (hasRouterContext) {
    return (
      <Link 
        to="/" 
        className="flex items-center space-x-3"
        onClick={onLogoClick}
      >
        <Home className="h-8 w-8 text-indigo-500" />
        <h1 className="text-xl font-bold text-white tracking-tight">
          KES DOC_GEN
        </h1>
      </Link>
    );
  }
  
  return (
    <a href="/" className="flex items-center space-x-3">
      <Home className="h-8 w-8 text-indigo-500" />
      <h1 className="text-xl font-bold text-white tracking-tight">
        KES DOC_GEN
      </h1>
    </a>
  );
});

export function Sidebar({ onNavigate }: SidebarProps): JSX.Element {
  // États
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [hasRouterContext, setHasRouterContext] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');

  const location = useLocation();
  const navigate = useNavigate();

  // Vérifier si l'écran est de taille desktop
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Update current path when location changes
  useEffect(() => {
    try {
      setCurrentPath(location.pathname);
      setHasRouterContext(true);
    } catch (_error) {
      console.error("Router context error:", _error);
      // Fallback to window.location if router context is not available
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      console.warn('Router context not available for Sidebar, using fallback navigation');
    }
  }, [location]);

  // Filtrer les éléments de navigation selon la recherche - memoized
  const filteredNavigation = useMemo(() => {
    if (!searchValue) return navigation;
    
    return navigation.flatMap(item => {
      if (item.children) {
        const filteredChildren = item.children.filter(child => 
          child.name.toLowerCase().includes(searchValue.toLowerCase())
        );
        
        if (filteredChildren.length > 0) {
          return [{ ...item, children: filteredChildren }];
        }
      }
      
      if (item.name.toLowerCase().includes(searchValue.toLowerCase())) {
        return [item];
      }
      
      return [];
    });
  }, [searchValue]);

  // Memoized callbacks to prevent unnecessary re-renders
  const toggleCollapse = useCallback((name: string, e: React.MouseEvent): void => {
    // Empêcher la navigation lors du toggle d'un menu
    e.preventDefault();
    e.stopPropagation();
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  }, []);

  // Gérer la navigation pour éviter les rechargements complets
  const handleNavigation = useCallback((href: string, e: React.MouseEvent): void => {
    e.preventDefault(); // Empêcher le comportement par défaut
    
    // Fermer le menu mobile après la navigation
    if (!isDesktop) {
      setIsMobileOpen(false);
    }
    
    // Utiliser navigate de React Router pour une navigation sans rechargement
    navigate(href);
    
    // Callback pour informer les composants parents
    if (onNavigate) {
      onNavigate();
    }
  }, [isDesktop, navigate, onNavigate]);
  
  const handleLogoClick = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    navigate('/');
    if (onNavigate) onNavigate();
    if (!isDesktop) setIsMobileOpen(false);
  }, [navigate, onNavigate, isDesktop]);
  
  const handleSearchClear = useCallback(() => {
    setSearchValue('');
  }, []);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);
  
  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Memoized sections for main and business categories
  const mainItems = useMemo(() => 
    filteredNavigation.filter(item => item.category === 'main'),
    [filteredNavigation]
  );
  
  const businessItems = useMemo(() => 
    filteredNavigation.filter(item => item.category === 'business'),
    [filteredNavigation]
  );

  return (
    <div className={cn(
      "flex h-full w-64 flex-col bg-gray-900",
      "transition-all duration-300 ease-in-out",
      "lg:translate-x-0",
      isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      "fixed lg:relative",
      "z-50 lg:z-0"
    )}>
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Header */}
      <div className={cn(
        "flex h-16 items-center justify-between px-4",
        "border-b border-gray-800",
        "bg-gray-900/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-gray-900/75"
      )}>
        <LogoLink 
          onLogoClick={handleLogoClick} 
          hasRouterContext={hasRouterContext} 
        />
        
        {/* Bouton pour fermer le menu sur mobile */}
        {isMobileOpen && !isDesktop && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={closeMobileMenu}
            className="text-gray-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="p-3 border-b border-gray-800">
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Rechercher..."
            value={searchValue}
            onChange={handleSearchChange}
            className="w-full pl-8 h-9 text-sm bg-gray-800 border-gray-700 text-gray-300 placeholder:text-gray-500"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1 h-7 w-7 text-gray-400 hover:text-gray-300"
              onClick={handleSearchClear}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto">
          <NavSection 
            items={mainItems} 
            title="Principal"
            currentPath={currentPath}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            hasRouterContext={hasRouterContext}
            handleNavigation={handleNavigation}
          />
          <NavSection 
            items={businessItems} 
            title="Opérations"
            currentPath={currentPath}
            collapsed={collapsed}
            toggleCollapse={toggleCollapse}
            hasRouterContext={hasRouterContext}
            handleNavigation={handleNavigation}
          />
        </nav>
      </ScrollArea>

      {/* User profile (exemple) */}
      <div className="p-3 border-t border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9 border border-gray-700">
            <AvatarFallback className="bg-indigo-900 text-indigo-200">AU</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-200">Admin User</p>
            <p className="text-xs text-gray-500">admin@kesdoc.com</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-1 p-3 border-t border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        {footerNavigation.map((item) => (
          <FooterLink 
            key={item.name} 
            item={item} 
            onClick={handleNavigation}
            hasRouterContext={hasRouterContext}
            isDesktop={isDesktop}
            setIsMobileOpen={setIsMobileOpen}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* Mobile toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleMobileMenu}
              size="icon"
              className={cn(
                "lg:hidden fixed bottom-4 left-4",
                "h-12 w-12 rounded-full",
                "bg-indigo-600 text-white",
                "shadow-lg shadow-indigo-600/20",
                "flex items-center justify-center",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                "transition-transform duration-200",
                isMobileOpen && "rotate-90"
              )}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            {isMobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}