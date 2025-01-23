import React from 'react';
import { Clock, Send, CheckCircle2, XCircle, X } from 'lucide-react';
import { DocumentStatus } from '@/interfaces';

interface StatusBadgeProps {
  status: DocumentStatus;
}

const getStatusLabel = (status: DocumentStatus): string => {
  const statusLabels: Record<DocumentStatus, string> = {
    'BROUILLON': 'Brouillon',
    'ENVOYE': 'Envoyé',
    'VALIDE': 'Validé',
    'REFUSE': 'Refusé',
    'EN_COURS': 'En cours',
    'TERMINEE': 'Terminée',
    'ANNULEE': 'Annulée'
  };
  return statusLabels[status] || status;
};

const getStatusIcon = (status: DocumentStatus) => {
  switch (status) {
    case 'BROUILLON':
      return <Clock className="h-3 w-3 mr-1" />;
    case 'ENVOYE':
      return <Send className="h-3 w-3 mr-1" />;
    case 'VALIDE':
      return <CheckCircle2 className="h-3 w-3 mr-1" />;
    case 'REFUSE':
      return <XCircle className="h-3 w-3 mr-1" />;
    case 'EN_COURS':
      return <Clock className="h-3 w-3 mr-1" />;
    case 'TERMINEE':
      return <CheckCircle2 className="h-3 w-3 mr-1" />;
    case 'ANNULEE':
      return <X className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

const getStatusBadgeClass = (status: DocumentStatus): string => {
  switch (status) {
    case 'BROUILLON':
      return 'bg-gray-100 text-gray-800';
    case 'ENVOYE':
      return 'bg-blue-100 text-blue-800';
    case 'VALIDE':
      return 'bg-green-100 text-green-800';
    case 'REFUSE':
      return 'bg-red-100 text-red-800';
    case 'EN_COURS':
      return 'bg-yellow-100 text-yellow-800';
    case 'TERMINEE':
      return 'bg-emerald-100 text-emerald-800';
    case 'ANNULEE':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(status)}`}>
      {getStatusIcon(status)}
      {getStatusLabel(status)}
    </span>
  );
};