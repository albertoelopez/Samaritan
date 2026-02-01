import { db } from '../config/database';

export type JobStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
export type JobType = 'one_time' | 'recurring' | 'contract';
export type PaymentType = 'hourly' | 'fixed' | 'milestone';

export interface Job {
  id: string;
  contractor_id: string;
  title: string;
  description: string;
  category_id: string | null;
  job_type: JobType;
  payment_type: PaymentType;
  budget_min: number | null;
  budget_max: number | null;
  hourly_rate: number | null;
  estimated_hours: number | null;
  location: unknown;
  is_remote: boolean;
  required_workers: number;
  start_date: Date | null;
  end_date: Date | null;
  status: JobStatus;
  visibility: string;
  views_count: number;
  applications_count: number;
  required_skills: Record<string, unknown> | null;
  attachments: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
  published_at: Date | null;
  deleted_at: Date | null;
}

export type CreateJobInput = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'views_count' | 'applications_count' | 'published_at'>;
export type UpdateJobInput = Partial<Omit<Job, 'id' | 'contractor_id' | 'created_at' | 'updated_at'>>;

export interface JobSearchFilters {
  categoryId?: string;
  jobType?: JobType;
  paymentType?: PaymentType;
  minBudget?: number;
  maxBudget?: number;
  isRemote?: boolean;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  query?: string;
}

export class JobModel {
  static tableName = 'jobs';

  static async findById(id: string): Promise<Job | null> {
    return db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  static async findByContractorId(contractorId: string, options: { page?: number; limit?: number; status?: JobStatus } = {}): Promise<{ jobs: Job[]; total: number }> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ contractor_id: contractorId })
      .whereNull('deleted_at');

    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const jobs = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { jobs, total: parseInt(String(count), 10) };
  }

  static async create(input: CreateJobInput): Promise<Job> {
    const [job] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return job;
  }

  static async createWithLocation(
    input: Omit<CreateJobInput, 'location'>,
    latitude: number,
    longitude: number
  ): Promise<Job> {
    const [job] = await db(this.tableName)
      .insert({
        ...input,
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [longitude, latitude]),
      })
      .returning('*');
    return job;
  }

  static async update(id: string, input: UpdateJobInput): Promise<Job | null> {
    const updateData: UpdateJobInput & { published_at?: Date } = { ...input };

    if (input.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date();
    }

    const [job] = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update(updateData)
      .returning('*');
    return job || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id })
      .update({ deleted_at: new Date() });
    return count > 0;
  }

  static async incrementViews(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .increment('views_count', 1);
  }

  static async incrementApplications(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .increment('applications_count', 1);
  }

  static async decrementApplications(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .decrement('applications_count', 1);
  }

  static async search(
    filters: JobSearchFilters,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ jobs: Job[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName)
      .select('jobs.*')
      .select(db.raw('ST_X(location::geometry) as longitude, ST_Y(location::geometry) as latitude'))
      .where({ status: 'published' })
      .whereNull('deleted_at');

    if (filters.categoryId) {
      query = query.where({ category_id: filters.categoryId });
    }

    if (filters.jobType) {
      query = query.where({ job_type: filters.jobType });
    }

    if (filters.paymentType) {
      query = query.where({ payment_type: filters.paymentType });
    }

    if (filters.isRemote !== undefined) {
      query = query.where({ is_remote: filters.isRemote });
    }

    if (filters.minBudget) {
      query = query.where(function() {
        this.where('budget_min', '>=', filters.minBudget)
          .orWhere('hourly_rate', '>=', filters.minBudget);
      });
    }

    if (filters.maxBudget) {
      query = query.where(function() {
        this.where('budget_max', '<=', filters.maxBudget)
          .orWhere('hourly_rate', '<=', filters.maxBudget);
      });
    }

    if (filters.latitude && filters.longitude && filters.radiusKm) {
      query = query
        .select(db.raw(`ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000 as distance_km`, [filters.longitude, filters.latitude]))
        .whereRaw('ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)', [filters.longitude, filters.latitude, filters.radiusKm * 1000]);
    }

    if (filters.query) {
      query = query.whereRaw("to_tsvector('english', title || ' ' || description) @@ plainto_tsquery('english', ?)", [filters.query]);
    }

    const countResult = await query.clone().clearSelect().count("* as count").first();
    const count = countResult?.count ?? 0;
    const jobs = await query
      .orderBy('published_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { jobs, total: parseInt(String(count), 10) };
  }

  static async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ jobs: Job[]; total: number }> {
    return this.search({ latitude, longitude, radiusKm }, options);
  }
}
