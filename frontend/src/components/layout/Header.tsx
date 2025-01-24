import { Bell, LogOut, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { logout, user } = useAuth();
    
  const handleLogout = () => {
    try {
    logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 backdrop-blur-sm">
      <div className="h-full px-8 mx-auto flex items-center justify-between">
        {/* Search Section */}
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="search"
              placeholder="Search anything..."
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-lg",
                "bg-gray-50 dark:bg-gray-900",
                "border border-gray-200 dark:border-gray-700",
                "text-sm text-gray-900 dark:text-gray-100",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                "focus:border-transparent",
                "transition-all duration-200"
              )}
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button 
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <div className="flex flex-col text-right">
              {user?.username && (
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user.username}
                </span>
              )}
              {user?.email && (
                <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {user.email}
                </span>
              )}
              {user?.departement && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user.departement}
                </span>
              )}
            </div>
            <div className="relative group">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden ring-2 ring-transparent hover:ring-blue-500 transition-all cursor-pointer">
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}