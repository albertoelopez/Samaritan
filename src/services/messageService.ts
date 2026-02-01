import { ConversationModel, Conversation } from '../models/Conversation';
import { MessageModel, Message } from '../models/Message';
import { UserModel } from '../models/User';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { NotificationService } from './notificationService';

export interface SendMessageData {
  messageText: string;
  attachments?: Record<string, unknown>;
}

export class MessageService {
  static async getOrCreateConversation(
    userId: string,
    participantId: string,
    jobId?: string,
    contractId?: string
  ): Promise<Conversation> {
    // Check if conversation already exists
    const existing = await ConversationModel.findBetweenUsers([userId, participantId]);
    if (existing) {
      return existing;
    }

    // Validate participants exist
    const [user, participant] = await Promise.all([
      UserModel.findById(userId),
      UserModel.findById(participantId),
    ]);

    if (!user || !participant) {
      throw new BadRequestError('Invalid participants');
    }

    return ConversationModel.create(
      { job_id: jobId || null, contract_id: contractId || null },
      [userId, participantId]
    );
  }

  static async getConversation(conversationId: string, userId: string): Promise<Conversation> {
    const conversation = await ConversationModel.getWithParticipants(conversationId);
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    return conversation;
  }

  static async getUserConversations(
    userId: string,
    options: { page?: number; limit?: number; includeArchived?: boolean }
  ): Promise<{ conversations: Conversation[]; total: number }> {
    return ConversationModel.findByUserId(userId, options);
  }

  static async sendMessage(
    conversationId: string,
    userId: string,
    data: SendMessageData
  ): Promise<Message> {
    const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    const message = await MessageModel.create({
      conversation_id: conversationId,
      sender_id: userId,
      message_text: data.messageText,
      attachments: data.attachments || null,
    });

    // Update sender's last read
    await ConversationModel.updateLastRead(conversationId, userId);

    // Notify other participants
    const participants = await ConversationModel.getParticipants(conversationId);
    const otherParticipants = participants.filter((p) => p.user_id !== userId);

    for (const participant of otherParticipants) {
      await NotificationService.createNotification({
        userId: participant.user_id,
        type: 'message_received',
        title: 'New Message',
        message: data.messageText.substring(0, 100),
        data: { conversationId, messageId: message.id },
      });
    }

    return message;
  }

  static async getMessages(
    conversationId: string,
    userId: string,
    options: { page?: number; limit?: number; before?: Date }
  ): Promise<{ messages: Message[]; total: number }> {
    const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    // Mark as read
    await ConversationModel.updateLastRead(conversationId, userId);

    return MessageModel.findByConversationId(conversationId, options);
  }

  static async editMessage(
    messageId: string,
    userId: string,
    newText: string
  ): Promise<Message> {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenError('Can only edit your own messages');
    }

    const updated = await MessageModel.update(messageId, { message_text: newText });
    if (!updated) {
      throw new NotFoundError('Failed to update message');
    }

    return updated;
  }

  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await MessageModel.findById(messageId);
    if (!message) {
      throw new NotFoundError('Message not found');
    }

    if (message.sender_id !== userId) {
      throw new ForbiddenError('Can only delete your own messages');
    }

    await MessageModel.delete(messageId);
  }

  static async archiveConversation(conversationId: string, userId: string): Promise<void> {
    const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    await ConversationModel.archive(conversationId, userId);
  }

  static async unarchiveConversation(conversationId: string, userId: string): Promise<void> {
    const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    await ConversationModel.unarchive(conversationId, userId);
  }

  static async markAsRead(conversationId: string, userId: string): Promise<void> {
    const isParticipant = await ConversationModel.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenError('Not a participant in this conversation');
    }

    await ConversationModel.updateLastRead(conversationId, userId);
  }
}
