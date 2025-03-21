import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import KesContainer from '../KesContainer';
import { SidebarProvider } from '../ui/sidebar';
import AppSidebar from '../app-sidebar';

export function Layout() {
  // État local
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const mainRef = useRef<HTMLElement>(null);


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



  return (

    <div className="flex h-screen  bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar améliorée */}
      <SidebarProvider>
        <AppSidebar />
        <main>
        <div className={cn(
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

      </div>
        </main>
      </SidebarProvider>

      
    </div>
  );
}

export default Layout;