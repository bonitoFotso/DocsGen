import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  User,
  LogOut,
  Search,
  X,
  Settings,
  Sun,
  Moon,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MenuIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/contexts/SidebarContext";
import useTheme from "@/hooks/use-theme";
import { useLayout } from "@/contexts/LayoutContext";
import { useAuth } from "@/contexts/AuthContext";

// Types for notifications
type NotificationType = "info" | "success" | "warning" | "message";

interface Notification {
  id: number;
  text: string;
  description?: string;
  unread: boolean;
  time: string;
  type: NotificationType;
}

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { expanded } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const { isScrolled } = useLayout();
  const { user, logout } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      text: "Nouvelle opportunité créée",
      description: "Client: Entreprise Alpha, Produit: Service Premium",
      unread: true,
      time: "Il y a 5 min",
      type: "success",
    },
    {
      id: 2,
      text: "Mise à jour système prévue",
      description: "Une maintenance est prévue ce soir à 22h00",
      unread: true,
      time: "Il y a 1h",
      type: "warning",
    },
    {
      id: 3,
      text: "Message de Jean Dupont",
      description: "Bonjour, pouvez-vous m'envoyer les détails du projet ?",
      unread: false,
      time: "Hier, 14:30",
      type: "message",
    },
    {
      id: 4,
      text: "Réunion équipe commerciale",
      description: "Réunion hebdomadaire à 10h00 en salle B",
      unread: false,
      time: "26/03/2025",
      type: "info",
    },
  ]);

  const notificationCount = notifications.filter((n) => n.unread).length;

  // Close notifications menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Ctrl+K or Cmd+K to focus search
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Notification handlers
  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, unread: false })));
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  // Helper for notification icon by type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "info":
      default:
        return <Calendar className="h-5 w-5 text-indigo-500" />;
    }
  };

  // Helper for notification background color
  const getNotificationColor = (type: NotificationType, unread: boolean) => {
    if (!unread) return "";

    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/10";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/10";
      case "message":
        return "bg-blue-50 dark:bg-blue-900/10";
      case "info":
      default:
        return "bg-indigo-50 dark:bg-indigo-900/10";
    }
  };

  // Mock user logout function
  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16",
        "bg-background/80 dark:bg-background/80",
        "border-b border-border",
        "backdrop-blur-md",
        "transition-all duration-200",
        isScrolled && "shadow-sm",
        className
      )}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 mx-auto flex items-center justify-between">
        {/* Left side: Menu toggle and title */}
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  aria-label={expanded ? "Réduire le menu" : "Ouvrir le menu"}
                >
                  <MenuIcon className="h-8 w-8 text-black" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {expanded ? "Réduire le menu" : "Ouvrir le menu"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <h1 className="text-lg font-semibold mr-6 hidden sm:block">
            KES DOC_GEN
          </h1>
        </div>

        {/* Center: Search field */}
        <div className="hidden sm:flex items-center flex-1 max-w-2xl">
          <div className="w-full max-w-md mx-auto p-4">
            <div className="relative w-full group">
              {/* Search icon */}
              <Search
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                  "transition-colors duration-200",
                  isSearchFocused ? "text-gray-600" : "text-gray-400"
                )}
              />

              {/* Input field */}
              <input
                ref={searchRef}
                type="search"
                placeholder="Rechercher... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={cn(
                  "w-full h-10 pl-10 pr-16 border rounded-md",
                  "outline-none focus:ring-1 focus:ring-gray-100",
                  "transition-all duration-200"
                )}
              />

              {/* Clear button - only shown when there's text */}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-12 top-1/2 -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-700 transition-colors" />
                </button>
              )}

              {/* Keyboard shortcut hint */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center text-xs text-gray-400">
                Ctrl+K
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Theme toggle */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={
                    theme === "dark"
                      ? "Passer en mode clair"
                      : "Passer en mode sombre"
                  }
                >
                  {theme === "dark" ? (
                    <Sun className="h-6 w-6 text-amber-400" />
                  ) : (
                    <Moon className="h-6 w-6 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {theme === "dark" ? "Mode clair" : "Mode sombre"}
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
                    className="relative focus-visible:ring-1 focus-visible:ring-primary"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {notificationCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 flex items-center justify-center h-5 w-5 p-0 text-xs rounded-full"
                      >
                        {notificationCount}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Notifications{" "}
                  {notificationCount > 0 && `(${notificationCount})`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div
                className={cn(
                  "absolute right-0 mt-2 w-80 sm:w-96",
                  "bg-card",
                  "rounded-lg shadow-lg border border-border",
                  "animate-in fade-in-50 slide-in-from-top-5",
                  "z-50"
                )}
              >
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Notifications</h3>
                    {notificationCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllNotificationsAsRead}
                        className="text-xs h-8 px-2 text-primary hover:text-primary/90"
                      >
                        Tout marquer comme lu
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="max-h-[350px]">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-border">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "relative p-3 hover:bg-accent/50 cursor-pointer",
                            "transition-colors duration-200 group",
                            getNotificationColor(
                              notification.type,
                              notification.unread
                            )
                          )}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <div className="flex">
                            <div className="flex-shrink-0 mr-3 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between">
                                <p
                                  className={cn(
                                    "text-sm",
                                    notification.unread
                                      ? "font-semibold"
                                      : "font-medium"
                                  )}
                                >
                                  {notification.text}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  onClick={(e) =>
                                    deleteNotification(notification.id, e)
                                  }
                                >
                                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </Button>
                              </div>
                              {notification.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                  {notification.description}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {notification.time}
                              </p>
                              {notification.unread && (
                                <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                      <p>Aucune notification</p>
                    </div>
                  )}
                </ScrollArea>

                <div className="p-3 border-t text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sm text-primary hover:text-primary/90"
                  >
                    Voir toutes les notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9 cursor-pointer border-2 border-transparent hover:border-primary transition-all duration-200">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    AU
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <h5 className="font-medium text-sm text-capitalize">{user?.username}</h5>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="w-fit">
                    {user?.username}
                  </Badge>
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
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
