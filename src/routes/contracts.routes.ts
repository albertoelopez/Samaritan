import { Router } from 'express';
import * as contractsController from '../controllers/contractsController';
import { authenticate } from '../middleware/auth.middleware';
import { requireContractor, requireWorker, requireWorkerOrContractor } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { param, body } from 'express-validator';

const router = Router();

router.use(authenticate);

// Create contract (contractor only)
router.post('/', requireContractor, validate([
  body('jobId').isUUID(),
  body('workerId').isUUID(),
  body('applicationId').optional().isUUID(),
  body('agreedRate').optional().isFloat({ min: 0 }),
  body('paymentType').isIn(['hourly', 'fixed', 'milestone']),
  body('totalAmount').optional().isFloat({ min: 0 }),
  body('startDate').isISO8601().toDate(),
  body('endDate').optional().isISO8601().toDate(),
  body('termsAndConditions').optional().isString(),
  body('milestones').optional().isArray(),
]), contractsController.createContract);

// Get contracts
router.get('/my/as-contractor', requireContractor, contractsController.getMyContractsAsContractor);
router.get('/my/as-worker', requireWorker, contractsController.getMyContractsAsWorker);
router.get('/:id', validate([param('id').isUUID()]), contractsController.getContract);

// Contract actions
router.post('/:id/sign', requireWorkerOrContractor, validate([param('id').isUUID()]), contractsController.signContract);
router.post('/:id/complete', requireContractor, validate([param('id').isUUID()]), contractsController.completeContract);
router.post('/:id/terminate', requireWorkerOrContractor, validate([param('id').isUUID()]), contractsController.terminateContract);

export default router;
