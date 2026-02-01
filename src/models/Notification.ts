import { db } from '../config/database';

export type NotificationType =
  | 'new_job_match'
  | 'application_received'
  | 'application_status_changed'
  | 'contract_offered'
  | 'contract_signed'
  | 'payment_received'
  | 'review_received'
  | 'message_received'
  | 'system_announcement';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

export type CreateNotificationInput = Omit<Notification, 'id' | 'created_at' | 'is_read' | 'read_at'>;
export type UpdateNotificationInput = Partial<Omit<Notification, 'id' | 'user_id' | 'created_at'>>;

export class NotificationModel {
  static tableName = 'notifications';

  static async findById(id: string): Promise<Notification | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByUserId(userId: string, options: { page?: number; limit?: number; unreadOnly?: boolean } = {}): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, limit = 20, unreadOnly } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ user_id: userId });

    if (unreadOnly) {
      query = query.where({ is_read: false });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { notifications, total: parseInt(String(count), 10) };
  }

  static async create(input: CreateNotificationInput): Promise<Notification> {
    const [notification] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return notification;
  }

  static async createMany(inputs: CreateNotificationInput[]): Promise<Notification[]> {
    return db(this.tableName)
      .insert(inputs)
      .returning('*');
  }

  static async markAsRead(id: string): Promise<Notification | null> {
    const [notification] = await db(this.tableName)
      .where({ id })
      .update({
        is_read: true,
        read_at: new Date(),
      })
      .returning('*');
    return notification || null;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    return db(this.tableName)
      .where({ user_id: userId, is_read: false })
      .update({
        is_read: true,
        read_at: new Date(),
      });
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async deleteAllRead(userId: string): Promise<number> {
    return db(this.tableName)
      .where({ user_id: userId, is_read: true })
      .del();
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const result = await db(this.tableName)
      .where({ user_id: userId, is_read: false })
      .count('* as count')
      .first();
    return parseInt(result?.count as string || '0', 10);
  }

  static async deleteOld(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return db(this.tableName)
      .where('created_at', '<', cutoffDate)
      .where({ is_read: true })
      .del();
  }
}
