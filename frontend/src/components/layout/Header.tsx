import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, 
  LogOut, 
  Search, 
  User, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Calendar,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

type NotificationType = 'info' | 'success' | 'warning' | 'message';

interface Notification {
  id: number;
  text: string;
  description?: string;
  unread: boolean;
  time: string;
  type: NotificationType;
}

interface HeaderProps {
  isScrolled?: boolean;
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export function Header({ isScrolled, toggleSidebar, isSidebarOpen }: HeaderProps) {
  const { logout, user } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: 1, 
      text: "Nouvelle opportunité créée", 
      description: "Client: Entreprise Alpha, Produit: Service Premium",
      unread: true, 
      time: "Il y a 5 min",
      type: "success"
    },
    { 
      id: 2, 
      text: "Mise à jour système prévue", 
      description: "Une maintenance est prévue ce soir à 22h00",
      unread: true, 
      time: "Il y a 1h",
      type: "warning"
    },
    { 
      id: 3, 
      text: "Message de Jean Dupont", 
      description: "Bonjour, pouvez-vous m'envoyer les détails du projet ?",
      unread: false, 
      time: "Hier, 14:30",
      type: "message"
    },
    { 
      id: 4, 
      text: "Réunion équipe commerciale", 
      description: "Réunion hebdomadaire à 10h00 en salle B",
      unread: false, 
      time: "26/03/2025",
      type: "info"
    }
  ]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  const notificationCount = notifications.filter(n => n.unread).length;

  // Effet pour vérifier si on est en mode sombre au chargement
  useEffect(() => {
    const darkModePreference = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDark(darkModePreference);
    
    if (darkModePreference) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Fermer le menu de notifications quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Raccourci clavier pour la recherche
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl+K ou Cmd+K pour focus la recherche
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, unread: false } : n
    ));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'info':
      default:
        return <Calendar className="h-5 w-5 text-indigo-500" />;
    }
  };

  const getNotificationColor = (type: NotificationType, unread: boolean) => {
    if (!unread) return "";
    
    switch (type) {
      case 'success':
        return "bg-green-50 dark:bg-green-900/10";
      case 'warning':
        return "bg-amber-50 dark:bg-amber-900/10";
      case 'message':
        return "bg-blue-50 dark:bg-blue-900/10";
      case 'info':
      default:
        return "bg-indigo-50 dark:bg-indigo-900/10";
    }
  };

  return (
    <header 
      className={cn(
        "sticky top-0 z-40 h-16",
        "bg-white/80 dark:bg-gray-800/80",
        "border-b border-gray-200 dark:border-gray-700",
        "backdrop-blur-md",
        "transition-all duration-200",
        isScrolled && "shadow-sm"
      )}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between">
        {/* Menu toggle button - Visible on all screens now */}
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="mr-2"
                  aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
                >
                  {isSidebarOpen ? (
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* App Title - Optional */}
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white mr-6 hidden sm:block">
            KES DOC_GEN
          </h1>
        </div>

        {/* Search Section */}
        <div className="hidden sm:flex items-center flex-1 max-w-2xl">
          <div className="relative w-full group">
            <Search 
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                "transition-colors duration-200",
                isSearchFocused 
                  ? "text-indigo-500 dark:text-indigo-400"
                  : "text-gray-400 dark:text-gray-500"
              )}
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Rechercher... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className={cn(
                "w-full h-10 pl-10 pr-4 rounded-lg",
                "bg-gray-50 dark:bg-gray-900",
                "border border-gray-200 dark:border-gray-700",
                "text-sm text-gray-900 dark:text-gray-100",
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                "focus:border-transparent",
                "transition-all duration-200"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
            )}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-xs text-gray-400 dark:text-gray-500">
              Ctrl+K
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Theme Toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={cn(
                    "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                    "transition-colors duration-200"
                  )}
                  aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
                >
                  {isDark ? (
                    <Sun className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isDark ? "Mode clair" : "Mode sombre"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={cn(
                      "relative",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                      "transition-colors duration-200"
                    )}
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    {notificationCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 p-0 text-xs"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Notifications {notificationCount > 0 && `(${notificationCount})`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Dropdown Notifications */}
            {showNotifications && (
              <div className={cn(
                "absolute right-0 mt-2 w-80 sm:w-96",
                "bg-white dark:bg-gray-800",
                "rounded-lg shadow-lg",
                "border border-gray-200 dark:border-gray-700",
                "animate-in fade-in-50 slide-in-from-top-5",
                "z-50"
              )}>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Notifications
                    </h3>
                    {notificationCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllNotificationsAsRead}
                        className="text-xs h-8 px-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                      >
                        Tout marquer comme lu
                      </Button>
                    )}
                  </div>
                </div>
                
                <ScrollArea className="max-h-[350px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "relative p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50",
                            "transition-colors duration-200",
                            getNotificationColor(notification.type, notification.unread)
                          )}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <p className={cn(
                                  "text-sm font-medium text-gray-900 dark:text-gray-100",
                                  notification.unread && "font-semibold"
                                )}>
                                  {notification.text}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotification(notification.id);
                                  }}
                                >
                                  <X className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                                </Button>
                              </div>
                              {notification.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2">
                                  {notification.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {notification.time}
                              </p>
                              {notification.unread && (
                                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-indigo-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>Aucune notification</p>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                  <Button
                    variant="ghost" 
                    size="sm"
                    className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Voir toutes les notifications
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 cursor-pointer border-2 border-transparent hover:border-indigo-500 transition-all duration-200">
                  <AvatarImage src={user?.avatar || ""} alt={user?.username || "User"} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : <User className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium text-sm">{user?.username || "Utilisateur"}</p>
                  <p className="text-xs text-gray-500">{user?.email || "utilisateur@example.com"}</p>
                  {user?.departement && (
                    <Badge variant="outline" className="w-fit">{user.departement}</Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Mon compte
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search Mobile */}
      {isMobileMenuOpen && (
        <div className="block sm:hidden">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className={cn(
            "fixed top-16 left-0 right-0",
            "bg-white dark:bg-gray-800",
            "border-b border-gray-200 dark:border-gray-700",
            "p-4",
            "z-50",
            "animate-in fade-in-50 slide-in-from-top-5"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full h-10 pl-10 pr-4 rounded-lg",
                  "bg-gray-50 dark:bg-gray-900",
                  "border border-gray-200 dark:border-gray-700",
                  "text-sm text-gray-900 dark:text-gray-100",
                  "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400",
                  "focus:border-transparent",
                  "transition-all duration-200"
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
            
            {/* User info for mobile */}
            <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar || ""} alt={user?.username || "User"} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {user?.username ? user.username.substring(0, 2).toUpperCase() : <User className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.username || "Utilisateur"}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {user?.email || "utilisateur@example.com"}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <User className="h-4 w-4 mr-2" />
                Mon compte
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}