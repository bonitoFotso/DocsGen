import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  // Importation ordonnée et déduplicée des icônes
  Briefcase,
  Building2,
  ChevronDown,
  ChevronRight,
  Command,
  Contact,
  FileBarChart,
  FileText,
  GraduationCap,
  HandCoins,
  HelpCircle,
  LayoutDashboard,
  Mail,
  Moon,
  Package,
  Settings,
  Sun,
  Users
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import useTheme from "@/hooks/use-theme";

// -------------------------
// INTERFACES - Centralisées et Optimisées
// -------------------------
interface BadgeProps {
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary';
}

interface BaseNavigationItem {
  name: string;
  href?: string;
  icon: React.ElementType;
  badge?: BadgeProps;
}

interface NavigationItem extends BaseNavigationItem {
  category: 'main' | 'business';
  children?: BaseNavigationItem[];
}

type FooterItem = BaseNavigationItem

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate?: (href: string, e: React.MouseEvent) => void;
}

interface BadgeComponentProps {
  badge?: BadgeProps;
}

interface NavIconProps {
  icon: React.ElementType;
  isActive: boolean;
}

interface NavLinkChildProps {
  item: BaseNavigationItem;
  depth: number;
  isActive: boolean;
  onClick?: (href: string, e: React.MouseEvent<HTMLAnchorElement>) => void;
}

interface ParentNavLinkProps {
  item: NavigationItem;
  isExpanded: boolean;
  onToggle: (name: string) => void;
  children: React.ReactNode;
}

interface NavItemProps {
  item: NavigationItem;
  depth?: number;
  currentPath: string;
  expandedItems: Record<string, boolean>;
  onToggleExpand: (name: string) => void;
  onNavigate?: (href: string, e: React.MouseEvent) => void;
}

interface NavigationSectionProps {
  items: NavigationItem[];
  title?: string;
  currentPath: string;
  expandedItems: Record<string, boolean>;
  onToggleExpand: (name: string) => void;
  onNavigate?: (href: string, e: React.MouseEvent) => void;
}

interface AppSidebarNavProps {
  onNavigate?: (href: string, e: React.MouseEvent) => void;
}

interface FooterNavProps {
  onNavigate?: (href: string, e: React.MouseEvent) => void;
}

interface ThemeToggleProps {
  className?: string;
}

// -------------------------
// DONNÉES DE NAVIGATION - Constantes Memoïsables
// -------------------------
const NAVIGATION_ITEMS: NavigationItem[] = [
  // Navigation principale
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, category: 'main' },
  { name: 'Simple', href: '/simple', icon: LayoutDashboard, category: 'main' },
  { name: 'Entités', href: '/entities', icon: Building2, category: 'main' },
  { name: 'Contacts', href: '/contacts', icon: Contact, category: 'main' },
  { name: 'Clients', href: '/clients', icon: Users, category: 'main', badge: { text: '4', variant: 'default' } },

  // Opérations commerciales
  {
    name: 'Commercial',
    icon: HandCoins,
    category: 'business',
    children: [
      { name: 'Opportunités', href: '/opportunities', icon: Briefcase, badge: { text: 'New', variant: 'success' } },
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

const FOOTER_ITEMS: FooterItem[] = [
  { name: 'Aide', href: '/help', icon: HelpCircle },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

// -------------------------
// COMPOSANT: ThemeToggle - Bascule entre mode clair et sombre
// -------------------------
const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className={cn(
        "flex items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800/30 hover:text-gray-100",
        className
      )}
      type="button"
      aria-label={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

// -------------------------
// COMPOSANT: BadgeComponent - Extrait pour réutilisation
// -------------------------
const BadgeComponent: React.FC<BadgeComponentProps> = React.memo(({ badge }) => {
  if (!badge) return null;
  
  return (
    <Badge variant={"default"} className="ml-auto">
      {badge.text}
    </Badge>
  );
});
BadgeComponent.displayName = 'BadgeComponent';

// -------------------------
// COMPOSANT: NavIcon - Extrait pour réutilisation
// -------------------------
const NavIcon: React.FC<NavIconProps> = React.memo(({ icon: Icon, isActive }) => {
  const { theme } = useTheme();
  
  return (
    <Icon
      className={cn(
        'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
        isActive
          ? theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
          : theme === 'dark' 
              ? 'text-gray-400 group-hover:text-gray-300' 
              : 'text-gray-500 group-hover:text-gray-700'
      )}
    />
  );
});
NavIcon.displayName = 'NavIcon';

// -------------------------
// COMPOSANT: NavLinkChild - Optimisé
// -------------------------
const NavLinkChild: React.FC<NavLinkChildProps> = React.memo(({
  item,
  depth,
  isActive,
  onClick
}) => {
  const { name, href = '/', icon, badge } = item;
  const { theme } = useTheme();
  
  const linkClasses = cn(
    'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
    isActive
      ? theme === 'dark'
          ? 'bg-gray-800 text-white shadow-sm'
          : 'bg-gray-100 text-gray-900 shadow-sm'
      : theme === 'dark'
          ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
          : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900',
    depth > 0 && 'pl-11'
  );

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(href, e);
  }, [href, onClick]);

  // Contenu partagé entre les deux types de liens
  const linkContent = (
    <>
      <NavIcon icon={icon} isActive={isActive} />
      <span className="flex-1">{name}</span>
      <BadgeComponent badge={badge} />
    </>
  );

  return (
    <Link
      to={href}
      onClick={handleClick}
      className={linkClasses}
    >
      {linkContent}
    </Link>
  );
});
NavLinkChild.displayName = 'NavLinkChild';

// -------------------------
// COMPOSANT: ParentNavLink - Optimisé avec mémoïsation
// -------------------------
const ParentNavLink: React.FC<ParentNavLinkProps> = React.memo(({
  item,
  isExpanded,
  onToggle,
  children
}) => {
  const { name, icon, badge } = item;
  const { theme } = useTheme();
  
  // Mémoïsation du handler d'événement
  const handleToggle = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(name);
  }, [name, onToggle]);

  return (
    <div>
      <button
        onClick={handleToggle}
        className={cn(
          "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
          theme === 'dark'
            ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
            : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
        )}
        type="button"
      >
        <div className="flex items-center">
          <NavIcon icon={icon} isActive={false} />
          <span>{name}</span>
        </div>
        
        <div className="flex items-center">
          <BadgeComponent badge={badge} />
          {isExpanded ? (
            <ChevronDown className="ml-3 h-4 w-4" />
          ) : (
            <ChevronRight className="ml-3 h-4 w-4" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="mt-1 space-y-1 px-3">
          {children}
        </div>
      )}
    </div>
  );
});
ParentNavLink.displayName = 'ParentNavLink';

// -------------------------
// COMPOSANT: NavItem - Composant de niveau supérieur
// -------------------------
const NavItem: React.FC<NavItemProps> = React.memo(({
  item,
  depth = 0,
  currentPath,
  expandedItems,
  onToggleExpand,
  onNavigate
}) => {
  const { name, href, children } = item;
  const isActive = href === currentPath;
  const hasChildren = children && children.length > 0;
  const isExpanded = Boolean(expandedItems[name]);

  if (hasChildren) {
    return (
      <ParentNavLink
        item={item}
        isExpanded={isExpanded}
        onToggle={onToggleExpand}
      >
        {children.map((child) => (
          <NavItem
            key={`${name}-${child.name}`}
            item={{
              ...child,
              category: item.category
            } as NavigationItem}
            depth={depth + 1}
            currentPath={currentPath}
            expandedItems={expandedItems}
            onToggleExpand={onToggleExpand}
            onNavigate={onNavigate}
          />
        ))}
      </ParentNavLink>
    );
  }

  return (
    <NavLinkChild
      item={item}
      depth={depth}
      isActive={isActive}
      onClick={onNavigate}
    />
  );
});
NavItem.displayName = 'NavItem';

// -------------------------
// COMPOSANT: NavigationSection - Regroupe les éléments de navigation
// -------------------------
const NavigationSection: React.FC<NavigationSectionProps> = React.memo(({
  items,
  title,
  currentPath,
  expandedItems,
  onToggleExpand,
  onNavigate
}) => {
  const { theme } = useTheme();
  
  if (!items || items.length === 0) return null;

  return (
    <div className="mb-6">
      {title && (
        <h3 className={cn(
          "mb-2 px-3 text-xs font-semibold uppercase tracking-wider",
          theme === 'dark' ? "text-gray-400" : "text-gray-500"
        )}>
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {items.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            currentPath={currentPath}
            expandedItems={expandedItems}
            onToggleExpand={onToggleExpand}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
});
NavigationSection.displayName = 'NavigationSection';

// -------------------------
// COMPOSANT: AppSidebarNav - Gère l'état de la navigation
// -------------------------
const AppSidebarNav: React.FC<AppSidebarNavProps> = ({ onNavigate }) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  
  // Grouper les éléments par catégorie
  const { mainItems, businessItems } = useMemo(() => {
    return {
      mainItems: NAVIGATION_ITEMS.filter(item => item.category === 'main'),
      businessItems: NAVIGATION_ITEMS.filter(item => item.category === 'business')
    };
  }, []);

  // Gérer l'expansion/réduction des éléments
  const handleToggleExpand = useCallback((name: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  }, []);

  // Gérer la navigation
  const handleNavigate = useCallback((href: string, e: React.MouseEvent) => {
    onNavigate?.(href, e);
  }, [onNavigate]);

  return (
    <>
      <NavigationSection
        items={mainItems}
        title="Principal"
        currentPath={location.pathname}
        expandedItems={expandedItems}
        onToggleExpand={handleToggleExpand}
        onNavigate={handleNavigate}
      />
      
      <NavigationSection
        items={businessItems}
        title="Opérations"
        currentPath={location.pathname}
        expandedItems={expandedItems}
        onToggleExpand={handleToggleExpand}
        onNavigate={handleNavigate}
      />
    </>
  );
};

// -------------------------
// COMPOSANT: FooterNav - Gère la navigation de pied de page
// -------------------------
const FooterNav: React.FC<FooterNavProps> = React.memo(({ onNavigate }) => {
  const { theme } = useTheme();
  
  return (
    <div className="mt-6 space-y-1 px-3">
      {FOOTER_ITEMS.map((item) => (
        <Link
          key={item.name}
          to={item.href || '/'}
          onClick={(e) => onNavigate?.(item.href || '/', e)}
          className={cn(
            "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            theme === 'dark'
              ? "text-gray-300 hover:bg-gray-800/50 hover:text-white"
              : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900"
          )}
        >
          <item.icon className={cn(
            "mr-3 h-5 w-5 flex-shrink-0",
            theme === 'dark'
              ? "text-gray-400 group-hover:text-gray-300"
              : "text-gray-500 group-hover:text-gray-700"
          )} />
          <span>{item.name}</span>
        </Link>
      ))}
      
      <div className="flex items-center justify-between px-3 py-2">
        <span className={cn(
          "text-sm",
          theme === 'dark' ? "text-gray-500" : "text-gray-400"
        )}>
          Mode d'affichage
        </span>
        <ThemeToggle />
      </div>
    </div>
  );
});
FooterNav.displayName = 'FooterNav';

// -------------------------
// COMPOSANT PRINCIPAL: AppSidebar - Point d'entrée
// -------------------------
export function AppSidebar({ onNavigate, ...props }: AppSidebarProps) {
  const { theme } = useTheme();
  
  return (
    <Sidebar 
      variant="inset" 
      className={cn(
        theme === 'dark' 
          ? "bg-gray-900 border-gray-800" 
          : "bg-white border-gray-100"
      )}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className={cn(
                  "flex aspect-square size-8 items-center justify-center rounded-lg",
                  theme === 'dark' 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : "bg-indigo-100 text-indigo-700"
                )}>
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className={cn(
                    "truncate font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    Acme Inc
                  </span>
                  <span className={cn(
                    "truncate text-xs",
                    theme === 'dark' ? "text-gray-400" : "text-gray-500"
                  )}>
                    Enterprise
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <AppSidebarNav onNavigate={onNavigate} />
      </SidebarContent>
      
      <SidebarFooter>
        <FooterNav onNavigate={onNavigate} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;