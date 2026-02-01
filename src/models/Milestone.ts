import { db } from '../config/database';

export interface Milestone {
  id: string;
  contract_id: string;
  title: string;
  description: string | null;
  amount: number;
  due_date: Date | null;
  is_completed: boolean;
  completed_at: Date | null;
  is_paid: boolean;
  paid_at: Date | null;
  created_at: Date;
}

export type CreateMilestoneInput = Omit<Milestone, 'id' | 'created_at' | 'is_completed' | 'completed_at' | 'is_paid' | 'paid_at'>;
export type UpdateMilestoneInput = Partial<Omit<Milestone, 'id' | 'contract_id' | 'created_at'>>;

export class MilestoneModel {
  static tableName = 'milestones';

  static async findById(id: string): Promise<Milestone | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByContractId(contractId: string): Promise<Milestone[]> {
    return db(this.tableName)
      .where({ contract_id: contractId })
      .orderBy('due_date', 'asc');
  }

  static async create(input: CreateMilestoneInput): Promise<Milestone> {
    const [milestone] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return milestone;
  }

  static async createMany(inputs: CreateMilestoneInput[]): Promise<Milestone[]> {
    return db(this.tableName)
      .insert(inputs)
      .returning('*');
  }

  static async update(id: string, input: UpdateMilestoneInput): Promise<Milestone | null> {
    const [milestone] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return milestone || null;
  }

  static async markComplete(id: string): Promise<Milestone | null> {
    return this.update(id, {
      is_completed: true,
      completed_at: new Date(),
    });
  }

  static async markPaid(id: string): Promise<Milestone | null> {
    return this.update(id, {
      is_paid: true,
      paid_at: new Date(),
    });
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async getContractTotal(contractId: string): Promise<number> {
    const result = await db(this.tableName)
      .where({ contract_id: contractId })
      .sum('amount as total')
      .first();
    return parseFloat(result?.total || '0');
  }

  static async getContractPaidTotal(contractId: string): Promise<number> {
    const result = await db(this.tableName)
      .where({ contract_id: contractId, is_paid: true })
      .sum('amount as total')
      .first();
    return parseFloat(result?.total || '0');
  }

  static async getPending(contractId: string): Promise<Milestone[]> {
    return db(this.tableName)
      .where({ contract_id: contractId, is_completed: true, is_paid: false })
      .orderBy('completed_at', 'asc');
  }
}
