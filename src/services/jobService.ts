import { JobModel, Job, CreateJobInput, UpdateJobInput, JobSearchFilters, JobStatus } from '../models/Job';
import { ContractorProfileModel } from '../models/ContractorProfile';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';

export interface CreateJobData {
  title: string;
  description: string;
  categoryId?: string;
  jobType: 'one_time' | 'recurring' | 'contract';
  paymentType: 'hourly' | 'fixed' | 'milestone';
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
  estimatedHours?: number;
  latitude?: number;
  longitude?: number;
  isRemote?: boolean;
  requiredWorkers?: number;
  startDate?: Date;
  endDate?: Date;
  requiredSkills?: Record<string, unknown>;
  visibility?: string;
}

export class JobService {
  static async createJob(userId: string, data: CreateJobData): Promise<Job> {
    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile) {
      throw new ForbiddenError('Only contractors can create jobs');
    }

    const jobInput: Omit<CreateJobInput, 'location'> = {
      contractor_id: contractorProfile.id,
      title: data.title,
      description: data.description,
      category_id: data.categoryId || null,
      job_type: data.jobType,
      payment_type: data.paymentType,
      budget_min: data.budgetMin || null,
      budget_max: data.budgetMax || null,
      hourly_rate: data.hourlyRate || null,
      estimated_hours: data.estimatedHours || null,
      is_remote: data.isRemote || false,
      required_workers: data.requiredWorkers || 1,
      start_date: data.startDate || null,
      end_date: data.endDate || null,
      required_skills: data.requiredSkills || null,
      attachments: null,
      status: 'draft',
      visibility: data.visibility || 'public',
    };

    let job: Job;
    if (data.latitude && data.longitude) {
      job = await JobModel.createWithLocation(jobInput, data.latitude, data.longitude);
    } else {
      job = await JobModel.create({ ...jobInput, location: null });
    }

    await ContractorProfileModel.incrementPostedJobs(contractorProfile.id);

    return job;
  }

  static async getJob(id: string): Promise<Job> {
    const job = await JobModel.findById(id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    await JobModel.incrementViews(id);
    return job;
  }

  static async updateJob(jobId: string, userId: string, data: Partial<CreateJobData>): Promise<Job> {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to update this job');
    }

    if (job.status === 'in_progress' || job.status === 'completed') {
      throw new BadRequestError('Cannot update a job that is in progress or completed');
    }

    const updateInput: UpdateJobInput = {};
    if (data.title !== undefined) updateInput.title = data.title;
    if (data.description !== undefined) updateInput.description = data.description;
    if (data.categoryId !== undefined) updateInput.category_id = data.categoryId;
    if (data.budgetMin !== undefined) updateInput.budget_min = data.budgetMin;
    if (data.budgetMax !== undefined) updateInput.budget_max = data.budgetMax;
    if (data.hourlyRate !== undefined) updateInput.hourly_rate = data.hourlyRate;
    if (data.estimatedHours !== undefined) updateInput.estimated_hours = data.estimatedHours;
    if (data.isRemote !== undefined) updateInput.is_remote = data.isRemote;
    if (data.requiredWorkers !== undefined) updateInput.required_workers = data.requiredWorkers;
    if (data.startDate !== undefined) updateInput.start_date = data.startDate;
    if (data.endDate !== undefined) updateInput.end_date = data.endDate;
    if (data.requiredSkills !== undefined) updateInput.required_skills = data.requiredSkills;
    if (data.visibility !== undefined) updateInput.visibility = data.visibility;

    const updated = await JobModel.update(jobId, updateInput);
    if (!updated) {
      throw new NotFoundError('Failed to update job');
    }

    return updated;
  }

  static async publishJob(jobId: string, userId: string): Promise<Job> {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to publish this job');
    }

    if (job.status !== 'draft') {
      throw new BadRequestError('Only draft jobs can be published');
    }

    const updated = await JobModel.update(jobId, { status: 'published' });
    if (!updated) {
      throw new NotFoundError('Failed to publish job');
    }

    return updated;
  }

  static async cancelJob(jobId: string, userId: string): Promise<Job> {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to cancel this job');
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      throw new BadRequestError('Cannot cancel a completed or already cancelled job');
    }

    const updated = await JobModel.update(jobId, { status: 'cancelled' });
    if (!updated) {
      throw new NotFoundError('Failed to cancel job');
    }

    return updated;
  }

  static async deleteJob(jobId: string, userId: string): Promise<void> {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to delete this job');
    }

    if (job.status === 'in_progress') {
      throw new BadRequestError('Cannot delete a job that is in progress');
    }

    await JobModel.delete(jobId);
  }

  static async searchJobs(
    filters: JobSearchFilters,
    options: { page?: number; limit?: number }
  ): Promise<{ jobs: Job[]; total: number }> {
    return JobModel.search(filters, options);
  }

  static async getContractorJobs(
    userId: string,
    options: { page?: number; limit?: number; status?: JobStatus }
  ): Promise<{ jobs: Job[]; total: number }> {
    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile) {
      throw new ForbiddenError('Only contractors can view their jobs');
    }

    return JobModel.findByContractorId(contractorProfile.id, options);
  }

  static async findNearbyJobs(
    latitude: number,
    longitude: number,
    radiusKm: number,
    options: { page?: number; limit?: number }
  ): Promise<{ jobs: Job[]; total: number }> {
    return JobModel.findNearby(latitude, longitude, radiusKm, options);
  }
}
