import { User } from '../models/User';
import { Request, Response } from 'express';
import { MessageService } from '../services/messageService';

import { asyncHandler } from '../middleware/errorHandler.middleware';

export const getOrCreateConversation = asyncHandler(async (req: Request, res: Response) => {
  const { participantId, jobId, contractId } = req.body;

  const conversation = await MessageService.getOrCreateConversation(
    (req.user as User).id,
    participantId,
    jobId,
    contractId
  );

  res.json({
    status: 'success',
    data: conversation,
  });
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const conversation = await MessageService.getConversation(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: conversation,
  });
});

export const getMyConversations = asyncHandler(async (req: Request, res: Response) => {
  const { includeArchived, page, limit } = req.query;

  const result = await MessageService.getUserConversations((req.user as User).id, {
    includeArchived: includeArchived === 'true',
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { messageText, attachments } = req.body;

  const message = await MessageService.sendMessage(id!, (req.user as User).id, {
    messageText,
    attachments,
  });

  res.status(201).json({
    status: 'success',
    data: message,
  });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { before, page, limit } = req.query;

  const result = await MessageService.getMessages(id!, (req.user as User).id, {
    before: before ? new Date(before as string) : undefined,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const editMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { messageText } = req.body;

  const message = await MessageService.editMessage(id!, (req.user as User).id, messageText);

  res.json({
    status: 'success',
    data: message,
  });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await MessageService.deleteMessage(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Message deleted',
  });
});

export const archiveConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await MessageService.archiveConversation(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Conversation archived',
  });
});

export const unarchiveConversation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await MessageService.unarchiveConversation(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Conversation unarchived',
  });
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await MessageService.markAsRead(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Conversation marked as read',
  });
});
