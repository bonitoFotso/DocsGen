import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  FileText, 
  Hash,
  Users,
  Edit,
  Trash2,
  PlusCircle,
  ChevronRight,
  BarChart4,
  BadgeCheck,
  Store
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Client {
  id: number;
  c_num: string;
  nom: string;
  email: string;
  telephone: string;
  ville_nom: string;
  region_nom: string;
  secteur_activite: string;
  agreer: boolean;
  agreement_fournisseur: boolean;
  contacts_count: number;
  offres_count: number;
  affaires_count: number;
  factures_count: number;
  is_client: string;
  bp: string;
  quartier: string;
  matricule: string;
  entite: string;
  opportunities_count: number;
  courriers_count: number;
}

interface StatItemProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  className?: string;
}

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCreateOpportunity?: () => void;
  onViewDetails?: () => void;
  className?: string;
  compact?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, icon, className }) => (
  <div className={cn("text-center p-1 rounded-md", className)}>
    <div className="flex justify-center">{icon}</div>
    <div className="text-sm font-medium mt-1">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

const ClientCard: React.FC<ClientCardProps> = ({ 
  client, 
  onClick, 
  onEdit, 
  onDelete, 
  onCreateOpportunity, 
  onViewDetails,
  className,
  compact = false
}) => {
  // Obtenir les initiales du client pour l'avatar
  const getInitials = (name: string) => {
    const nameArray = name.split(' ');
    if (nameArray.length >= 2) {
      return `${nameArray[0][0]}${nameArray[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Générer une couleur d'arrière-plan pour l'avatar basée sur l'ID du client
  const getAvatarColor = (id: number) => {
    const colors = [
      'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    return colors[id % colors.length];
  };

  return (
    <TooltipProvider>
      <Card 
        className={cn(
          "transition-all duration-200 border overflow-hidden",
          onClick ? "cursor-pointer hover:shadow-md hover:border-primary/40" : "",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className={cn("pb-2", compact ? "p-3" : "")}>
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar className={cn("w-10 h-10", getAvatarColor(client.id))}>
                <AvatarFallback>{getInitials(client.nom)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className={cn("leading-tight", compact ? "text-base" : "text-lg")}>
                  {client.nom}
                </CardTitle>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Hash className="mr-1 h-3 w-3" />
                  <span>{client.c_num}</span>
                  {client.matricule && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Matricule: {client.matricule}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {client.agreer && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Agréé
                </Badge>
              )}
              {client.agreement_fournisseur && (
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  <Store className="h-3 w-3 mr-1" />
                  Fournisseur
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className={cn("space-y-4", compact ? "p-3 pt-0" : "")}>
          {!compact && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {client.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              
              {client.telephone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{client.telephone}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">{client.ville_nom || "N/A"}{client.region_nom ? `, ${client.region_nom}` : ""}</span>
              </div>

              {(client.bp || client.quartier) && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">
                    {client.bp ? `BP: ${client.bp}` : ""}
                    {client.bp && client.quartier ? " - " : ""}
                    {client.quartier || ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {client.secteur_activite && !compact && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-md text-xs font-normal">
                {client.secteur_activite}
              </Badge>
              {client.entite && (
                <Badge variant="outline" className="rounded-md text-xs font-normal">
                  {client.entite}
                </Badge>
              )}
            </div>
          )}

          <Separator className={compact ? "my-2" : ""} />

          <div className="grid grid-cols-5 gap-1">
            <StatItem 
              value={client.opportunities_count}
              label="Opportunités"
              icon={<BarChart4 className="h-4 w-4 text-blue-500" />}
              className="hover:bg-blue-50"
            />
            
            <StatItem 
              value={client.offres_count}
              label="Offres"
              icon={<FileText className="h-4 w-4 text-indigo-500" />}
              className="hover:bg-indigo-50"
            />
            
            <StatItem 
              value={client.affaires_count}
              label="Affaires"
              icon={<Briefcase className="h-4 w-4 text-purple-500" />}
              className="hover:bg-purple-50"
            />
            
            <StatItem 
              value={client.factures_count}
              label="Factures"
              icon={<Hash className="h-4 w-4 text-amber-500" />}
              className="hover:bg-amber-50"
            />
            
            <StatItem 
              value={client.contacts_count}
              label="Contacts"
              icon={<Users className="h-4 w-4 text-green-500" />}
              className="hover:bg-green-50"
            />
          </div>
        </CardContent>

        {!compact && (onEdit || onDelete || onCreateOpportunity || onViewDetails) && (
          <CardFooter className="flex justify-between pt-0 px-4 pb-4 gap-2">
            <div className="flex gap-2">
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modifier</TooltipContent>
                </Tooltip>
              )}
              
              {onDelete && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Supprimer</TooltipContent>
                </Tooltip>
              )}
            </div>
            
            <div className="flex gap-2">
              {onCreateOpportunity && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                  onClick={(e) => { e.stopPropagation(); onCreateOpportunity(); }}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Nouvelle opportunité
                </Button>
              )}
              
              {onViewDetails && (
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
                >
                  Détails
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    </TooltipProvider>
  );
};

export default ClientCard;