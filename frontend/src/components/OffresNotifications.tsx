import React, { useMemo } from 'react';
import { useOffresNotifications } from '../hooks/useOffresNotifications';
import { OffreNotification } from '../types/offre';

interface NotificationItemProps {
  notification: OffreNotification;
  onAction?: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const formattedDate = useMemo(() => 
    new Date(notification.date_relance).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }), [notification.date_relance]);

  const formattedMontant = useMemo(() => 
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(parseFloat(notification.montant)), [notification.montant]);

  return (
    <div 
      className="p-4 mb-2 bg-white shadow rounded hover:shadow-md transition-shadow"
      role="alert"
      aria-live="polite"
    >
      <div className="flex justify-between items-start">
        <div className="font-bold text-lg mb-2 text-gray-900">
          Relance nécessaire : {notification.reference}
        </div>
        <span className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
          À relancer
        </span>
      </div>
      <div className="text-gray-700 space-y-2">
        <p>
          <span className="font-medium">Client :</span> {notification.client}
        </p>
        <p>
          <span className="font-medium">Montant :</span> {formattedMontant}
        </p>
        <p>
          <span className="font-medium">Date de relance :</span> {formattedDate}
        </p>
      </div>
    </div>
  );
};

const ConnectionStatus: React.FC<{ isConnected: boolean }> = ({ isConnected }) => (
  <div 
    className="fixed top-4 right-4 flex items-center gap-2 p-2 bg-white shadow rounded"
    role="status"
    aria-live="polite"
  >
    <span 
      className={`h-3 w-3 rounded-full ${
        isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
      }`} 
      aria-hidden="true"
    />
    <span className="text-sm font-medium">
      {isConnected ? 'Connecté' : 'Déconnecté'}
    </span>
  </div>
);

export const OffresNotifications: React.FC = () => {
  const { notifications, isConnected, clearNotifications, reconnect } = useOffresNotifications();

  return (
    <div className="relative p-4 max-w-2xl mx-auto">
      <ConnectionStatus isConnected={isConnected} />
      
      <div className="mb-6 flex flex-wrap gap-2">
        {!isConnected && (
          <button
            onClick={reconnect}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     focus:ring-2 focus:ring-blue-300 focus:outline-none 
                     transition-colors disabled:opacity-50"
            aria-label="Reconnecter au service de notifications"
          >
            Reconnecter
          </button>
        )}
        
        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 
                     focus:ring-2 focus:ring-gray-300 focus:outline-none 
                     transition-colors disabled:opacity-50"
            aria-label="Effacer toutes les notifications"
          >
            Effacer les notifications
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Aucune notification pour le moment
        </div>
      ) : (
        <div 
          className="space-y-4"
          role="log"
          aria-label="Liste des notifications d'offres à relancer"
        >
          {notifications.map((notif, index) => (
            <NotificationItem 
              key={`${notif.reference}-${index}`} 
              notification={notif} 
            />
          ))}
        </div>
      )}
    </div>
  );
};