import { Router } from 'express';
import * as documentsController from '../controllers/documentsController';
import { authenticate } from '../middleware/auth.middleware';
import { uploadImage, uploadDocument, uploadFile, handleMulterError } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';
import { validate } from '../middleware/validation.middleware';
import { param, query, body } from 'express-validator';

const router = Router();

router.use(authenticate);
router.use(uploadLimiter);

// Profile picture
router.post(
  '/profile-picture',
  uploadImage.single('file'),
  handleMulterError,
  documentsController.uploadProfilePicture
);

// Documents (verification, etc.)
router.post(
  '/documents',
  uploadDocument.single('file'),
  handleMulterError,
  validate([
    body('documentType').isIn(['id', 'license', 'insurance', 'certification', 'tax', 'other']),
  ]),
  documentsController.uploadDocument
);

// Job attachments
router.post(
  '/jobs/:jobId/attachments',
  validate([param('jobId').isUUID()]),
  uploadFile.single('file'),
  handleMulterError,
  documentsController.uploadJobAttachment
);

// Message attachments
router.post(
  '/conversations/:conversationId/attachments',
  validate([param('conversationId').isUUID()]),
  uploadFile.single('file'),
  handleMulterError,
  documentsController.uploadMessageAttachment
);

// Get signed URL for a file
router.get(
  '/signed-url',
  validate([query('key').notEmpty()]),
  documentsController.getSignedUrl
);

// Delete file
router.delete(
  '/:key',
  validate([param('key').notEmpty()]),
  documentsController.deleteFile
);

export default router;
