import { Router } from 'express';
import * as reviewsController from '../controllers/reviewsController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { param, body, query } from 'express-validator';

const router = Router();

// Public routes
router.get('/user/:userId', validate([
  param('userId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]), reviewsController.getUserReviews);

router.get('/user/:userId/summary', validate([
  param('userId').isUUID(),
]), reviewsController.getUserRatingSummary);

router.get('/contract/:contractId', validate([
  param('contractId').isUUID(),
]), reviewsController.getContractReviews);

router.get('/:id', validate([
  param('id').isUUID(),
]), reviewsController.getReview);

// Protected routes
router.use(authenticate);

router.post('/', validate([
  body('contractId').isUUID(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('reviewText').optional().trim().isLength({ max: 5000 }),
  body('isRecommendation').optional().isBoolean(),
]), reviewsController.createReview);

router.put('/:id', validate([
  param('id').isUUID(),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('reviewText').optional().trim().isLength({ max: 5000 }),
  body('isRecommendation').optional().isBoolean(),
]), reviewsController.updateReview);

router.delete('/:id', validate([
  param('id').isUUID(),
]), reviewsController.deleteReview);

router.get('/my/given', reviewsController.getMyGivenReviews);

export default router;
