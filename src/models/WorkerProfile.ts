import { db } from '../config/database';

export interface WorkerProfile {
  id: string;
  user_id: string;
  bio: string | null;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  years_of_experience: number;
  available_for_work: boolean;
  location: unknown; // PostGIS geography type
  service_radius_km: number;
  rating_average: number;
  rating_count: number;
  completed_jobs_count: number;
  response_time_hours: number | null;
  verification_status: string;
  verification_documents: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
}

export type CreateWorkerProfileInput = Omit<WorkerProfile, 'id' | 'created_at' | 'updated_at' | 'rating_average' | 'rating_count' | 'completed_jobs_count'>;
export type UpdateWorkerProfileInput = Partial<Omit<WorkerProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export class WorkerProfileModel {
  static tableName = 'worker_profiles';

  static async findById(id: string): Promise<WorkerProfile | null> {
    return db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ id })
      .first();
  }

  static async findByUserId(userId: string): Promise<WorkerProfile | null> {
    return db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ user_id: userId })
      .first();
  }

  static async create(input: CreateWorkerProfileInput): Promise<WorkerProfile> {
    const [profile] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return profile;
  }

  static async createWithLocation(
    input: Omit<CreateWorkerProfileInput, 'location'>,
    latitude: number,
    longitude: number
  ): Promise<WorkerProfile> {
    const [profile] = await db(this.tableName)
      .insert({
        ...input,
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude]),
      })
      .returning('*');
    return profile;
  }

  static async update(id: string, input: UpdateWorkerProfileInput): Promise<WorkerProfile | null> {
    const [profile] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return profile || null;
  }

  static async updateLocation(id: string, latitude: number, longitude: number): Promise<WorkerProfile | null> {
    const [profile] = await db(this.tableName)
      .where({ id })
      .update({
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude]),
      })
      .returning('*');
    return profile || null;
  }

  static async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    options: { page?: number; limit?: number; available?: boolean; categoryId?: string } = {}
  ): Promise<{ workers: WorkerProfile[]; total: number }> {
    const { page = 1, limit = 20, available, categoryId } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('worker_profiles.*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .select(db.raw(`ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000 as distance_km`, [longitude, latitude]))
      .whereRaw('ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)', [longitude, latitude, radiusKm * 1000]);

    if (available !== undefined) {
      query = query.where({ available_for_work: available });
    }

    if (categoryId) {
      query = query
        .join('worker_skills', 'worker_profiles.id', 'worker_skills.worker_id')
        .where('worker_skills.category_id', categoryId);
    }

    const countQuery = query.clone();
    const countResult = await countQuery.clearSelect().count("* as count").first();
    const count = countResult?.count ?? 0;

    const workers = await query
      .orderByRaw('distance_km ASC')
      .limit(limit)
      .offset(offset);

    return { workers, total: parseInt(String(count), 10) };
  }

  static async updateRating(id: string, rating: number): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .update({
        rating_average: db.raw(`(rating_average * rating_count + ?) / (rating_count + 1)`, [rating]),
        rating_count: db.raw('rating_count + 1'),
      });
  }

  static async incrementCompletedJobs(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .increment('completed_jobs_count', 1);
  }

  static async search(query: string, options: { page?: number; limit?: number } = {}): Promise<{ workers: WorkerProfile[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const baseQuery = db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .whereRaw("to_tsvector('english', COALESCE(bio, '')) @@ plainto_tsquery('english', ?)", [query]);

    const countResult = await baseQuery.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const workers = await baseQuery
      .orderBy('rating_average', 'desc')
      .limit(limit)
      .offset(offset);

    return { workers, total: parseInt(String(count), 10) };
  }
}
