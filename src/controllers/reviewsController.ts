import { User } from '../models/User';
import { Request, Response } from 'express';
import { ReviewService } from '../services/reviewService';

import { asyncHandler } from '../middleware/errorHandler.middleware';

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { contractId, rating, reviewText, isRecommendation } = req.body;

  const review = await ReviewService.createReview(contractId!, (req.user as User).id, {
    rating,
    reviewText,
    isRecommendation,
  });

  res.status(201).json({
    status: 'success',
    data: review,
  });
});

export const getReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const review = await ReviewService.getReview(id!);

  res.json({
    status: 'success',
    data: review,
  });
});

export const updateReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, reviewText, isRecommendation } = req.body;

  const review = await ReviewService.updateReview(id!, (req.user as User).id, {
    rating,
    reviewText,
    isRecommendation,
  });

  res.json({
    status: 'success',
    data: review,
  });
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  await ReviewService.deleteReview(id!, (req.user as User).id);

  res.json({
    status: 'success',
    message: 'Review deleted',
  });
});

export const getContractReviews = asyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params;

  const reviews = await ReviewService.getContractReviews(contractId!);

  res.json({
    status: 'success',
    data: reviews,
  });
});

export const getUserReviews = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const result = await ReviewService.getUserReviews(userId, {
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getMyGivenReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query;

  const result = await ReviewService.getGivenReviews((req.user as User).id, {
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });

  res.json({
    status: 'success',
    data: result,
  });
});

export const getUserRatingSummary = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;

  const summary = await ReviewService.getUserRatingSummary(userId);

  res.json({
    status: 'success',
    data: summary,
  });
});
