import { Clock, CheckCircle2, X } from 'lucide-react';
import { AffaireStatus } from '@/interfaces';

export const getStatusLabel = (status: AffaireStatus): string => {
  const statusLabels: Record<AffaireStatus, string> = {
    'EN_COURS': 'En cours',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée'
  };
  return statusLabels[status] || status;
};

export const getStatusIcon = (status: AffaireStatus) => {
  switch (status) {
    case 'EN_COURS':
      return <Clock className="h-3 w-3" />;
    case 'TERMINEE':
      return <CheckCircle2 className="h-3 w-3" />;
    case 'ANNULEE':
      return <X className="h-3 w-3" />;
    default:
      return null;
  }
};

export const getStatusBadgeClass = (status: AffaireStatus): string => {
  switch (status) {
    case 'EN_COURS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'TERMINEE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ANNULEE':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

