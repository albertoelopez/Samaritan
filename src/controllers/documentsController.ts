import { User } from '../models/User';
import { Request, Response } from 'express';
import { DocumentService } from '../services/documentService';
import { UserService } from '../services/userService';

import { asyncHandler } from '../middleware/errorHandler.middleware';
import { BadRequestError } from '../utils/errors';

export const uploadProfilePicture = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const result = await DocumentService.uploadProfilePicture(
    (req.user as User).id,
    req.file.buffer,
    req.file.mimetype
  );

  // Update user profile with new picture URL
  await UserService.updateUser((req.user as User).id, { profile_picture_url: result.url });

  res.json({
    status: 'success',
    data: result,
  });
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const { documentType } = req.body;
  if (!documentType) {
    throw new BadRequestError('Document type is required');
  }

  const result = await DocumentService.uploadDocument(
    (req.user as User).id,
    documentType,
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const uploadJobAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const { jobId } = req.params;

  const result = await DocumentService.uploadJobAttachment(
    jobId,
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const uploadMessageAttachment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new BadRequestError('No file uploaded');
  }

  const { conversationId } = req.params;

  const result = await DocumentService.uploadMessageAttachment(
    conversationId,
    req.file.buffer,
    req.file.mimetype,
    req.file.originalname
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const getSignedUrl = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.query;

  if (!key) {
    throw new BadRequestError('File key is required');
  }

  const url = await DocumentService.getSignedUrl(key as string);

  res.json({
    status: 'success',
    data: { url },
  });
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const { key } = req.params;

  await DocumentService.deleteFile(key);

  res.json({
    status: 'success',
    message: 'File deleted',
  });
});
