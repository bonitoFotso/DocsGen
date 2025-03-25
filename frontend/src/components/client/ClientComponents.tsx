// components/client/ClientComponents.tsx
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Building2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Contact } from "@/types/contact";

// Composant pour afficher une information avec une icône
export const InfoItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}> = ({ icon, label, value }) => (
  <div className="space-y-1">
    <div className="flex items-center text-sm text-muted-foreground">
      {icon}
      <span className="ml-1">{label}</span>
    </div>
    <p>{value || "-"}</p>
  </div>
);

// Composant pour afficher une statistique avec une icône
export const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  onClick?: () => void;
}> = ({ label, value, icon, onClick }) => (
  <Card
    className={cn(
      "text-center hover:bg-muted/30 transition-colors",
      onClick && "cursor-pointer"
    )}
    onClick={onClick}
  >
    <CardContent className="pt-6 pb-4 px-4">
      <div className="flex justify-center text-primary">{icon}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </CardContent>
  </Card>
);

// Composant pour afficher des informations avec un titre, sous-titre, statut et date
export const CardInfo: React.FC<{
  title: string;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  date?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}> = ({ title, subtitle, status, statusColor, date, onClick, children }) => (
  <Card
    className={cn(
      "overflow-hidden transition-shadow hover:shadow-md",
      onClick && "cursor-pointer"
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-medium">{title}</div>
          {subtitle && (
            <div className="text-sm text-muted-foreground">{subtitle}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <Badge variant={(statusColor as string) || "default"}>
              {status}
            </Badge>
          )}
          {date && (
            <div className="text-xs text-muted-foreground flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {date}
            </div>
          )}
        </div>
      </div>
      {children && <div className="mt-2">{children}</div>}
    </CardContent>
  </Card>
);

// Composant pour afficher une carte de contact
export const ContactCard: React.FC<{
  contact: Contact;
  onClick?: () => void;
}> = ({ contact, onClick }) => (
  <Card
    className={cn(
      "overflow-hidden hover:shadow-md transition-shadow",
      onClick && "cursor-pointer"
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 bg-primary/10">
          <AvatarFallback className="text-primary">
            {contact.prenom?.charAt(0) || ""}
            {contact.nom?.charAt(0) || ""}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">
            {contact.prenom} {contact.nom}
          </div>
          {contact.poste && (
            <div className="text-sm text-muted-foreground">{contact.poste}</div>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.telephone && (
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span>{contact.telephone}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

interface Site {
  nom: string;
  code?: string;
  statut?: string;
  adresse?: string;
  ville?: string;
}

// Composant pour afficher une carte de site
export const SiteCard: React.FC<{
  site: Site;
  onClick?: () => void;
  statusColor: (status: string) => string;
}> = ({ site, onClick, statusColor }) => (
  <Card
    className={cn(
      "overflow-hidden hover:shadow-md transition-shadow",
      onClick && "cursor-pointer"
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium">{site.nom}</div>
          {site.code && (
            <div className="text-sm text-muted-foreground">
              Code: {site.code}
            </div>
          )}
        </div>
        {site.statut && (
          <Badge variant={statusColor(site.statut) as any}>{site.statut}</Badge>
        )}
      </div>

      <div className="mt-3 space-y-1 text-sm">
        {site.adresse && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{site.adresse}</span>
          </div>
        )}
        {site.ville && (
          <div className="flex items-center gap-2">
            <Building2 className="h-3 w-3 text-muted-foreground" />
            <span>{site.ville}</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Fonction utilitaire pour déterminer la couleur du badge de statut
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    // Statuts des opportunités
    PROSPECT: "secondary",
    QUALIFICATION: "default",
    PROPOSITION: "outline",
    NEGOCIATION: "warning",
    GAGNEE: "success",
    PERDUE: "destructive",

    // Statuts des affaires et factures
    EN_COURS: "default",
    TERMINEE: "success",
    ANNULEE: "destructive",
    PAYEE: "success",
    EN_ATTENTE: "warning",
    RETARD: "destructive",

    // Par défaut
    ACTIF: "success",
    INACTIF: "secondary",
  };

  return statusMap[status] || "default";
};

// Fonction utilitaire pour obtenir les initiales
export const getInitials = (name: string = ""): string => {
  const nameArray = name.split(" ");
  if (nameArray.length >= 2) {
    return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

// Fonction utilitaire pour obtenir une couleur d'avatar
export const getAvatarColor = (id: number): string => {
  const colors = [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  return colors[id % colors.length];
};
