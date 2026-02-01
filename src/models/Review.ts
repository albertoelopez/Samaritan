import { db } from '../config/database';

export interface Review {
  id: string;
  contract_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text: string | null;
  is_recommendation: boolean;
  created_at: Date;
  updated_at: Date;
}

export type CreateReviewInput = Omit<Review, 'id' | 'created_at' | 'updated_at'>;
export type UpdateReviewInput = Partial<Omit<Review, 'id' | 'contract_id' | 'reviewer_id' | 'reviewee_id' | 'created_at' | 'updated_at'>>;

export class ReviewModel {
  static tableName = 'reviews';

  static async findById(id: string): Promise<Review | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByContractId(contractId: string): Promise<Review[]> {
    return db(this.tableName).where({ contract_id: contractId });
  }

  static async findByRevieweeId(revieweeId: string, options: { page?: number; limit?: number } = {}): Promise<{ reviews: Review[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const query = db(this.tableName).where({ reviewee_id: revieweeId });

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const reviews = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { reviews, total: parseInt(String(count), 10) };
  }

  static async findByReviewerId(reviewerId: string, options: { page?: number; limit?: number } = {}): Promise<{ reviews: Review[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const query = db(this.tableName).where({ reviewer_id: reviewerId });

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const reviews = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { reviews, total: parseInt(String(count), 10) };
  }

  static async findByContractAndReviewer(contractId: string, reviewerId: string): Promise<Review | null> {
    return db(this.tableName)
      .where({ contract_id: contractId, reviewer_id: reviewerId })
      .first();
  }

  static async create(input: CreateReviewInput): Promise<Review> {
    const [review] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return review;
  }

  static async update(id: string, input: UpdateReviewInput): Promise<Review | null> {
    const [review] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return review || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async getAverageRating(userId: string): Promise<{ average: number; count: number }> {
    const result = await db(this.tableName)
      .where({ reviewee_id: userId })
      .select(db.raw('AVG(rating) as average, COUNT(*) as count'))
      .first() as unknown as { average: string | null; count: string } | undefined;

    return {
      average: parseFloat(result?.average || '0'),
      count: parseInt(result?.count || '0', 10),
    };
  }

  static async getWithDetails(id: string): Promise<Review | null> {
    return db(this.tableName)
      .select('reviews.*')
      .select(db.raw(`
        json_build_object(
          'id', reviewer.id,
          'first_name', reviewer.first_name,
          'last_name', reviewer.last_name,
          'profile_picture_url', reviewer.profile_picture_url
        ) as reviewer
      `))
      .select(db.raw(`
        json_build_object(
          'id', reviewee.id,
          'first_name', reviewee.first_name,
          'last_name', reviewee.last_name,
          'profile_picture_url', reviewee.profile_picture_url
        ) as reviewee
      `))
      .join('users as reviewer', 'reviews.reviewer_id', 'reviewer.id')
      .join('users as reviewee', 'reviews.reviewee_id', 'reviewee.id')
      .where('reviews.id', id)
      .first();
  }
}
