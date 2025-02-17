import { DocumentStatus } from '@/interfaces';
import React from 'react';

const statusColors: Record<DocumentStatus, { bg: string; text: string }> = {
  BROUILLON: { bg: 'bg-gray-100', text: 'text-gray-800' },
  ENVOYE: { bg: 'bg-blue-100', text: 'text-blue-800' },
  VALIDE: { bg: 'bg-green-100', text: 'text-green-800' },
  REFUSE: { bg: 'bg-red-100', text: 'text-red-800' },
  EN_COURS: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  TERMINEE: { bg: 'bg-purple-100', text: 'text-purple-800' },
  ANNULEE: { bg: 'bg-red-100', text: 'text-red-800' },
};

interface StatusBadgeProps {
  status: DocumentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const colors = statusColors[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      {status}
    </span>
  );
};