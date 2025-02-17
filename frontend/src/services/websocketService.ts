type WebSocketStatus = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;
  private reconnectDelay = 3000; // 3 seconds
  private messageQueue: string[] = [];

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  private getWebSocketUrl(): string {
    // En développement, forcez l'utilisation de ws:// au lieu de wss://
    const protocol = 'ws:';
    const host = "192.168.100.188:8080";
    return `${protocol}//${host}/ws/notifications/`;
  }

  connect(): WebSocket {
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(this.getWebSocketUrl());
      
      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        // Send any messages that were queued while disconnected
        this.flushMessageQueue();
      };

      this.ws.onclose = () => {
        this.handleDisconnection();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnection();
      };
    }
    return this.ws;
  }

  private handleDisconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift();
      if (message) this.sendMessage(message);
    }
  }

  sendMessage(message: string): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      return true;
    } else {
      this.messageQueue.push(message);
      return false;
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  }

  getStatus(): WebSocketStatus {
    if (!this.ws) return 'CLOSED';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING';
      case WebSocket.OPEN:
        return 'OPEN';
      case WebSocket.CLOSING:
        return 'CLOSING';
      case WebSocket.CLOSED:
        return 'CLOSED';
      default:
        return 'CLOSED';
    }
  }
}