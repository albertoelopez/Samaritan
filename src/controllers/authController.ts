import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler.middleware';
import { User } from '../models/User';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phoneNumber, role, latitude, longitude } = req.body;

  const result = await AuthService.register({
    email,
    password,
    firstName,
    lastName,
    phoneNumber,
    role,
    latitude,
    longitude,
  });

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  res.json({
    status: 'success',
    data: result,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokens = await AuthService.refreshTokens(refreshToken);

  res.json({
    status: 'success',
    data: tokens,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const user = req.user as User;

  await AuthService.logout(user.id, refreshToken);

  res.json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const logoutAll = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  await AuthService.logoutAll(user.id);

  res.json({
    status: 'success',
    message: 'Logged out from all devices',
  });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.requestPasswordReset(email);

  res.json({
    status: 'success',
    message: 'If the email exists, a reset link will be sent',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const token = req.params.token;
  const { password } = req.body;

  await AuthService.resetPassword(token!, password);

  res.json({
    status: 'success',
    message: 'Password reset successfully',
  });
});

export const requestEmailVerification = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const code = await AuthService.generateEmailVerificationCode(user.id);

  // TODO: Send email with code
  res.json({
    status: 'success',
    message: 'Verification code sent',
    // Remove in production
    code,
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const user = req.user as User;

  await AuthService.verifyEmail(user.id, code);

  res.json({
    status: 'success',
    message: 'Email verified successfully',
  });
});

export const setupTOTP = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as User;
  const result = await AuthService.setupTOTP(user.id);

  res.json({
    status: 'success',
    data: result,
  });
});

export const verifyTOTP = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  const user = req.user as User;

  await AuthService.verifyAndEnableTOTP(user.id, token);

  res.json({
    status: 'success',
    message: 'TOTP enabled successfully',
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: req.user,
  });
});
