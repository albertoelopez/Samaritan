import { Router } from 'express';
import * as notificationsController from '../controllers/notificationsController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { param, query } from 'express-validator';

const router = Router();

router.use(authenticate);

router.get('/', validate([
  query('unreadOnly').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]), notificationsController.getNotifications);

router.get('/unread-count', notificationsController.getUnreadCount);

router.post('/read-all', notificationsController.markAllAsRead);

router.delete('/read', notificationsController.deleteAllRead);

router.post('/:id/read', validate([
  param('id').isUUID(),
]), notificationsController.markAsRead);

router.delete('/:id', validate([
  param('id').isUUID(),
]), notificationsController.deleteNotification);

export default router;
