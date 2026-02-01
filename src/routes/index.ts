import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import jobsRoutes from './jobs.routes';
import applicationsRoutes from './applications.routes';
import contractsRoutes from './contracts.routes';
import messagesRoutes from './messages.routes';
import notificationsRoutes from './notifications.routes';
import paymentsRoutes from './payments.routes';
import reviewsRoutes from './reviews.routes';
import documentsRoutes from './documents.routes';
import { CategoryModel } from '../models/Category';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Categories (public)
router.get('/categories', async (_req, res) => {
  const categories = await CategoryModel.getWithSubcategories();
  res.json({
    status: 'success',
    data: categories,
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/jobs', jobsRoutes);
router.use('/applications', applicationsRoutes);
router.use('/contracts', contractsRoutes);
router.use('/messages', messagesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/documents', documentsRoutes);

export default router;
