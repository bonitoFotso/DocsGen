import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  MapPin, 
  Package, 
  FileText, 
  GraduationCap,
  Home,
  HandCoins,
  Contact,
  ChevronDown,
  ChevronRight,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Contact2Icon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  // Main navigation
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'main' },
  { name: 'Entités', href: '/entities', icon: Building2, category: 'main' },
  { name: 'Contacts', href: '/contacts', icon: Contact, category: 'main'},
  { name: 'Contacts Grid', href: '/contacts_grid', icon: Contact2Icon, category: 'main'},
  { name: 'Clients', href: '/clients', icon: Users, category: 'main' },

  // Business operations
  { 
    name: 'Commercial',
    icon: HandCoins,
    category: 'business',
    children: [
      { name: 'Opportunites', href: '/opportunities', icon: FileText },
      { name: 'Offres', href: '/offres', icon: FileText },
      { name: 'Affaires', href: '/affaires', icon: FileText },
      { name: 'Proformas', href: '/proformas', icon: FileText },
      { name: 'Factures', href: '/factures', icon: FileText },
    ]
  },
  { name: 'Produits', href: '/products', icon: Package, category: 'business' },
  { name: 'Formations', href: '/formations', icon: GraduationCap, category: 'business' },
  { name: 'Rapports', href: '/rapports', icon: FileText, category: 'business' },
];

const footerNavigation = [
  { name: 'Aide', href: '/help', icon: HelpCircle },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function Sidebar() {
  // États
  const [currentPath, setCurrentPath] = useState('/');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasRouterContext, setHasRouterContext] = useState(false);

  const location = useLocation();

  // Update current path when location changes
  useEffect(() => {
    try {
      setCurrentPath(location.pathname);
      setHasRouterContext(true);
    } catch (error) {
      // Fallback to window.location if router context is not available
      const path = window.location.pathname || '/';
      setCurrentPath(path);
      console.warn('Router context not available for Sidebar, using fallback navigation');
    }
  }, [location]);

  const toggleCollapse = (name: string) => {
    setCollapsed(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const NavLink = ({ item, depth = 0 }: { item: any; depth?: number }) => {
    const isActive = currentPath === item.href;
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = collapsed[item.name];
    
    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleCollapse(item.name)}
            className={cn(
              'group flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
              'text-gray-300 hover:bg-gray-800/50 hover:text-white'
            )}
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-300" />
            <span className="flex-1">{item.name}</span>
            {isCollapsed ? (
              <ChevronDown className="ml-3 h-4 w-4" />
            ) : (
              <ChevronRight className="ml-3 h-4 w-4" />
            )}
          </button>
          {isCollapsed && (
            <div className="mt-1 space-y-1 px-3">
              {item.children.map((child: any) => (
                <NavLink key={child.name} item={child} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Si nous n'avons pas de contexte de routeur, utiliser les liens <a> standard
    if (!hasRouterContext) {
      return (
        <a
          key={item.name}
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
          {item.name}
        </a>
      );
    }

    // Si nous avons un contexte de routeur, utiliser les composants Link de react-router
    return (
      <Link
        key={item.name}
        to={item.href}
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
        {item.name}
      </Link>
    );
  };

  const NavSection = ({ items, title }: { items: typeof navigation, title?: string }) => (
    <div className="space-y-1">
      {title && (
        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </h2>
      )}
      {items.map((item) => (
        <NavLink key={item.name} item={item} />
      ))}
    </div>
  );

  // Composant pour le logo et le titre (utilise Link ou <a> selon le contexte)
  const LogoLink = () => {
    if (hasRouterContext) {
      return (
        <Link to="/" className="flex items-center space-x-3">
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
  };

  // Composant pour les liens de pied de page (utilise Link ou <a> selon le contexte)
  const FooterLink = ({ item }: { item: { name: string; href: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    
    if (hasRouterContext) {
      return (
        <Link
          key={item.name}
          to={item.href}
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
  };

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
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Header */}
      <div className={cn(
        "flex h-16 items-center justify-between px-4",
        "border-b border-gray-800",
        "bg-gray-900/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-gray-900/75"
      )}>
        <LogoLink />
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-6 px-3 py-4",
        "overflow-y-auto scrollbar-custom"
      )}>
        <NavSection items={navigation.filter(item => item.category === 'main')} title="Principal" />
        <NavSection items={navigation.filter(item => item.category === 'business')} title="Opérations" />
      </nav>

      {/* Footer */}
      <div className={cn(
        "flex flex-col gap-1 p-3",
        "border-t border-gray-800",
        "bg-gray-900/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-gray-900/75"
      )}>
        {footerNavigation.map((item) => (
          <FooterLink key={item.name} item={item} />
        ))}
      </div>

      {/* Mobile toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
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
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
}