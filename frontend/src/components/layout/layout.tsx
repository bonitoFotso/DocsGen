import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import { 
  Settings, 
  ChevronUp, 
  Moon, 
  Sun, 
  HelpCircle,
  Github,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent 
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Sidebar } from './sidebar';
import KesContainer from '../KesContainer';

export function Layout() {
  // État local
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  
  // Vérifier la préférence de thème au chargement
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDarkMode(darkModePreference);
    
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Gérer le changement de route
  useEffect(() => {
    // Réinitialiser le scroll lors du changement de page
    mainRef.current?.scrollTo({ top: 0 });
    
    // Simuler un chargement de page
    simulatePageLoading();
    
    // Fermer automatiquement le sidebar sur mobile lors d'un changement de route
    const isMobile = window.innerWidth < 1024;
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Simuler un chargement de page
  const simulatePageLoading = () => {
    setIsPageLoading(true);
    setLoadingProgress(0);
    
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + (100 - prev) / 10;
        
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsPageLoading(false);
            setLoadingProgress(100);
          }, 200);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);
  };

  // Gérer le scroll
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setIsScrolled(target.scrollTop > 10);
      setShowScrollTop(target.scrollTop > 400);
    };
    
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Gérer la touche Escape pour fermer le sidebar sur mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const isMobile = window.innerWidth < 1024;
        if (isMobile && isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);
  
  // Fonction pour basculer l'état du sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Scroll to top
  const scrollToTop = () => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar améliorée */}
      <Sidebar 
      />
      
      <div className={cn(
        "flex-1 flex flex-col h-screen overflow-hidden",
        "transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : ""
      )}>
        {/* Header amélioré */}
        <Header 
          isScrolled={isScrolled} 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />
        
        {/* Page loading indicator */}
        {isPageLoading && (
          <div className="relative h-1">
            <Progress 
              value={loadingProgress} 
              className="absolute top-0 left-0 right-0 z-50 h-1 bg-transparent" 
            />
          </div>
        )}

        {/* Main Content */}
        <main
          ref={mainRef}
          className={cn(
            "flex-1 overflow-y-auto",
            "bg-gray-100 dark:bg-gray-800",
            "px-4 sm:px-6 lg:px-8 py-6",
            "transition-colors duration-200",
            "scroll-smooth"
          )}
        >
          {/* Content wrapper */}
          <div className="mx-auto w-full  animate-in fade-in duration-500">
          <KesContainer
          variant="transparent"
          padding="none" 
          size="full" 
          >
          <Outlet />
          </KesContainer>
            
          </div>
          
          {/* Scroll to top button */}
          {showScrollTop && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={scrollToTop}
                    size="icon"
                    variant="secondary"
                    className={cn(
                      "fixed bottom-20 right-8",
                      "rounded-full",
                      "shadow-lg dark:shadow-gray-900/50",
                      "animate-in fade-in slide-in-from-bottom-5 duration-300"
                    )}
                    aria-label="Retour en haut"
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  Retour en haut
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Support button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className={cn(
                    "fixed bottom-8 right-8",
                    "rounded-full",
                    "shadow-lg dark:shadow-gray-900/50"
                  )}
                  aria-label="Support"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                Besoin d'aide ?
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </main>

        {/* Footer */}
        <footer className={cn(
          "border-t border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800",
          "transition-colors duration-200",
          isScrolled ? "shadow-md" : ""
        )}>
          <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row items-center gap-2">
                <span>© 2025 KES DOC_GEN. Tous droits réservés.</span>
                <div className="hidden sm:flex text-gray-300 dark:text-gray-700">|</div>
                <div className="flex space-x-4">
                  <Link to="/privacy" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Confidentialité
                  </Link>
                  <Link to="/terms" className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Conditions
                  </Link>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleDarkMode}
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                        aria-label={isDarkMode ? "Mode clair" : "Mode sombre"}
                      >
                        {isDarkMode ? (
                          <Sun className="h-5 w-5 text-amber-500" />
                        ) : (
                          <Moon className="h-5 w-5 text-gray-500" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isDarkMode ? "Mode clair" : "Mode sombre"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                        aria-label="Contact"
                        asChild
                      >
                        <a href="mailto:contact@kesdocgen.com">
                          <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Contact</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                        aria-label="GitHub"
                        asChild
                      >
                        <a href="https://github.com/kesdocgen" target="_blank" rel="noopener noreferrer">
                          <Github className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>GitHub</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                        aria-label="Paramètres"
                      >
                        <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paramètres</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-200"
                        aria-label="Paramètres"
                      >
                        <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Paramètres</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Layout;