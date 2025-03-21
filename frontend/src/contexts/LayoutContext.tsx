import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface LayoutContextProps {
  isScrolled: boolean;
  showScrollTop: boolean;
  isPageLoading: boolean;
  loadingProgress: number;
  scrollToTop: () => void;
  mainRef: React.RefObject<HTMLElement>;
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const mainRef = useRef<HTMLElement>(null);
  
  // Handle route changes
  useEffect(() => {
    // Reset scroll position on route change
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0 });
    }
    
    // Simulate page loading animation
    simulatePageLoading();
  }, [location.pathname]);
  
  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      if (!mainRef.current) return;
      
      const scrollTop = mainRef.current.scrollTop;
      setIsScrolled(scrollTop > 10);
      setShowScrollTop(scrollTop > 400);
    };
    
    const mainElement = mainRef.current;
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
      return () => mainElement.removeEventListener('scroll', handleScroll);
    }
  }, []);
  
  // Simulate page loading progress
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
  
  // Scroll to top helper
  const scrollToTop = () => {
    mainRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <LayoutContext.Provider
      value={{
        isScrolled,
        showScrollTop,
        isPageLoading,
        loadingProgress,
        scrollToTop,
        mainRef,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  
  return context;
}