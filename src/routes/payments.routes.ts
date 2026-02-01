import { Router } from 'express';
import * as paymentsController from '../controllers/paymentsController';
import { authenticate } from '../middleware/auth.middleware';
import { requireContractor, requireAdmin } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { param, body, query } from 'express-validator';

const router = Router();

router.use(authenticate);

// Payment methods
router.post('/methods', validate([
  body('type').isIn(['credit_card', 'debit_card', 'bank_account', 'paypal', 'stripe']),
  body('stripePaymentMethodId').notEmpty(),
]), paymentsController.addPaymentMethod);

router.get('/methods', paymentsController.getPaymentMethods);

router.delete('/methods/:id', validate([
  param('id').isUUID(),
]), paymentsController.removePaymentMethod);

router.post('/methods/:id/default', validate([
  param('id').isUUID(),
]), paymentsController.setDefaultPaymentMethod);

// Process payment (contractor only)
router.post('/pay', requireContractor, validate([
  body('contractId').isUUID(),
  body('amount').isFloat({ min: 0.01 }),
  body('milestoneId').optional().isUUID(),
]), paymentsController.processPayment);

// Transaction history
router.get('/transactions', validate([
  query('type').optional().isIn(['payment', 'refund', 'withdrawal', 'fee', 'adjustment']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]), paymentsController.getTransactionHistory);

router.get('/transactions/contract/:contractId', validate([
  param('contractId').isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
]), paymentsController.getContractTransactions);

// Refund (admin only)
router.post('/refund/:transactionId', requireAdmin, validate([
  param('transactionId').isUUID(),
]), paymentsController.processRefund);

export default router;
