import { NotificationModel, Notification, NotificationType } from '../models/Notification';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  static async createNotification(input: CreateNotificationData): Promise<Notification> {
    return NotificationModel.create({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message || null,
      data: input.data || null,
    });
  }

  static async createBulkNotifications(inputs: CreateNotificationData[]): Promise<Notification[]> {
    return NotificationModel.createMany(
      inputs.map((input) => ({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message || null,
        data: input.data || null,
      }))
    );
  }

  static async getNotifications(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean }
  ): Promise<{ notifications: Notification[]; total: number }> {
    return NotificationModel.findByUserId(userId, options);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.getUnreadCount(userId);
  }

  static async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenError('Not authorized to access this notification');
    }

    const updated = await NotificationModel.markAsRead(notificationId);
    if (!updated) {
      throw new NotFoundError('Failed to update notification');
    }

    return updated;
  }

  static async markAllAsRead(userId: string): Promise<number> {
    return NotificationModel.markAllAsRead(userId);
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await NotificationModel.findById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenError('Not authorized to delete this notification');
    }

    await NotificationModel.delete(notificationId);
  }

  static async deleteAllRead(userId: string): Promise<number> {
    return NotificationModel.deleteAllRead(userId);
  }

  // Cleanup old notifications (can be run as a cron job)
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    return NotificationModel.deleteOld(daysOld);
  }
}
