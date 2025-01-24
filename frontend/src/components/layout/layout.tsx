import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-500">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Header />

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto",
          "bg-gray-100 dark:bg-gray-600",
          "px-8 py-6"
        )}>
          {/* Content wrapper */}
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-8">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 KES DOC_GEN. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}