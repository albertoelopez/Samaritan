import { db } from '../config/database';

export interface Conversation {
  id: string;
  job_id: string | null;
  contract_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  last_read_at: Date | null;
  is_archived: boolean;
}

export type CreateConversationInput = Omit<Conversation, 'id' | 'created_at' | 'updated_at'>;

export class ConversationModel {
  static tableName = 'conversations';
  static participantsTable = 'conversation_participants';

  static async findById(id: string): Promise<Conversation | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByUserId(userId: string, options: { page?: number; limit?: number; includeArchived?: boolean } = {}): Promise<{ conversations: Conversation[]; total: number }> {
    const { page = 1, limit = 20, includeArchived } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('conversations.*')
      .select(db.raw(`
        (SELECT json_build_object(
          'id', m.id,
          'message_text', m.message_text,
          'sender_id', m.sender_id,
          'created_at', m.created_at
        ) FROM messages m WHERE m.conversation_id = conversations.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      `))
      .select(db.raw(`
        (SELECT COUNT(*) FROM messages m
         WHERE m.conversation_id = conversations.id
         AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
         AND m.sender_id != ?) as unread_count
      `, [userId]))
      .join(`${this.participantsTable} as cp`, 'conversations.id', 'cp.conversation_id')
      .where('cp.user_id', userId);

    if (!includeArchived) {
      query = query.where('cp.is_archived', false);
    }

    const countQuery = query.clone();
    const countResult = await countQuery.clearSelect().count("* as count").first();
    const count = countResult?.count ?? 0;

    const conversations = await query
      .orderBy('conversations.updated_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { conversations, total: parseInt(String(count), 10) };
  }

  static async findBetweenUsers(userIds: string[]): Promise<Conversation | null> {
    const result = await db(this.tableName)
      .select('conversations.*')
      .join(`${this.participantsTable} as cp`, 'conversations.id', 'cp.conversation_id')
      .whereIn('cp.user_id', userIds)
      .groupBy('conversations.id')
      .havingRaw('COUNT(DISTINCT cp.user_id) = ?', [userIds.length])
      .first();

    return result || null;
  }

  static async create(input: CreateConversationInput, participantIds: string[]): Promise<Conversation> {
    return db.transaction(async (trx) => {
      const [conversation] = await trx(this.tableName)
        .insert(input)
        .returning('*');

      await trx(this.participantsTable).insert(
        participantIds.map((userId) => ({
          conversation_id: conversation.id,
          user_id: userId,
        }))
      );

      return conversation;
    });
  }

  static async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    return db(this.participantsTable).where({ conversation_id: conversationId });
  }

  static async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const participant = await db(this.participantsTable)
      .where({ conversation_id: conversationId, user_id: userId })
      .first();
    return !!participant;
  }

  static async updateLastRead(conversationId: string, userId: string): Promise<void> {
    await db(this.participantsTable)
      .where({ conversation_id: conversationId, user_id: userId })
      .update({ last_read_at: new Date() });
  }

  static async archive(conversationId: string, userId: string): Promise<void> {
    await db(this.participantsTable)
      .where({ conversation_id: conversationId, user_id: userId })
      .update({ is_archived: true });
  }

  static async unarchive(conversationId: string, userId: string): Promise<void> {
    await db(this.participantsTable)
      .where({ conversation_id: conversationId, user_id: userId })
      .update({ is_archived: false });
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async getWithParticipants(id: string): Promise<(Conversation & { participants?: unknown[] }) | null> {
    const conversation = await db(this.tableName)
      .select('conversations.*')
      .select(db.raw(`
        (SELECT json_agg(json_build_object(
          'user_id', cp.user_id,
          'last_read_at', cp.last_read_at,
          'is_archived', cp.is_archived,
          'user', json_build_object(
            'id', u.id,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'profile_picture_url', u.profile_picture_url
          )
        )) FROM conversation_participants cp
        JOIN users u ON cp.user_id = u.id
        WHERE cp.conversation_id = conversations.id) as participants
      `))
      .where('conversations.id', id)
      .first();

    return conversation || null;
  }
}
