import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { MessageModel } from '../models/Message';
import { ConversationModel } from '../models/Conversation';
import { logger } from '../utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

interface JwtPayload {
  userId: string;
  email: string;
}

// Store online users: Map<userId, Set<socketId>>
const onlineUsers = new Map<string, Set<string>>();

export function setupSocketHandlers(io: Server): void {
  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    logger.info(`User connected: ${userId} (socket: ${socket.id})`);

    // Add to online users
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Broadcast user online status
    socket.broadcast.emit('user:online', { userId });

    // Join user's conversation rooms
    joinUserConversations(socket, userId);

    // Handle joining a conversation
    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${userId} joined conversation ${conversationId}`);
    });

    // Handle leaving a conversation
    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Handle new message
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      messageType?: string;
    }) => {
      try {
        const { conversationId, content, messageType = 'text' } = data;

        // Verify user is participant
        const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not a participant of this conversation' });
          return;
        }

        // Create message
        const message = await MessageModel.create({
          conversation_id: conversationId,
          sender_id: userId,
          message_type: messageType as 'text' | 'image' | 'file' | 'system',
          content,
          attachments: null,
        });

        // Broadcast to conversation room
        io.to(`conversation:${conversationId}`).emit('message:new', {
          message,
          conversationId,
        });

        // Send push notification to offline participants
        const participants = await ConversationModel.getParticipants(conversationId);
        for (const participant of participants) {
          if (participant.user_id !== userId && !onlineUsers.has(participant.user_id)) {
            // User is offline - could trigger push notification here
            logger.info(`User ${participant.user_id} is offline - would send push notification`);
          }
        }

      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:start', {
        userId,
        conversationId,
      });
    });

    socket.on('typing:stop', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('typing:stop', {
        userId,
        conversationId,
      });
    });

    // Handle message read
    socket.on('message:read', async (data: { conversationId: string; messageId: string }) => {
      try {
        await MessageModel.markAsRead(data.messageId, userId);
        socket.to(`conversation:${data.conversationId}`).emit('message:read', {
          messageId: data.messageId,
          readBy: userId,
        });
      } catch (error) {
        logger.error('Error marking message as read:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId} (socket: ${socket.id})`);

      // Remove from online users
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          // Broadcast user offline status
          socket.broadcast.emit('user:offline', { userId });
        }
      }
    });
  });
}

async function joinUserConversations(socket: AuthenticatedSocket, userId: string): Promise<void> {
  try {
    const { conversations } = await ConversationModel.findByUserId(userId, { limit: 100 });
    for (const conversation of conversations) {
      socket.join(`conversation:${conversation.id}`);
    }
    logger.info(`User ${userId} joined ${conversations.length} conversation rooms`);
  } catch (error) {
    logger.error('Error joining user conversations:', error);
  }
}

// Export for use in other parts of the app (e.g., REST endpoints)
export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}
