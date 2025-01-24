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
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  // Main navigation
  { name: 'Dashboard', href: '/', icon: Home, category: 'main' },
  { name: 'Entities', href: '/entities', icon: Building2, category: 'main' },
  { name: 'Clients', href: '/clients', icon: Users, category: 'main' },
  { name: 'Sites', href: '/sites', icon: MapPin, category: 'main' },
  
  // Business operations
  { name: 'Offres', href: '/offres', icon: HandCoins, category: 'business' },
  { name: 'Affaires', href: '/affaires', icon: FileText, category: 'business' },
  { name: 'Proformas', href: '/proformas', icon: FileText, category: 'business' },
  { name: 'Rapports', href: '/rapports', icon: FileText, category: 'business' },
  { name: 'Products', href: '/products', icon: Package, category: 'business' },
  { name: 'Formations', href: '/formations', icon: GraduationCap, category: 'business' },
  

];

export function Sidebar() {
  const location = useLocation();

  const categorizedNavigation = {
    main: navigation.filter(item => item.category === 'main'),
    business: navigation.filter(item => item.category === 'business'),
    auth: navigation.filter(item => item.category === 'auth')
  };

  const NavSection = ({ items, title }: { items: typeof navigation, title?: string }) => (
    <div className="space-y-1">
      {title && (
        <h2 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          {title}
        </h2>
      )}
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-gray-800 text-white shadow-sm'
                : 'text-gray-300 hover:bg-gray-800/50 hover:text-white',
            )}
          >
            <Icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-150',
                isActive
                  ? 'text-blue-400'
                  : 'text-gray-400 group-hover:text-gray-300'
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Header */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
        <h1 className="text-xl font-bold text-white tracking-tight">
          KES DOC_GEN
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <NavSection items={categorizedNavigation.main} title="Main" />
        <NavSection items={categorizedNavigation.business} title="Business" />
        
        {/* Auth section at the bottom */}
        <div className="pt-6 mt-6 border-t border-gray-800">
          <NavSection items={categorizedNavigation.auth} />
        </div>
      </nav>
    </div>
  );
}