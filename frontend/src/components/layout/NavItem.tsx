import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { NavigationItem, resolveHref } from './navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { useEntityContext } from '@/hooks/useEntityContext';

interface NavItemProps {
  item: NavigationItem;
}

export function NavItem({ item }: NavItemProps) {
  const location = useLocation();
  const { expanded, collapsedItems, toggleCollapsedItem, isMobile } = useSidebar();
  const { currentEntity } = useEntityContext();
  
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = hasChildren && collapsedItems[item.name];
  const currentPath = location.pathname;
  
  // Résoudre l'URL en fonction de l'entité actuelle si nécessaire
  const resolvedHref = item.href ? resolveHref(item.href, currentEntity) : "#";
  
  // Check if current item or any of its children is active
  const isActive = resolvedHref ? currentPath === resolvedHref : false;
  const isChildActive = hasChildren && item.children?.some(child => {
    const childHref = resolveHref(child.href, currentEntity);
    return currentPath === childHref;
  });
  
  // Base styles for the main item
  const itemClasses = cn(
    "group flex items-center rounded-md w-full transition-colors duration-200",
    {
      "px-3 py-2": expanded || isMobile,
      "p-2 justify-center": !expanded && !isMobile,
      "bg-primary/10 text-primary": isActive || isChildActive,
      "text-muted-foreground hover:bg-accent hover:text-accent-foreground": !(isActive || isChildActive)
    }
  );
  
  // Handle click for expandable items
  const handleExpandClick = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      toggleCollapsedItem(item.name);
    }
  };
  
  const content = (
    <>
      <Icon className={cn("h-5 w-5", {
        "mr-2": expanded || isMobile
      })} />
      
      {(expanded || isMobile) && (
        <>
          <span className="flex-1 truncate">{item.name}</span>
          
          {/* Badge if exists */}
          {item.badge && (
            <Badge variant={"default"} className="ml-auto">
              {item.badge.text}
            </Badge>
          )}
          
          {/* Dropdown icon for items with children */}
          {hasChildren && (
            <ChevronDown 
              className={cn(
                "ml-1 h-4 w-4 transition-transform duration-200",
                isExpanded ? "transform rotate-180" : ""
              )}
            />
          )}
        </>
      )}
    </>
  );

  // Conditionally wrap with tooltip for collapsed state
  const mainElement = !expanded && !isMobile ? (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          {hasChildren ? (
            <button onClick={handleExpandClick} className={itemClasses}>
              {content}
            </button>
          ) : (
            <Link to={resolvedHref} className={itemClasses}>
              {content}
            </Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.name}
          {item.badge && <span className="ml-2 text-xs">({item.badge.text})</span>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    hasChildren ? (
      <button onClick={handleExpandClick} className={itemClasses}>
        {content}
      </button>
    ) : (
      <Link to={resolvedHref} className={itemClasses}>
        {content}
      </Link>
    )
  );

  return (
    <div className="space-y-1">
      {mainElement}
      
      {/* Children dropdown */}
      {hasChildren && isExpanded && (expanded || isMobile) && (
        <div className="pl-6 mt-1 space-y-1">
          {item.children?.map((child) => {
            // Résoudre l'URL de l'enfant en fonction de l'entité
            const childHref = resolveHref(child.href, currentEntity);
            
            return (
              <Link
                key={child.name}
                to={childHref}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors duration-200",
                  currentPath === childHref
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <child.icon className="h-4 w-4 mr-2" />
                <span className="truncate">{child.name}</span>
                
                {/* Badge if exists */}
                {child.badge && (
                  <Badge variant={"default"} className="ml-auto">
                    {child.badge.text}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}