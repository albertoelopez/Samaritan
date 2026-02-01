import { db } from '../config/database';

export interface TimeEntry {
  id: string;
  contract_id: string;
  worker_id: string;
  start_time: Date;
  end_time: Date | null;
  break_minutes: number;
  description: string | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: Date | null;
  created_at: Date;
}

export type CreateTimeEntryInput = Omit<TimeEntry, 'id' | 'created_at' | 'is_approved' | 'approved_by' | 'approved_at'>;
export type UpdateTimeEntryInput = Partial<Omit<TimeEntry, 'id' | 'contract_id' | 'worker_id' | 'created_at'>>;

export class TimeEntryModel {
  static tableName = 'time_entries';

  static async findById(id: string): Promise<TimeEntry | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByContractId(contractId: string, options: { page?: number; limit?: number } = {}): Promise<{ entries: TimeEntry[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const query = db(this.tableName).where({ contract_id: contractId });

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const entries = await query
      .orderBy('start_time', 'desc')
      .limit(limit)
      .offset(offset);

    return { entries, total: parseInt(String(count), 10) };
  }

  static async findByWorkerId(workerId: string, options: { page?: number; limit?: number; contractId?: string } = {}): Promise<{ entries: TimeEntry[]; total: number }> {
    const { page = 1, limit = 20, contractId } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ worker_id: workerId });

    if (contractId) {
      query = query.where({ contract_id: contractId });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const entries = await query
      .orderBy('start_time', 'desc')
      .limit(limit)
      .offset(offset);

    return { entries, total: parseInt(String(count), 10) };
  }

  static async create(input: CreateTimeEntryInput): Promise<TimeEntry> {
    const [entry] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return entry;
  }

  static async update(id: string, input: UpdateTimeEntryInput): Promise<TimeEntry | null> {
    const [entry] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return entry || null;
  }

  static async clockOut(id: string, endTime: Date = new Date()): Promise<TimeEntry | null> {
    return this.update(id, { end_time: endTime });
  }

  static async approve(id: string, approvedBy: string): Promise<TimeEntry | null> {
    return this.update(id, {
      is_approved: true,
      approved_by: approvedBy,
      approved_at: new Date(),
    });
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async getActiveEntry(workerId: string): Promise<TimeEntry | null> {
    return db(this.tableName)
      .where({ worker_id: workerId })
      .whereNull('end_time')
      .first();
  }

  static async getTotalHours(contractId: string, approvedOnly = false): Promise<number> {
    let query = db(this.tableName)
      .where({ contract_id: contractId })
      .whereNotNull('end_time');

    if (approvedOnly) {
      query = query.where({ is_approved: true });
    }

    const result = await query
      .select(db.raw(`
        SUM(
          EXTRACT(EPOCH FROM (end_time - start_time)) / 3600 - break_minutes / 60.0
        ) as total_hours
      `))
      .first();

    return parseFloat(result?.total_hours || '0');
  }

  static async getPendingApproval(contractId: string): Promise<TimeEntry[]> {
    return db(this.tableName)
      .where({ contract_id: contractId, is_approved: false })
      .whereNotNull('end_time')
      .orderBy('start_time', 'desc');
  }
}
