import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { useLayout } from '@/contexts/LayoutContext';
import { footerItems } from './navigation';
import { Moon, Sun } from 'lucide-react';
import useTheme from '@/hooks/use-theme';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const { theme, toggleTheme } = useTheme();
  const { isScrolled } = useLayout();
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      "border-t border-border",
      "bg-card",
      "transition-colors duration-200",
      isScrolled && "shadow-sm",
      className
    )}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright and links */}
          <div className="text-sm text-muted-foreground flex flex-col sm:flex-row items-center gap-2">
            <span>© {currentYear} KES DOC_GEN. Tous droits réservés.</span>
            <div className="hidden sm:flex text-border">|</div>
            <div className="flex space-x-4">
              <Link 
                to="/privacy" 
                className="hover:text-foreground transition-colors"
              >
                Confidentialité
              </Link>
              <Link 
                to="/terms" 
                className="hover:text-foreground transition-colors"
              >
                Conditions
              </Link>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={toggleTheme}
                    className="focus-visible:ring-1 focus-visible:ring-primary transition-colors"
                    aria-label={theme === 'dark' ? "Mode clair" : "Mode sombre"}
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 text-amber-400" />
                    ) : (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === 'dark' ? "Mode clair" : "Mode sombre"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Footer navigation items */}
            {footerItems.map(item => {
              const Icon = item.icon;
              
              return (
                <TooltipProvider key={item.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="focus-visible:ring-1 focus-visible:ring-primary transition-colors"
                        aria-label={item.name}
                        asChild
                      >
                        {item.external ? (
                          <a 
                            href={item.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </a>
                        ) : (
                          <Link to={item.href}>
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </Link>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{item.name}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}