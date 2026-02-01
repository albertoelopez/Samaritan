import { db } from '../config/database';
import { PaymentType } from './Job';

export type ContractStatus = 'draft' | 'active' | 'completed' | 'terminated' | 'disputed';

export interface Contract {
  id: string;
  job_id: string;
  contractor_id: string;
  worker_id: string;
  application_id: string | null;
  status: ContractStatus;
  agreed_rate: number | null;
  payment_type: PaymentType;
  total_amount: number | null;
  paid_amount: number;
  start_date: Date;
  end_date: Date | null;
  terms_and_conditions: string | null;
  signed_by_contractor: boolean;
  signed_by_worker: boolean;
  contractor_signed_at: Date | null;
  worker_signed_at: Date | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
}

export type CreateContractInput = Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'completed_at' | 'paid_amount' | 'signed_by_contractor' | 'signed_by_worker' | 'contractor_signed_at' | 'worker_signed_at'>;
export type UpdateContractInput = Partial<Omit<Contract, 'id' | 'job_id' | 'contractor_id' | 'worker_id' | 'created_at' | 'updated_at'>>;

export class ContractModel {
  static tableName = 'contracts';

  static async findById(id: string): Promise<Contract | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByJobId(jobId: string): Promise<Contract[]> {
    return db(this.tableName).where({ job_id: jobId });
  }

  static async findByContractorId(contractorId: string, options: { page?: number; limit?: number; status?: ContractStatus } = {}): Promise<{ contracts: Contract[]; total: number }> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ contractor_id: contractorId });

    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const contracts = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { contracts, total: parseInt(String(count), 10) };
  }

  static async findByWorkerId(workerId: string, options: { page?: number; limit?: number; status?: ContractStatus } = {}): Promise<{ contracts: Contract[]; total: number }> {
    const { page = 1, limit = 20, status } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ worker_id: workerId });

    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const contracts = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { contracts, total: parseInt(String(count), 10) };
  }

  static async create(input: CreateContractInput): Promise<Contract> {
    const [contract] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return contract;
  }

  static async update(id: string, input: UpdateContractInput): Promise<Contract | null> {
    const updateData: UpdateContractInput & { completed_at?: Date } = { ...input };

    if (input.status === 'completed' && !updateData.completed_at) {
      updateData.completed_at = new Date();
    }

    const [contract] = await db(this.tableName)
      .where({ id })
      .update(updateData)
      .returning('*');
    return contract || null;
  }

  static async signByContractor(id: string): Promise<Contract | null> {
    return this.update(id, {
      signed_by_contractor: true,
      contractor_signed_at: new Date(),
    });
  }

  static async signByWorker(id: string): Promise<Contract | null> {
    return this.update(id, {
      signed_by_worker: true,
      worker_signed_at: new Date(),
    });
  }

  static async activate(id: string): Promise<Contract | null> {
    const contract = await this.findById(id);
    if (!contract || !contract.signed_by_contractor || !contract.signed_by_worker) {
      return null;
    }
    return this.update(id, { status: 'active' });
  }

  static async addPayment(id: string, amount: number): Promise<Contract | null> {
    const [contract] = await db(this.tableName)
      .where({ id })
      .update({
        paid_amount: db.raw('paid_amount + ?', [amount]),
      })
      .returning('*');
    return contract || null;
  }

  static async getWithDetails(id: string): Promise<Contract | null> {
    return db(this.tableName)
      .select('contracts.*')
      .select(db.raw(`
        json_build_object(
          'id', jobs.id,
          'title', jobs.title
        ) as job
      `))
      .join('jobs', 'contracts.job_id', 'jobs.id')
      .where('contracts.id', id)
      .first();
  }
}
