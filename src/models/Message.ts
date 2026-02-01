import { db } from '../config/database';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  attachments: Record<string, unknown> | null;
  is_system_message: boolean;
  created_at: Date;
  edited_at: Date | null;
  deleted_at: Date | null;
}

export type CreateMessageInput = Omit<Message, 'id' | 'created_at' | 'edited_at' | 'deleted_at' | 'is_system_message'> & { is_system_message?: boolean };
export type UpdateMessageInput = Partial<Pick<Message, 'message_text' | 'attachments'>>;

export class MessageModel {
  static tableName = 'messages';

  static async findById(id: string): Promise<Message | null> {
    return db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  static async findByConversationId(conversationId: string, options: { page?: number; limit?: number; before?: Date } = {}): Promise<{ messages: Message[]; total: number }> {
    const { page = 1, limit = 50, before } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .where({ conversation_id: conversationId })
      .whereNull('deleted_at');

    if (before) {
      query = query.where('created_at', '<', before);
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const messages = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { messages: messages.reverse(), total: parseInt(String(count), 10) };
  }

  static async create(input: CreateMessageInput): Promise<Message> {
    return db.transaction(async (trx) => {
      const [message] = await trx(this.tableName)
        .insert({
          ...input,
          is_system_message: input.is_system_message || false,
        })
        .returning('*');

      // Update conversation's updated_at
      await trx('conversations')
        .where({ id: input.conversation_id })
        .update({ updated_at: new Date() });

      return message;
    });
  }

  static async update(id: string, input: UpdateMessageInput): Promise<Message | null> {
    const [message] = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...input,
        edited_at: new Date(),
      })
      .returning('*');
    return message || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id })
      .update({ deleted_at: new Date() });
    return count > 0;
  }

  static async hardDelete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async getUnreadCount(conversationId: string, userId: string, lastReadAt: Date | null): Promise<number> {
    let query = db(this.tableName)
      .where({ conversation_id: conversationId })
      .whereNot({ sender_id: userId })
      .whereNull('deleted_at');

    if (lastReadAt) {
      query = query.where('created_at', '>', lastReadAt);
    }

    const result = await query.count('* as count').first();
    return parseInt(result?.count as string || '0', 10);
  }

  static async createSystemMessage(conversationId: string, text: string): Promise<Message> {
    const [message] = await db(this.tableName)
      .insert({
        conversation_id: conversationId,
        sender_id: db.raw('uuid_generate_v4()'), // System messages need a sender
        message_text: text,
        is_system_message: true,
      })
      .returning('*');
    return message;
  }

  static async getWithSender(id: string): Promise<Message | null> {
    return db(this.tableName)
      .select('messages.*')
      .select(db.raw(`
        json_build_object(
          'id', users.id,
          'first_name', users.first_name,
          'last_name', users.last_name,
          'profile_picture_url', users.profile_picture_url
        ) as sender
      `))
      .join('users', 'messages.sender_id', 'users.id')
      .where('messages.id', id)
      .whereNull('messages.deleted_at')
      .first();
  }
}
