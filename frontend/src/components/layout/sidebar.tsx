import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  X, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Home 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { NavigationItem, navigationItems } from './navigation';
import { NavItem } from './NavItem';
import { useSidebar } from '@/contexts/SidebarContext';

export interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { expanded, toggleSidebar, isMobile } = useSidebar();
  const [searchValue, setSearchValue] = useState('');
  
  // Filter navigation items based on search term
  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) return navigationItems;
    
    const searchLower = searchValue.toLowerCase();
    return navigationItems.filter(item => {
      // Check main item name
      if (item.name.toLowerCase().includes(searchLower)) return true;
      
      // Check children
      if (item.children?.some(child => 
        child.name.toLowerCase().includes(searchLower)
      )) return true;
      
      return false;
    });
  }, [searchValue]);
  
  // Group navigation items by category
  const mainItems = useMemo(() => 
    filteredItems.filter(item => item.category === 'main'),
    [filteredItems]
  );
  
  const businessItems = useMemo(() => 
    filteredItems.filter(item => item.category === 'business'),
    [filteredItems]
  );
  
  const systemItems = useMemo(() => 
    filteredItems.filter(item => item.category === 'system'),
    [filteredItems]
  );

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };
  
  // Clear search
  const handleSearchClear = () => {
    setSearchValue('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && expanded && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-screen flex-col border-r bg-card",
          "fixed left-0 top-0 z-50",
          "transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-16",
          isMobile && !expanded && "-translate-x-full",
          isMobile && expanded && "translate-x-0",
          !isMobile && "translate-x-0",
          className
        )}
      >
        {/* Header with logo */}
        <div className="flex h-16 items-center border-b px-4">
          <Link 
            to="/"
            className={cn(
              "flex items-center gap-2",
              !expanded && !isMobile && "justify-center"
            )}
          >
            <Home className="h-6 w-6 text-primary" />
            {(expanded || isMobile) && (
              <span className="text-lg font-semibold">KES DOC_GEN</span>
            )}
          </Link>
          
          {/* Toggle button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="ml-auto"
            aria-label={expanded ? "Réduire le menu" : "Agrandir le menu"}
          >
            {isMobile && expanded ? (
              <X className="h-5 w-5" />
            ) : expanded ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Search input - only when expanded */}
        {(expanded || isMobile) && (
          <div className="p-4 pb-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchValue}
                onChange={handleSearchChange}
                className="w-full pl-8 h-9 text-sm"
              />
              {searchValue && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7"
                  onClick={handleSearchClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-6 py-4">
            {/* Main items */}
            {mainItems.length > 0 && (
              <div className="space-y-3">
                {(expanded || isMobile) && (
                  <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Principal
                  </h3>
                )}
                <div className="space-y-1">
                  {mainItems.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Business items */}
            {businessItems.length > 0 && (
              <div className="space-y-3">
                {(expanded || isMobile) && (
                  <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Opérations
                  </h3>
                )}
                <div className="space-y-1">
                  {businessItems.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )}
            
            {/* System items */}
            {systemItems.length > 0 && (
              <div className="space-y-3">
                {(expanded || isMobile) && (
                  <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Système
                  </h3>
                )}
                <div className="space-y-1">
                  {systemItems.map((item) => (
                    <NavItem key={item.name} item={item} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty state for search */}
            {filteredItems.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Aucun résultat pour "{searchValue}"
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleSearchClear}
                  className="mt-2"
                >
                  Effacer la recherche
                </Button>
              </div>
            )}
          </nav>
        </ScrollArea>
        
        {/* User profile */}
        <div className={cn(
          "border-t p-3",
          !expanded && !isMobile && "flex justify-center"
        )}>
          {(expanded || isMobile) ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  AU
                </AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">admin@example.com</p>
              </div>
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder-avatar.jpg" alt="User Avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      AU
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@example.com</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </aside>
      
      
    </>
  );
}