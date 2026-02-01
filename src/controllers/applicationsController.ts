import { User } from '../models/User';
import { Request, Response } from 'express';
import { ApplicationService } from '../services/applicationService';

import { asyncHandler } from '../middleware/errorHandler.middleware';
import { ApplicationStatus } from '../models/JobApplication';

export const applyForJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { proposedRate, coverLetter, estimatedCompletionTime, attachments } = req.body;

  const application = await ApplicationService.apply((req.user as User).id, id, {
    proposedRate,
    coverLetter,
    estimatedCompletionTime,
    attachments,
  });

  res.status(201).json({
    status: 'success',
    data: application,
  });
});

export const getApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await ApplicationService.getApplication(id!);

  res.json({
    status: 'success',
    data: application,
  });
});

export const updateApplicationStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const application = await ApplicationService.updateApplicationStatus(
    id,
    (req.user as User).id,
    status,
    notes
  );

  res.json({
    status: 'success',
    data: application,
  });
});

export const withdrawApplication = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const application = await ApplicationService.withdrawApplication(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: application,
  });
});

export const getJobApplications = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { status, page, limit } = req.query;

  const result = await ApplicationService.getJobApplications(jobId!, (req.user as User).id, {
    status: status as ApplicationStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getMyApplications = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;

  const result = await ApplicationService.getWorkerApplications((req.user as User).id, {
    status: status as ApplicationStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});
