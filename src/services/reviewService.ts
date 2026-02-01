import { ReviewModel, Review } from '../models/Review';
import { ContractModel } from '../models/Contract';
import { UserModel } from '../models/User';
import { WorkerProfileModel } from '../models/WorkerProfile';
import { ContractorProfileModel } from '../models/ContractorProfile';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../utils/errors';
import { NotificationService } from './notificationService';

export interface CreateReviewData {
  rating: number;
  reviewText?: string;
  isRecommendation?: boolean;
}

export class ReviewService {
  static async createReview(
    contractId: string,
    reviewerId: string,
    data: CreateReviewData
  ): Promise<Review> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    if (contract.status !== 'completed') {
      throw new BadRequestError('Can only review completed contracts');
    }

    // Determine reviewer and reviewee
    const workerProfile = await WorkerProfileModel.findByUserId(reviewerId);
    const contractorProfile = await ContractorProfileModel.findByUserId(reviewerId);

    let revieweeId: string;

    if (workerProfile?.id === contract.worker_id) {
      // Worker is reviewing contractor
      const contractor = await ContractorProfileModel.findById(contract.contractor_id);
      if (!contractor) {
        throw new NotFoundError('Contractor not found');
      }
      revieweeId = contractor.user_id;
    } else if (contractorProfile?.id === contract.contractor_id) {
      // Contractor is reviewing worker
      const worker = await WorkerProfileModel.findById(contract.worker_id);
      if (!worker) {
        throw new NotFoundError('Worker not found');
      }
      revieweeId = worker.user_id;
    } else {
      throw new ForbiddenError('Not authorized to review this contract');
    }

    // Check for existing review
    const existingReview = await ReviewModel.findByContractAndReviewer(contractId, reviewerId);
    if (existingReview) {
      throw new ConflictError('You have already reviewed this contract');
    }

    const review = await ReviewModel.create({
      contract_id: contractId,
      reviewer_id: reviewerId,
      reviewee_id: revieweeId,
      rating: data.rating,
      review_text: data.reviewText || null,
      is_recommendation: data.isRecommendation ?? true,
    });

    // Update reviewee's rating
    if (workerProfile?.id === contract.worker_id) {
      // Worker reviewed contractor
      await ContractorProfileModel.updateRating(contract.contractor_id, data.rating);
    } else {
      // Contractor reviewed worker
      await WorkerProfileModel.updateRating(contract.worker_id, data.rating);
    }

    // Notify reviewee
    await NotificationService.createNotification({
      userId: revieweeId,
      type: 'review_received',
      title: 'New Review',
      message: `You received a ${data.rating}-star review`,
      data: { reviewId: review.id, contractId, rating: data.rating },
    });

    return review;
  }

  static async getReview(id: string): Promise<Review> {
    const review = await ReviewModel.getWithDetails(id);
    if (!review) {
      throw new NotFoundError('Review not found');
    }
    return review;
  }

  static async updateReview(
    reviewId: string,
    userId: string,
    data: Partial<CreateReviewData>
  ): Promise<Review> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.reviewer_id !== userId) {
      throw new ForbiddenError('Can only edit your own reviews');
    }

    const updated = await ReviewModel.update(reviewId, {
      rating: data.rating,
      review_text: data.reviewText,
      is_recommendation: data.isRecommendation,
    });

    if (!updated) {
      throw new NotFoundError('Failed to update review');
    }

    return updated;
  }

  static async deleteReview(reviewId: string, userId: string): Promise<void> {
    const review = await ReviewModel.findById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    // Only reviewer or admin can delete
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (review.reviewer_id !== userId && user.role !== 'admin') {
      throw new ForbiddenError('Not authorized to delete this review');
    }

    await ReviewModel.delete(reviewId);
  }

  static async getContractReviews(contractId: string): Promise<Review[]> {
    return ReviewModel.findByContractId(contractId);
  }

  static async getUserReviews(
    userId: string,
    options: { page?: number; limit?: number }
  ): Promise<{ reviews: Review[]; total: number }> {
    return ReviewModel.findByRevieweeId(userId, options);
  }

  static async getGivenReviews(
    userId: string,
    options: { page?: number; limit?: number }
  ): Promise<{ reviews: Review[]; total: number }> {
    return ReviewModel.findByReviewerId(userId, options);
  }

  static async getUserRatingSummary(userId: string): Promise<{ average: number; count: number }> {
    return ReviewModel.getAverageRating(userId);
  }
}
