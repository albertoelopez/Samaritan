import { io, Socket } from 'socket.io-client';
import { store } from '../../store/store';
import { 
  jobRealTimeUpdate, 
  jobRealTimeRemove 
} from '../../features/jobs/jobsSlice';
import { 
  messageReceived, 
  messageStatusUpdated,
  typingStatusUpdated 
} from '../../features/messages/messagesSlice';
import { 
  notificationReceived 
} from '../../features/notifications/notificationsSlice';
import { WS_URL } from '../../utils/constants';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private pingInterval: NodeJS.Timer | null = null;

  connect(token: string): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
    this.setupPingInterval();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.subscribeToUserChannels();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.clearPingInterval();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.reconnectAttempts++;
    });

    // Job events
    this.socket.on('job:created', (job) => {
      store.dispatch(jobRealTimeUpdate(job));
    });

    this.socket.on('job:updated', (job) => {
      store.dispatch(jobRealTimeUpdate(job));
    });

    this.socket.on('job:deleted', (jobId) => {
      store.dispatch(jobRealTimeRemove(jobId));
    });

    // Message events
    this.socket.on('message:new', (message) => {
      store.dispatch(messageReceived(message));
      
      // Show notification if app is not focused
      if (document.hidden) {
        this.showNotification('New Message', message.content);
      }
    });

    this.socket.on('message:status', ({ messageId, status }) => {
      store.dispatch(messageStatusUpdated({ id: messageId, status }));
    });

    this.socket.on('typing:start', ({ conversationId, userId }) => {
      store.dispatch(typingStatusUpdated({ conversationId, userId, isTyping: true }));
    });

    this.socket.on('typing:stop', ({ conversationId, userId }) => {
      store.dispatch(typingStatusUpdated({ conversationId, userId, isTyping: false }));
    });

    // Notification events
    this.socket.on('notification:new', (notification) => {
      store.dispatch(notificationReceived(notification));
      this.showNotification(notification.title, notification.body);
    });
  }

  private subscribeToUserChannels(): void {
    const state = store.getState();
    const userId = state.auth.user?.id;
    
    if (userId && this.socket) {
      // Join user-specific rooms
      this.socket.emit('join:user', userId);
      
      // Join conversation rooms
      const conversationIds = state.messages.conversationIds;
      conversationIds.forEach((conversationId) => {
        this.socket?.emit('join:conversation', conversationId);
      });
    }
  }

  // Ping/pong for connection health check
  private setupPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, 30000); // Ping every 30 seconds
  }

  private clearPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // Public methods
  disconnect(): void {
    this.clearPingInterval();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('WebSocket not connected. Unable to emit:', event);
    }
  }

  // Typing indicators
  startTyping(conversationId: string): void {
    this.emit('typing:start', { conversationId });
  }

  stopTyping(conversationId: string): void {
    this.emit('typing:stop', { conversationId });
  }

  // Join/leave conversation
  joinConversation(conversationId: string): void {
    this.emit('join:conversation', conversationId);
  }

  leaveConversation(conversationId: string): void {
    this.emit('leave:conversation', conversationId);
  }

  // Notification helper
  private showNotification(title: string, body: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/logo192.png',
        tag: 'app-notification',
      });
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();