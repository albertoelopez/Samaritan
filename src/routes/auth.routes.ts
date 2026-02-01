import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter.middleware';
import {
  registerValidator,
  loginValidator,
  refreshTokenValidator,
  passwordResetRequestValidator,
  passwordResetValidator,
  verifyEmailValidator,
  verifyTOTPValidator,
} from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/register', authLimiter, validate(registerValidator), authController.register);
router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.post('/refresh', validate(refreshTokenValidator), authController.refreshToken);
router.post('/password/reset-request', passwordResetLimiter, validate(passwordResetRequestValidator), authController.requestPasswordReset);
router.post('/password/reset/:token', passwordResetLimiter, validate(passwordResetValidator), authController.resetPassword);

// Protected routes
router.use(authenticate);
router.get('/me', authController.getCurrentUser);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.post('/email/verify-request', authController.requestEmailVerification);
router.post('/email/verify', validate(verifyEmailValidator), authController.verifyEmail);
router.post('/totp/setup', authController.setupTOTP);
router.post('/totp/verify', validate(verifyTOTPValidator), authController.verifyTOTP);

export default router;
