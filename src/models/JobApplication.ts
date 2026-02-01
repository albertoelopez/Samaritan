import { db } from '../config/database';

export type ApplicationStatus = 'pending' | 'shortlisted' | 'accepted' | 'rejected' | 'withdrawn';

export interface JobApplication {
  id: string;
  job_id: string;
  worker_id: string;
  status: ApplicationStatus;
  proposed_rate: number | null;
  cover_letter: string | null;
  estimated_completion_time: number | null;
  attachments: Record<string, unknown> | null;
  contractor_notes: string | null;
  created_at: Date;
  updated_at: Date;
  responded_at: Date | null;
}

export type CreateApplicationInput = Omit<JobApplication, 'id' | 'created_at' | 'updated_at' | 'responded_at' | 'contractor_notes'>;
export type UpdateApplicationInput = Partial<Omit<JobApplication, 'id' | 'job_id' | 'worker_id' | 'created_at' | 'updated_at'>>;

export class JobApplicationModel {
  static tableName = 'job_applications';

  static async findById(id: string): Promise<JobApplication | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByJobAndWorker(jobId: string, workerId: string): Promise<JobApplication | null> {
    return db(this.tableName)
      .where({ job_id: jobId, worker_id: workerId })
      .first();
  }

  static async findByJobId(jobId: string, options: { page?: number; limit?: number; status?: ApplicationStatus } = {}): Promise<{ applications: JobApplication[]; total: number }> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ job_id: jobId });

    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const applications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { applications, total: parseInt(String(count), 10) };
  }

  static async findByWorkerId(workerId: string, options: { page?: number; limit?: number; status?: ApplicationStatus } = {}): Promise<{ applications: JobApplication[]; total: number }> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ worker_id: workerId });

    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const applications = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { applications, total: parseInt(String(count), 10) };
  }

  static async create(input: CreateApplicationInput): Promise<JobApplication> {
    const [application] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return application;
  }

  static async update(id: string, input: UpdateApplicationInput): Promise<JobApplication | null> {
    const updateData: UpdateApplicationInput & { responded_at?: Date } = { ...input };

    if (input.status && input.status !== 'pending' && !updateData.responded_at) {
      updateData.responded_at = new Date();
    }

    const [application] = await db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning('*');
    return application || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async withdraw(id: string): Promise<JobApplication | null> {
    return this.update(id, { status: 'withdrawn' });
  }

  static async accept(id: string, notes?: string): Promise<JobApplication | null> {
    return this.update(id, { status: 'accepted', contractor_notes: notes });
  }

  static async reject(id: string, notes?: string): Promise<JobApplication | null> {
    return this.update(id, { status: 'rejected', contractor_notes: notes });
  }

  static async shortlist(id: string): Promise<JobApplication | null> {
    return this.update(id, { status: 'shortlisted' });
  }

  static async getWithDetails(id: string): Promise<(JobApplication & { job?: unknown; worker?: unknown }) | null> {
    return db(this.tableName)
      .select('job_applications.*')
      .select(db.raw(`
        json_build_object(
          'id', jobs.id,
          'title', jobs.title,
          'status', jobs.status
        ) as job
      `))
      .select(db.raw(`
        json_build_object(
          'id', worker_profiles.id,
          'user_id', worker_profiles.user_id,
          'rating_average', worker_profiles.rating_average
        ) as worker
      `))
      .join('jobs', 'job_applications.job_id', 'jobs.id')
      .join('worker_profiles', 'job_applications.worker_id', 'worker_profiles.id')
      .where('job_applications.id', id)
      .first();
  }
}
