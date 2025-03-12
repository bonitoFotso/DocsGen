// components/offre/HistoriqueTab.tsx
import React from 'react';
import { FileText, Edit, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { HistoriqueEntry } from '@/types/offre';

interface HistoriqueTabProps {
  historique: HistoriqueEntry[];
}

const HistoriqueTab: React.FC<HistoriqueTabProps> = ({ historique }) => {
  // Formater la date et l'heure
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtenir l'icône en fonction de l'action
  const getActionIcon = (action: string) => {
    switch(action) {
      case "Création":
        return <FileText className="h-4 w-4" />;
      case "Modification":
        return <Edit className="h-4 w-4" />;
      case "Envoi":
        return <Mail className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {historique.length === 0 ? (
          <div className="rounded-md border p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Aucun historique disponible</p>
          </div>
        ) : (
          <div className="space-y-4">
            {historique.map((entry, index) => (
              <div key={entry.id} className="flex gap-4">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getActionIcon(entry.action)}
                  </div>
                  {index < historique.length - 1 && (
                    <div className="absolute top-8 bottom-0 left-4 w-0.5 bg-border" />
                  )}
                </div>
                <div className="space-y-1 pb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(entry.date)}</span>
                  </div>
                  <div className="text-sm">par <span className="font-medium">{entry.utilisateur}</span></div>
                  {entry.commentaire && (
                    <div className="text-sm text-muted-foreground">{entry.commentaire}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoriqueTab;