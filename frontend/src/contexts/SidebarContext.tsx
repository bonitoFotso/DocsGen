import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextProps {
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  collapsedItems: Record<string, boolean>;
  toggleCollapsedItem: (name: string) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize to detect mobile - sans expanded comme dépendance
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto collapse sidebar on mobile - mais sans créer une boucle
      if (mobile) {
        setExpanded(false);
      } else if (!mobile) {
        setExpanded(true);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Pas de dépendance à expanded ici

  // Handle ESC key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && expanded) {
        setExpanded(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, expanded]);

  const toggleSidebar = () => {
    setExpanded((prev) => !prev);
  };

  const toggleCollapsedItem = (name: string) => {
    setCollapsedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
        toggleSidebar,
        collapsedItems,
        toggleCollapsedItem,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  
  return context;
}