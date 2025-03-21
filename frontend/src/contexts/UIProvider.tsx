import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { LayoutProvider } from '@/contexts/LayoutContext';

/**
 * Unified provider that combines all UI-related context providers
 * Use this at the root of your application to provide all contexts at once
 */
interface UIProviderProps {
  children: React.ReactNode;
}

export function UIProvider({ children }: UIProviderProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <LayoutProvider>
          {children}
        </LayoutProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}

// Export all individual providers and hooks for granular usage
export { 
  ThemeProvider, useTheme 
} from '@/contexts/ThemeContext';

export { 
  SidebarProvider, useSidebar 
} from '@/contexts/SidebarContext';

export { 
  LayoutProvider, useLayout 
} from '@/contexts/LayoutContext';

// Export all UI components
export { Sidebar } from '@/components/layout/sidebar';
export { Header } from '@/components/layout/Header';
export { Footer } from '@/components/layout/Footer';
export { Layout } from '@/components/layout/layout';
export { NavItem } from '@/components/layout/NavItem';
export { 
  navigationItems, 
  footerItems,
  type NavigationItem,
  type NavigationChild,
  type BadgeProps,
  type FooterItem
} from '@/components/layout/navigation';