import { User } from '../models/User';
import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';

import { asyncHandler } from '../middleware/errorHandler.middleware';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { unreadOnly, page, limit } = req.query;

  const result = await NotificationService.getNotifications((req.user as User).id, {
    unreadOnly: unreadOnly === 'true',
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await NotificationService.getUnreadCount((req.user as User).id);

  res.json({
    status: 'success',
    data: { count },
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const notification = await NotificationService.markAsRead(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: notification,
  });
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const count = await NotificationService.markAllAsRead((req.user as User).id);

  res.json({
    status: 'success',
    data: { updated: count },
  });
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await NotificationService.deleteNotification(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Notification deleted',
  });
});

export const deleteAllRead = asyncHandler(async (req: Request, res: Response) => {
  const count = await NotificationService.deleteAllRead((req.user as User).id);

  res.json({
    status: 'success',
    data: { deleted: count },
  });
});
