import { Router } from 'express';
import * as usersController from '../controllers/usersController';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin, requireWorker, requireContractor, requireWorkerOrContractor } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  userIdValidator,
  updateUserValidator,
  updateWorkerProfileValidator,
  updateContractorProfileValidator,
  updateLocationValidator,
  searchWorkersValidator,
  listUsersValidator,
} from '../validators/user.validator';

const router = Router();

router.use(authenticate);

// User profile
router.get('/me', (req, res) => res.redirect('/api/v1/auth/me'));
router.put('/me', validate(updateUserValidator), usersController.updateUser);
router.put('/me/location', validate(updateLocationValidator), usersController.updateLocation);

// Worker profile
router.put('/me/worker-profile', requireWorker, validate(updateWorkerProfileValidator), usersController.updateWorkerProfile);

// Contractor profile
router.put('/me/contractor-profile', requireContractor, validate(updateContractorProfileValidator), usersController.updateContractorProfile);

// Search workers
router.get('/workers/search', validate(searchWorkersValidator), usersController.searchWorkers);

// Get user by ID
router.get('/:id', validate(userIdValidator), usersController.getUser);

// Delete user (self or admin)
router.delete('/:id', validate(userIdValidator), usersController.deleteUser);

// Admin routes
router.get('/', requireAdmin, validate(listUsersValidator), usersController.listUsers);
router.post('/:id/suspend', requireAdmin, validate(userIdValidator), usersController.suspendUser);
router.post('/:id/activate', requireAdmin, validate(userIdValidator), usersController.activateUser);

export default router;
