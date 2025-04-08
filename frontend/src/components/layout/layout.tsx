import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';


import { Header } from './Header';
// import { Footer } from './Footer';
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext';
import { Sidebar } from './sidebar';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';

function LayoutContent() {
  const {
    mainRef,
    isPageLoading,
    loadingProgress,
    showScrollTop,
    scrollToTop
  } = useLayout();
  
  // Récupérer l'état de la sidebar
  const { expanded, isMobile } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-indigo-50 transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content - Ajusté pour s'adapter à la largeur de la sidebar */}
      <div 
        className={cn(
          "flex-1 flex flex-col h-screen overflow-hidden",
          "transition-all duration-300 ease-in-out",
          // Appliquer un décalage au contenu principal basé sur l'état de la sidebar
          expanded && !isMobile ? "ml-64" : isMobile ? "ml-0" : "ml-16"
        )}
      >
        {/* Header */}
        <Header />
        
        {/* Page loading indicator */}
        {isPageLoading && (
          <div className="relative h-1">
            <Progress
              value={loadingProgress}
              className="absolute top-0 left-0 right-0 z-50 h-1"
            />
          </div>
        )}

        {/* Main Content */}
        <main
          ref={mainRef}
          className={cn(
            "flex-1 overflow-y-auto",
            "bg-accent/30 dark:bg-accent/10",
            "px-4 sm:px-6 lg:px-8 py-6",
            "transition-colors duration-200",
            "scroll-smooth"
          )}
        >
          {/* Content wrapper */}
          <div className="mx-auto w-full h-full max-w-full animate-in fade-in duration-500">
            <Outlet />
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
                      "shadow-lg dark:shadow-black/20",
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
          
        </main>
        
        {/* Footer 
        <Footer />*/}
      </div>
    </div>
  );
}
export function Layout() {
  return (
      <SidebarProvider>
        <LayoutProvider>
          <LayoutContent />
        </LayoutProvider>
      </SidebarProvider>
  );
}

export default Layout;