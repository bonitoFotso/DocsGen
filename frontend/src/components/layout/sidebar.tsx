import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  MapPin, 
  Package, 
  FileText, 
  GraduationCap,
  Home,
  HandCoins
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Entities', href: '/entities', icon: Building2 },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Sites', href: '/sites', icon: MapPin },
  { name: 'Offres', href: '/offres', icon: HandCoins },
  { name: 'Affaires', href: '/affaires', icon: FileText },
  { name: 'Proformas', href: '/proformas', icon: FileText },
  { name: 'Rapports', href: '/rapports', icon: FileText },
  
  
  { name: 'Products', href: '/products', icon: Package },
  
  { name: 'Formations', href: '/formations', icon: GraduationCap },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">KES DOC_GEN</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
              )}
            >
              <Icon
                className={cn(
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-white',
                  'mr-3 h-5 w-5 flex-shrink-0'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}