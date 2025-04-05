import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Package,
  GraduationCap,
  HandCoins,
  Contact,
  Settings,
  HelpCircle,
  FileBarChart,
  Mail,
  Briefcase,
  GithubIcon,
  PhoneIcon,
} from "lucide-react";

// Liste des entités disponibles
export const entities = ["TOUTES", "KIP", "KEC", "KAR", "KES"];

export interface BadgeProps {
  text: string;
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "secondary";
}

export interface NavigationChild {
  name: string;
  href: string | ((entity: string) => string);
  icon: React.ElementType;
  badge?: BadgeProps;
  entitySpecific?: boolean; // Indique si le lien dépend de l'entité
}

export interface NavigationItem {
  name: string;
  href?: string | ((entity: string) => string);
  icon: React.ElementType;
  category: "main" | "business" | "system";
  badge?: BadgeProps;
  children?: NavigationChild[];
  entitySpecific?: boolean; // Indique si le lien dépend de l'entité
}

export interface FooterItem {
  name: string;
  href: string;
  icon: React.ElementType;
  external?: boolean;
}

// Génère un lien dynamique basé sur l'entité actuelle
export const getEntityLink = (baseUrl: string, entity: string) => {
  return `/${entity.toLowerCase()}${baseUrl}`;
};

// Fonction utilitaire pour résoudre les liens dynamiques
export const resolveHref = (
  href: string | ((entity: string) => string),
  entity: string
): string => {
  if (typeof href === "function") {
    return href(entity);
  }
  return href;
};

// Configuration principale de la navigation
export const getNavigationItems = (currentEntity: string): NavigationItem[] => [
  // Main category
  {
    name: "Tableau de bord",
    href: "/",
    icon: LayoutDashboard,
    category: "main",
  },
  {
    name: "Entités",
    href: "/entities",
    icon: Building2,
    category: "main",
    children: entities.map((entity) => ({
      name: entity,
      href: `/entities/${entity.toLowerCase()}`,
      icon: Building2,
      entitySpecific: true,
      badge:
        entity === currentEntity
          ? { text: "Active", variant: "success" }
          : undefined,
    })),
  },
  
  {
    name: "Clients",
    href: "/clients",
    icon: Users,
    category: "main",
    badge: { text: "4", variant: "default" },
  },
  { name: "Contacts", href: "/contacts", icon: Contact, category: "main" },

  // Business operations
  {
    name: "Commercial",
    icon: HandCoins,
    category: "business",
    children: [
      {
        name: "Opportunités",
        href: (entity) => getEntityLink("/opportunities", entity),
        icon: Briefcase,
        badge: { text: "Nouveau", variant: "success" },
        entitySpecific: true,
      },
      {
        name: "Proformas",
        href: (entity) => getEntityLink("/proformas", entity),
        icon: FileText,
        entitySpecific: true,
      },
      {
        name: "Offres",
        href: (entity) => getEntityLink("/offres", entity),
        icon: FileText,
        entitySpecific: true,
      },

      {
        name: "Affaires",
        href: (entity) => getEntityLink("/affaires", entity),
        icon: FileText,
        entitySpecific: true,
      },
      
      {
        name: "Factures",
        href: (entity) => getEntityLink("/factures", entity),
        icon: FileText,
        entitySpecific: true,
      },
    ],
  },
  {
    name: "Produits",
    href: (entity) => getEntityLink("/products", entity),
    icon: Package,
    category: "business",
    entitySpecific: true,
  },
  {
    name: "Formations",
    href: (entity) => getEntityLink("/formations", entity),
    icon: GraduationCap,
    category: "business",
    entitySpecific: true,
  },
  {
    name: "Rapports",
    href: "/rapports",
    icon: FileBarChart,
    category: "business",
  },
  { name: "Courriers", href: "/courriers", icon: Mail, category: "business" },

  // System category
  { name: "Paramètres", href: "/settings", icon: Settings, category: "system" },
  { name: "Aide", href: "/help", icon: HelpCircle, category: "system" },
];

// Footer navigation items
export const footerItems: FooterItem[] = [
  {
    name: "GitHub",
    href: "https://github.com/kesdocgen",
    icon: GithubIcon,
    external: true,
  },
  {
    name: "Contact",
    href: "mailto:contact@kesdocgen.com",
    icon: PhoneIcon,
    external: true,
  },
  { name: "Aide", href: "/help", icon: HelpCircle },
  { name: "Paramètres", href: "/settings", icon: Settings },
];
