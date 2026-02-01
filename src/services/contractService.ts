import { ContractModel, Contract, ContractStatus } from '../models/Contract';
import { JobModel } from '../models/Job';
import { JobApplicationModel } from '../models/JobApplication';
import { WorkerProfileModel } from '../models/WorkerProfile';
import { ContractorProfileModel } from '../models/ContractorProfile';
import { MilestoneModel, Milestone } from '../models/Milestone';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { NotificationService } from './notificationService';

export interface CreateContractData {
  jobId: string;
  workerId: string;
  applicationId?: string;
  agreedRate?: number;
  paymentType: 'hourly' | 'fixed' | 'milestone';
  totalAmount?: number;
  startDate: Date;
  endDate?: Date;
  termsAndConditions?: string;
  milestones?: { title: string; description?: string; amount: number; dueDate?: Date }[];
}

export class ContractService {
  static async createContract(userId: string, data: CreateContractData): Promise<Contract> {
    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile) {
      throw new ForbiddenError('Only contractors can create contracts');
    }

    const job = await JobModel.findById(data.jobId);
    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Not authorized to create a contract for this job');
    }

    const workerProfile = await WorkerProfileModel.findById(data.workerId);
    if (!workerProfile) {
      throw new NotFoundError('Worker not found');
    }

    const contract = await ContractModel.create({
      job_id: data.jobId,
      contractor_id: contractorProfile.id,
      worker_id: data.workerId,
      application_id: data.applicationId || null,
      status: 'draft',
      agreed_rate: data.agreedRate || null,
      payment_type: data.paymentType,
      total_amount: data.totalAmount || null,
      start_date: data.startDate,
      end_date: data.endDate || null,
      terms_and_conditions: data.termsAndConditions || null,
    });

    // Create milestones if payment type is milestone
    if (data.paymentType === 'milestone' && data.milestones?.length) {
      await MilestoneModel.createMany(
        data.milestones.map((m) => ({
          contract_id: contract.id,
          title: m.title,
          description: m.description || null,
          amount: m.amount,
          due_date: m.dueDate || null,
        }))
      );
    }

    // Notify worker
    await NotificationService.createNotification({
      userId: workerProfile.user_id,
      type: 'contract_offered',
      title: 'Contract Offer',
      message: `You have received a contract offer for "${job.title}"`,
      data: { contractId: contract.id, jobId: job.id },
    });

    return contract;
  }

  static async getContract(id: string): Promise<Contract & { milestones?: Milestone[] }> {
    const contract = await ContractModel.getWithDetails(id);
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    const milestones = await MilestoneModel.findByContractId(id);

    return { ...contract, milestones };
  }

  static async signContract(contractId: string, userId: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    const workerProfile = await WorkerProfileModel.findByUserId(userId);
    const contractorProfile = await ContractorProfileModel.findByUserId(userId);

    if (workerProfile?.id === contract.worker_id) {
      const updated = await ContractModel.signByWorker(contractId);
      if (!updated) {
        throw new NotFoundError('Failed to sign contract');
      }

      if (updated.signed_by_contractor && updated.signed_by_worker) {
        await ContractModel.activate(contractId);
        await JobModel.update(contract.job_id, { status: 'in_progress' });

        // Accept the application if there is one
        if (contract.application_id) {
          await JobApplicationModel.accept(contract.application_id);
        }
      }

      // Notify contractor
      const contractor = await ContractorProfileModel.findById(contract.contractor_id);
      if (contractor) {
        await NotificationService.createNotification({
          userId: contractor.user_id,
          type: 'contract_signed',
          title: 'Contract Signed',
          message: 'The worker has signed the contract',
          data: { contractId },
        });
      }

      return updated;
    } else if (contractorProfile?.id === contract.contractor_id) {
      const updated = await ContractModel.signByContractor(contractId);
      if (!updated) {
        throw new NotFoundError('Failed to sign contract');
      }

      if (updated.signed_by_contractor && updated.signed_by_worker) {
        await ContractModel.activate(contractId);
        await JobModel.update(contract.job_id, { status: 'in_progress' });

        if (contract.application_id) {
          await JobApplicationModel.accept(contract.application_id);
        }
      }

      // Notify worker
      const worker = await WorkerProfileModel.findById(contract.worker_id);
      if (worker) {
        await NotificationService.createNotification({
          userId: worker.user_id,
          type: 'contract_signed',
          title: 'Contract Signed',
          message: 'The contractor has signed the contract',
          data: { contractId },
        });
      }

      return updated;
    }

    throw new ForbiddenError('Not authorized to sign this contract');
  }

  static async completeContract(contractId: string, userId: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile || contract.contractor_id !== contractorProfile.id) {
      throw new ForbiddenError('Only the contractor can complete the contract');
    }

    if (contract.status !== 'active') {
      throw new BadRequestError('Only active contracts can be completed');
    }

    const updated = await ContractModel.update(contractId, { status: 'completed' });
    if (!updated) {
      throw new NotFoundError('Failed to complete contract');
    }

    await JobModel.update(contract.job_id, { status: 'completed' });
    await WorkerProfileModel.incrementCompletedJobs(contract.worker_id);
    await ContractorProfileModel.incrementHiredWorkers(contract.contractor_id);

    return updated;
  }

  static async terminateContract(contractId: string, userId: string): Promise<Contract> {
    const contract = await ContractModel.findById(contractId);
    if (!contract) {
      throw new NotFoundError('Contract not found');
    }

    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    const workerProfile = await WorkerProfileModel.findByUserId(userId);

    const isContractor = contractorProfile?.id === contract.contractor_id;
    const isWorker = workerProfile?.id === contract.worker_id;

    if (!isContractor && !isWorker) {
      throw new ForbiddenError('Not authorized to terminate this contract');
    }

    if (contract.status !== 'active' && contract.status !== 'draft') {
      throw new BadRequestError('Cannot terminate this contract');
    }

    const updated = await ContractModel.update(contractId, { status: 'terminated' });
    if (!updated) {
      throw new NotFoundError('Failed to terminate contract');
    }

    await JobModel.update(contract.job_id, { status: 'cancelled' });

    return updated;
  }

  static async getContractorContracts(
    userId: string,
    options: { page?: number; limit?: number; status?: ContractStatus }
  ): Promise<{ contracts: Contract[]; total: number }> {
    const contractorProfile = await ContractorProfileModel.findByUserId(userId);
    if (!contractorProfile) {
      throw new ForbiddenError('Only contractors can view their contracts');
    }

    return ContractModel.findByContractorId(contractorProfile.id, options);
  }

  static async getWorkerContracts(
    userId: string,
    options: { page?: number; limit?: number; status?: ContractStatus }
  ): Promise<{ contracts: Contract[]; total: number }> {
    const workerProfile = await WorkerProfileModel.findByUserId(userId);
    if (!workerProfile) {
      throw new ForbiddenError('Only workers can view their contracts');
    }

    return ContractModel.findByWorkerId(workerProfile.id, options);
  }
}
