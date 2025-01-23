import { AffaireStatus } from '@/interfaces';
import { getStatusBadgeClass, getStatusIcon, getStatusLabel } from './affaireStatusUtils';

interface StatusBadgeProps {
  status: AffaireStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(status)}`}>
    {getStatusIcon(status)}
    <span className="ml-1">{getStatusLabel(status)}</span>
  </span>
);