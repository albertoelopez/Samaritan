import { User } from '../models/User';
import { Request, Response } from 'express';
import { JobService } from '../services/jobService';

import { asyncHandler } from '../middleware/errorHandler.middleware';
import { JobStatus, JobType, PaymentType } from '../models/Job';

export const createJob = asyncHandler(async (req: Request, res: Response) => {
  const job = await JobService.createJob((req.user as User).id, req.body);

  res.status(201).json({
    status: 'success',
    data: job,
  });
});

export const listJobs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const result = await JobService.searchJobs(
    {},
    {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    }
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const getJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await JobService.getJob(id!);

  res.json({
    status: 'success',
    data: job,
  });
});

export const updateJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await JobService.updateJob(id!, (req.user as User).id, req.body);

  res.json({
    status: 'success',
    data: job,
  });
});

export const publishJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await JobService.publishJob(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: job,
  });
});

export const cancelJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await JobService.cancelJob(id!, (req.user as User).id);

  res.json({
    status: 'success',
    data: job,
  });
});

export const deleteJob = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await JobService.deleteJob(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Job deleted successfully',
  });
});

export const searchJobs = asyncHandler(async (req: Request, res: Response) => {
  const {
    categoryId,
    jobType,
    paymentType,
    minBudget,
    maxBudget,
    isRemote,
    latitude,
    longitude,
    radiusKm,
    query,
    page,
    limit,
  } = req.query;

  const result = await JobService.searchJobs(
    {
      categoryId: categoryId as string,
      jobType: jobType as JobType,
      paymentType: paymentType as PaymentType,
      minBudget: minBudget ? parseFloat(minBudget as string) : undefined,
      maxBudget: maxBudget ? parseFloat(maxBudget as string) : undefined,
      isRemote: isRemote ? isRemote === 'true' : undefined,
      latitude: latitude ? parseFloat(latitude as string) : undefined,
      longitude: longitude ? parseFloat(longitude as string) : undefined,
      radiusKm: radiusKm ? parseFloat(radiusKm as string) : undefined,
      query: query as string,
    },
    {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    }
  );

  res.json({
    status: 'success',
    data: result,
  });
});

export const getMyJobs = asyncHandler(async (req: Request, res: Response) => {
  const { status, page, limit } = req.query;

  const result = await JobService.getContractorJobs((req.user as User).id, {
    status: status as JobStatus,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getNearbyJobs = asyncHandler(async (req: Request, res: Response) => {
  const { latitude, longitude, radiusKm = '50', page, limit } = req.query;

  const result = await JobService.findNearbyJobs(
    parseFloat(latitude as string),
    parseFloat(longitude as string),
    parseFloat(radiusKm as string),
    {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    }
  );

  res.json({
    status: 'success',
    data: result,
  });
});
