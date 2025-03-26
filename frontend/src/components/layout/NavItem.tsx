import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { NavigationItem, resolveHref } from "./navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useEntityContext } from "@/hooks/useEntityContext";

interface NavItemProps {
  item: NavigationItem;
}

export function NavItem({ item }: NavItemProps) {
  const location = useLocation();
  const { expanded, collapsedItems, toggleCollapsedItem, isMobile } =
    useSidebar();
  const { currentEntity } = useEntityContext();

  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = hasChildren && collapsedItems[item.name];
  const currentPath = location.pathname;

  // Résoudre l'URL en fonction de l'entité actuelle si nécessaire
  const resolvedHref = item.href ? resolveHref(item.href, currentEntity) : "#";

  // Check if current item or any of its children is active
  const isActive = resolvedHref ? currentPath === resolvedHref : false;
  const isChildActive =
    hasChildren &&
    item.children?.some((child) => {
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
      "text-muted-foreground hover:bg-accent hover:text-accent-foreground": !(
        isActive || isChildActive
      ),
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
    <div className="flex items-center w-full">
      <Icon
        className={cn("h-5 w-5 flex-shrink-0", {
          "mr-3": expanded || isMobile,
        })}
      />

      {(expanded || isMobile) && (
        <>
          <span className="text-sm font-medium">{item.name}</span>

          {/* Spacer to push badge and chevron to the right */}
          <div className="flex-grow" />

          {/* Badge if exists */}
          {item.badge && (
            <Badge
              variant={"default"}
              className="ml-auto mr-1 px-1.5 py-0.5 text-xs"
            >
              {item.badge.text}
            </Badge>
          )}

          {/* Dropdown icon for items with children */}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200 text-muted-foreground",
                isExpanded ? "transform rotate-180" : ""
              )}
            />
          )}
        </>
      )}
    </div>
  );

  // Conditionally wrap with tooltip for collapsed state
  const mainElement =
    !expanded && !isMobile ? (
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
            {item.badge && (
              <span className="ml-2 text-xs">({item.badge.text})</span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : hasChildren ? (
      <button onClick={handleExpandClick} className={itemClasses}>
        {content}
      </button>
    ) : (
      <Link to={resolvedHref} className={itemClasses}>
        {content}
      </Link>
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
            const isChildItemActive = currentPath === childHref;

            return (
              <Link
                key={child.name}
                to={childHref}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors duration-200",
                  isChildItemActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <child.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                <span className="truncate">{child.name}</span>

                {/* Spacer to push badge to the right */}
                {child.badge && <div className="flex-grow" />}

                {/* Badge if exists */}
                {child.badge && (
                  <Badge
                    variant={"default"}
                    className="ml-auto px-1.5 py-0.5 text-xs"
                  >
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
