// components/client/ClientHeader.tsx
import React from "react";
import { ClientDetails } from "@/types/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Edit,
  Trash2,
  PlusCircle,
  BadgeCheck,
  Store,
} from "lucide-react";
import { InfoItem, getInitials, getAvatarColor } from "./ClientComponents";
import { cn } from "@/lib/utils";

interface ClientHeaderProps {
  client: ClientDetails;
  onEdit: () => void;
  onDelete: () => void;
  onCreateOpportunity: () => void;
  isSubmitting: boolean;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({
  client,
  onEdit,
  onDelete,
  onCreateOpportunity,
  isSubmitting,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <Avatar className={cn("w-12 h-12", getAvatarColor(client.id))}>
              <AvatarFallback>{getInitials(client.nom)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-2xl">{client.nom}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>Client N° {client.c_num}</span>
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
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 bg-green-50"
              >
                <BadgeCheck className="h-3 w-3 mr-1" />
                Agréé
              </Badge>
            )}
            {client.agreement_fournisseur && (
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200 bg-blue-50"
              >
                <Store className="h-3 w-3 mr-1" />
                Fournisseur
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoItem
            icon={<Mail className="h-4 w-4" />}
            label="Email"
            value={client.email}
          />
          <InfoItem
            icon={<Phone className="h-4 w-4" />}
            label="Téléphone"
            value={client.telephone}
          />
          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Localisation"
            value={`${client.ville?.nom || ""}, ${client.region_nom || ""}`}
          />
          <InfoItem
            icon={<Building2 className="h-4 w-4" />}
            label="Adresse postale"
            value={client.bp ? `BP: ${client.bp}` : "-"}
          />
          <InfoItem
            icon={<MapPin className="h-4 w-4" />}
            label="Quartier"
            value={client.quartier}
          />
          <InfoItem
            icon={<Briefcase className="h-4 w-4" />}
            label="Secteur d'activité"
            value={<Badge variant="secondary">{client.secteur_activite}</Badge>}
          />
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onEdit} disabled={isSubmitting}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="outline"
            className="border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
          <Button onClick={onCreateOpportunity} disabled={isSubmitting}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nouvelle opportunité
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientHeader;
