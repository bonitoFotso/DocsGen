import { useState, useEffect, useCallback } from 'react';
import { WebSocketService } from '../services/websocketService';
import { OffreNotification } from '../types/offre';

interface UseOffresNotificationsReturn {
  notifications: OffreNotification[];
  isConnected: boolean;
  clearNotifications: () => void;
  reconnect: () => void;
}

export const useOffresNotifications = (): UseOffresNotificationsReturn => {
  const [notifications, setNotifications] = useState<OffreNotification[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const wsService = WebSocketService.getInstance();

  // Gestion des notifications du navigateur
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
      }
    }
    return false;
  }, []);

  const showNotification = useCallback((data: OffreNotification) => {
    if (Notification.permission === 'granted') {
      try {
        new Notification('Relance d\'offre nécessaire', {
          body: `L'offre ${data.reference} pour ${data.client} nécessite une relance`,
          icon: '/path/to/your/icon.png',
          tag: `offre-${data.reference}`, // Évite les doublons
          data: { url: `/offres/${data.reference}` }, // Pour la navigation au clic
        });
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: OffreNotification = JSON.parse(event.data);
      if (data.type === 'RELANCE_REQUISE') {
        setNotifications(prev => {
          // Évite les doublons
          const isDuplicate = prev.some(notif => notif.reference === data.reference);
          if (isDuplicate) return prev;
          return [...prev, data];
        });
        showNotification(data);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [showNotification]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const reconnect = useCallback(() => {
    wsService.disconnect();
    const ws = wsService.connect();
    setupWebSocket(ws);
  }, []);

  const setupWebSocket = useCallback((ws: WebSocket) => {
    let reconnectTimeout: NodeJS.Timeout;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      console.log('WebSocket Disconnected:', event.code, event.reason);
      
      // Évite les reconnexions multiples
      clearTimeout(reconnectTimeout);
      reconnectTimeout = setTimeout(reconnect, 3000);
    };

    ws.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
      // On ne déclenche pas la reconnexion ici car onclose sera appelé après
    };

    ws.onmessage = handleMessage;

    return () => {
      clearTimeout(reconnectTimeout);
    };
  }, [handleMessage, reconnect]);

  useEffect(() => {
    requestNotificationPermission();
    
    const ws = wsService.connect();
    const cleanup = setupWebSocket(ws);

    return () => {
      cleanup();
      wsService.disconnect();
    };
  }, [setupWebSocket, requestNotificationPermission, wsService]);

  return { 
    notifications, 
    isConnected, 
    clearNotifications, 
    reconnect 
  };
};