import { JobApplicationModel, JobApplication, ApplicationStatus } from '../models/JobApplication';
import { JobModel } from '../models/Job';
import { WorkerProfileModel } from '../models/WorkerProfile';
import { ContractorProfileModel } from '../models/ContractorProfile';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../utils/errors';
import { NotificationService } from './notificationService';

export interface CreateApplicationData {
  proposedRate?: number;
  coverLetter?: string;
  estimatedCompletionTime?: number;
  attachments?: Record<string, unknown>;
}

export class ApplicationService {
  static async apply(
    userId: string,
    jobId: string,
    data: CreateApplicationData
  ): Promise<JobApplication> {
    const workerProfile = await WorkerProfileModel.findByUserId(userId);
    if (!workerProfile) {
      throw new ForbiddenError('Only workers can apply for jobs');
    }

    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.status !== 'published') {
      throw new BadRequestError('Cannot apply to a job that is not published');
    }

    const existingApplication = await JobApplicationModel.findByJobAndWorker(
      jobId,
      workerProfile.id
    );
    if (existingApplication) {
      throw new ConflictError('You have already applied for this job');
    }

    const application = await JobApplicationModel.create({
      job_id: jobId,
      worker_id: workerProfile.id,
      status: 'pending',
      proposed_rate: data.proposedRate || null,
      cover_letter: data.coverLetter || null,
      estimated_completion_time: data.estimatedCompletionTime || null,
      attachments: data.attachments || null,
    });

    await JobModel.incrementApplications(jobId);

    // Notify contractor
    const contractor = await ContractorProfileModel.findById(job.contractor_id);
    if (contractor) {
      await NotificationService.createNotification({
        userId: contractor.user_id,
        type: 'application_received',
        title: 'New Application',
        message: `You received a new application for "${job.title}"`,
        data: { jobId, applicationId: application.id },
      });
    }

    return application;
  }

  static async getApplication(id: string): Promise<JobApplication> {
    const application = await JobApplicationModel.getWithDetails(id);
    if (!application) {
      throw new NotFoundError('Application not found');
    }
    return application;
  }

  static async updateApplicationStatus(
    applicationId: string,
    userId: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<JobApplication> {
    const application = await JobApplicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const job = await JobModel.findById(application.job_id);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to update this application');
    }

    if (application.status === 'withdrawn') {
      throw new BadRequestError('Cannot update a withdrawn application');
    }

    let updated: JobApplication | null;
    switch (status) {
      case 'accepted':
        updated = await JobApplicationModel.accept(applicationId, notes);
        break;
      case 'rejected':
        updated = await JobApplicationModel.reject(applicationId, notes);
        break;
      case 'shortlisted':
        updated = await JobApplicationModel.shortlist(applicationId);
        break;
      default:
        updated = await JobApplicationModel.update(applicationId, { status });
    }

    if (!updated) {
      throw new NotFoundError('Failed to update application');
    }

    // Notify worker of status change
    const workerProfile = await WorkerProfileModel.findById(application.worker_id);
    if (workerProfile) {
      await NotificationService.createNotification({
        userId: workerProfile.user_id,
        type: 'application_status_changed',
        title: 'Application Status Updated',
        message: `Your application for "${job.title}" has been ${status}`,
        data: { jobId: job.id, applicationId, status },
      });
    }

    return updated;
  }

  static async withdrawApplication(applicationId: string, userId: string): Promise<JobApplication> {
    const application = await JobApplicationModel.findById(applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const workerProfile = await WorkerProfileModel.findByUserId(userId);
    if (!workerProfile || application.worker_id !== workerProfile.id) {
      throw new ForbiddenError('Not authorized to withdraw this application');
    }

    if (application.status === 'accepted') {
      throw new BadRequestError('Cannot withdraw an accepted application');
    }

    const updated = await JobApplicationModel.withdraw(applicationId);
    if (!updated) {
      throw new NotFoundError('Failed to withdraw application');
    }

    await JobModel.decrementApplications(application.job_id);

    return updated;
  }

  static async getJobApplications(
    jobId: string,
    userId: string,
    options: { page?: number; limit?: number; status?: ApplicationStatus }
  ): Promise<{ applications: JobApplication[]; total: number }> {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to view applications for this job');
    }

    return JobApplicationModel.findByJobId(jobId, options);
  }

  static async getWorkerApplications(
    userId: string,
    options: { page?: number; limit?: number; status?: ApplicationStatus }
  ): Promise<{ applications: JobApplication[]; total: number }> {
    const workerProfile = await WorkerProfileModel.findByUserId(userId);
    if (!workerProfile) {
      throw new ForbiddenError('Only workers can view their applications');
    }

    return JobApplicationModel.findByWorkerId(workerProfile.id, options);
  }
}
