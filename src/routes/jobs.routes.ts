import { Router } from 'express';
import * as jobsController from '../controllers/jobsController';
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
import { requireContractor, requireWorker } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createJobValidator,
  updateJobValidator,
  jobIdValidator,
  searchJobsValidator,
} from '../validators/job.validator';

const router = Router();

// Public routes (with optional auth for personalization)
router.get('/', optionalAuth, jobsController.listJobs);
router.get('/search', optionalAuth, validate(searchJobsValidator), jobsController.searchJobs);
router.get('/nearby', optionalAuth, validate(searchJobsValidator), jobsController.getNearbyJobs);
router.get('/:id', optionalAuth, validate(jobIdValidator), jobsController.getJob);

// Protected routes
router.use(authenticate);

// Contractor routes
router.post('/', requireContractor, validate(createJobValidator), jobsController.createJob);
router.get('/my/posted', requireContractor, jobsController.getMyJobs);
router.put('/:id', requireContractor, validate(updateJobValidator), jobsController.updateJob);
router.post('/:id/publish', requireContractor, validate(jobIdValidator), jobsController.publishJob);
router.post('/:id/cancel', requireContractor, validate(jobIdValidator), jobsController.cancelJob);
router.delete('/:id', requireContractor, validate(jobIdValidator), jobsController.deleteJob);

export default router;
