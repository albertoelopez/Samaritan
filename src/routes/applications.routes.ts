import { Router } from 'express';
import * as applicationsController from '../controllers/applicationsController';
import { authenticate } from '../middleware/auth.middleware';
import { requireWorker, requireContractor } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import { applyForJobValidator, jobIdValidator } from '../validators/job.validator';
import { param, body } from 'express-validator';

const router = Router();

router.use(authenticate);

// Worker routes
router.post('/jobs/:id/apply', requireWorker, validate(applyForJobValidator), applicationsController.applyForJob);
router.get('/my', requireWorker, applicationsController.getMyApplications);
router.post('/:id/withdraw', requireWorker, validate([param('id').isUUID()]), applicationsController.withdrawApplication);

// Contractor routes
router.get('/jobs/:jobId', requireContractor, validate([param('jobId').isUUID()]), applicationsController.getJobApplications);
router.put('/:id/status', requireContractor, validate([
  param('id').isUUID(),
  body('status').isIn(['shortlisted', 'accepted', 'rejected']),
  body('notes').optional().isString(),
]), applicationsController.updateApplicationStatus);

// Both can view individual application
router.get('/:id', validate([param('id').isUUID()]), applicationsController.getApplication);

export default router;
