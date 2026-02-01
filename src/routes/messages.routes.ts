import { Router } from 'express';
import * as messagesController from '../controllers/messagesController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { param, body, query } from 'express-validator';

const router = Router();

router.use(authenticate);

// Conversations
router.post('/conversations', validate([
  body('participantId').isUUID(),
  body('jobId').optional().isUUID(),
  body('contractId').optional().isUUID(),
]), messagesController.getOrCreateConversation);

router.get('/conversations', validate([
  query('includeArchived').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]), messagesController.getMyConversations);

router.get('/conversations/:id', validate([
  param('id').isUUID(),
]), messagesController.getConversation);

router.post('/conversations/:id/archive', validate([
  param('id').isUUID(),
]), messagesController.archiveConversation);

router.post('/conversations/:id/unarchive', validate([
  param('id').isUUID(),
]), messagesController.unarchiveConversation);

router.post('/conversations/:id/read', validate([
  param('id').isUUID(),
]), messagesController.markAsRead);

// Messages
router.post('/conversations/:id/messages', validate([
  param('id').isUUID(),
  body('messageText').trim().notEmpty().isLength({ max: 5000 }),
  body('attachments').optional().isObject(),
]), messagesController.sendMessage);

router.get('/conversations/:id/messages', validate([
  param('id').isUUID(),
  query('before').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]), messagesController.getMessages);

router.put('/messages/:id', validate([
  param('id').isUUID(),
  body('messageText').trim().notEmpty().isLength({ max: 5000 }),
]), messagesController.editMessage);

router.delete('/messages/:id', validate([
  param('id').isUUID(),
]), messagesController.deleteMessage);

export default router;
