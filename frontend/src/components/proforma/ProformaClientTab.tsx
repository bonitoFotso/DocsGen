// src/components/proforma/ProformaClientTab.tsx
import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Building,
  Mail,
  User,
  FileText,
  Info,
  RefreshCw
} from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { NavigateFunction } from 'react-router-dom';
import { IProformaDetail } from '@/services/proformaService';

interface ProformaClientTabProps {
  proforma: IProformaDetail;
  fetchProforma: () => void;
  navigate: NavigateFunction;
}

const ProformaClientTab: React.FC<ProformaClientTabProps> = ({
  proforma,
  fetchProforma,
  navigate
}) => {
  return (
    typeof proforma.offre === 'object' ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations du client */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-lg">{proforma.offre.client.nom}</span>
            </div>

            {proforma.offre.client.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{proforma.offre.client.email}</span>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Code client: {proforma.offre.client.c_num}</span>
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => navigate(`/clients/${proforma.offre.client.id}`)}
            >
              Voir le client
            </Button>
          </CardContent>
        </Card>

        {/* Informations de l'offre */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'offre</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold text-lg">{proforma.offre.reference}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-muted/30">
                {proforma.offre.statut}
              </Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-800">
                {proforma.offre.entity.code}
              </Badge>
            </div>

            <div className="mt-2">
              <Label>Montant de l'offre</Label>
              <div className="mt-1 font-medium">
                {formatCurrency(proforma.offre.montant)}
              </div>
            </div>

            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => navigate(`/offres/${proforma.offre.id}`)}
            >
              Voir l'offre
            </Button>
          </CardContent>
        </Card>
      </div>
    ) : (
      <Card>
        <CardContent className="py-10 text-center">
          <Info className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p>Informations client et offre non disponibles en mode liste.</p>
          <p className="text-sm text-muted-foreground mt-2">Actualisez pour charger les détails complets.</p>
          <Button
            variant="outline"
            onClick={fetchProforma}
            className="mt-4"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Charger les détails
          </Button>
        </CardContent>
      </Card>
    )
  );
};

export default ProformaClientTab;