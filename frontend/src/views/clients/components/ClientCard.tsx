import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Briefcase, 
  FileText, 
  Hash,
  Users
} from 'lucide-react';

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
}

interface ClientCardProps {
  client: Client;
  onClick?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <CardTitle className="text-xl">{client.nom}</CardTitle>
          </div>
          <div className="flex gap-2">
            {client.agreer && (
              <Badge variant="default" className="bg-green-500">Agréé</Badge>
            )}
            {client.agreement_fournisseur && (
              <Badge variant="default" className="bg-blue-500">Fournisseur</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="h-4 w-4" />
            <span>{client.email}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{client.telephone}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{client.ville_nom}, {client.region_nom}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="h-4 w-4" />
            <span>BP: {client.bp} - {client.quartier}</span>
          </div>

          <div className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            {client.secteur_activite}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-3 border-t">
          <div className="text-center">
            <Users className="h-4 w-4 mx-auto mb-1" />
            <div className="text-sm font-medium">{client.contacts_count}</div>
            <div className="text-xs text-gray-500">Contacts</div>
          </div>
          
          <div className="text-center">
            <FileText className="h-4 w-4 mx-auto mb-1" />
            <div className="text-sm font-medium">{client.offres_count}</div>
            <div className="text-xs text-gray-500">Offres</div>
          </div>
          
          <div className="text-center">
            <Briefcase className="h-4 w-4 mx-auto mb-1" />
            <div className="text-sm font-medium">{client.affaires_count}</div>
            <div className="text-xs text-gray-500">Affaires</div>
          </div>
          
          <div className="text-center">
            <Hash className="h-4 w-4 mx-auto mb-1" />
            <div className="text-sm font-medium">{client.factures_count}</div>
            <div className="text-xs text-gray-500">Factures</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientCard;