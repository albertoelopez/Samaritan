import { db } from '../config/database';

export interface ContractorProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  company_description: string | null;
  company_size: string | null;
  industry: string | null;
  location: unknown;
  website_url: string | null;
  tax_id: string | null;
  rating_average: number;
  rating_count: number;
  posted_jobs_count: number;
  hired_workers_count: number;
  verification_status: string;
  verification_documents: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateContractorProfileInput = Omit<ContractorProfile, 'id' | 'created_at' | 'updated_at' | 'rating_average' | 'rating_count' | 'posted_jobs_count' | 'hired_workers_count'>;
export type UpdateContractorProfileInput = Partial<Omit<ContractorProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export class ContractorProfileModel {
  static tableName = 'contractor_profiles';

  static async findById(id: string): Promise<ContractorProfile | null> {
    return db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ id })
      .first();
  }

  static async findByUserId(userId: string): Promise<ContractorProfile | null> {
    return db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ user_id: userId })
      .first();
  }

  static async create(input: CreateContractorProfileInput): Promise<ContractorProfile> {
    const [profile] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return profile;
  }

  static async createWithLocation(
    input: Omit<CreateContractorProfileInput, 'location'>,
    latitude: number,
    longitude: number
  ): Promise<ContractorProfile> {
    const [profile] = await db(this.tableName)
      .insert({
        ...input,
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude]),
      })
      .returning('*');
    return profile;
  }

  static async update(id: string, input: UpdateContractorProfileInput): Promise<ContractorProfile | null> {
    const [profile] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return profile || null;
  }

  static async updateLocation(id: string, latitude: number, longitude: number): Promise<ContractorProfile | null> {
    const [profile] = await db(this.tableName)
      .where({ id })
      .update({
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude]),
      })
      .returning('*');
    return profile || null;
  }

  static async updateRating(id: string, rating: number): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .update({
        rating_average: db.raw(`(rating_average * rating_count + ?) / (rating_count + 1)`, [rating]),
        rating_count: db.raw('rating_count + 1'),
      });
  }

  static async incrementPostedJobs(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .increment('posted_jobs_count', 1);
  }

  static async incrementHiredWorkers(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .increment('hired_workers_count', 1);
  }

  static async findAll(options: { page?: number; limit?: number; verified?: boolean } = {}): Promise<{ contractors: ContractorProfile[]; total: number }> {
    const { page = 1, limit = 20, verified } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'));

    if (verified !== undefined) {
      query = query.where({ verification_status: verified ? 'verified' : 'pending' });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const contractors = await query
      .orderBy('rating_average', 'desc')
      .limit(limit)
      .offset(offset);

    return { contractors, total: parseInt(String(count), 10) };
  }
}
