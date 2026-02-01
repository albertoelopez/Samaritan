import { db } from '../config/database';

export type TransactionType = 'payment' | 'refund' | 'withdrawal' | 'fee' | 'adjustment';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface Transaction {
  id: string;
  contract_id: string | null;
  milestone_id: string | null;
  time_entry_id: string | null;
  payer_id: string | null;
  payee_id: string | null;
  payment_method_id: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  platform_fee: number;
  net_amount: number | null;
  provider_transaction_id: string | null;
  provider_response: Record<string, unknown> | null;
  description: string | null;
  created_at: Date;
  processed_at: Date | null;
  failed_at: Date | null;
  failure_reason: string | null;
}

export type CreateTransactionInput = Omit<Transaction, 'id' | 'created_at' | 'processed_at' | 'failed_at' | 'failure_reason' | 'status'> & { status?: TransactionStatus };
export type UpdateTransactionInput = Partial<Omit<Transaction, 'id' | 'created_at'>>;

export class TransactionModel {
  static tableName = 'transactions';

  static async findById(id: string): Promise<Transaction | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByContractId(contractId: string, options: { page?: number; limit?: number } = {}): Promise<{ transactions: Transaction[]; total: number }> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const query = db(this.tableName).where({ contract_id: contractId });

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const transactions = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { transactions, total: parseInt(String(count), 10) };
  }

  static async findByUserId(userId: string, options: { page?: number; limit?: number; type?: TransactionType } = {}): Promise<{ transactions: Transaction[]; total: number }> {
    const { page = 1, limit = 20, type } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where(function() {
      this.where({ payer_id: userId }).orWhere({ payee_id: userId });
    });

    if (type) {
      query = query.where({ type });
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const transactions = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { transactions, total: parseInt(String(count), 10) };
  }

  static async create(input: CreateTransactionInput): Promise<Transaction> {
    const [transaction] = await db(this.tableName)
      .insert({
        ...input,
        status: input.status || 'pending',
      })
      .returning('*');
    return transaction;
  }

  static async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const [transaction] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return transaction || null;
  }

  static async markProcessing(id: string): Promise<Transaction | null> {
    return this.update(id, { status: 'processing' });
  }

  static async markCompleted(id: string, providerTransactionId?: string, providerResponse?: Record<string, unknown>): Promise<Transaction | null> {
    return this.update(id, {
      status: 'completed',
      processed_at: new Date(),
      provider_transaction_id: providerTransactionId,
      provider_response: providerResponse,
    });
  }

  static async markFailed(id: string, reason: string, providerResponse?: Record<string, unknown>): Promise<Transaction | null> {
    return this.update(id, {
      status: 'failed',
      failed_at: new Date(),
      failure_reason: reason,
      provider_response: providerResponse,
    });
  }

  static async markCancelled(id: string): Promise<Transaction | null> {
    return this.update(id, { status: 'cancelled' });
  }

  static async getContractTotal(contractId: string, status: TransactionStatus = 'completed'): Promise<number> {
    const result = await db(this.tableName)
      .where({ contract_id: contractId, status, type: 'payment' })
      .sum('amount as total')
      .first();
    return parseFloat(result?.total || '0');
  }

  static async getUserEarnings(userId: string, options: { startDate?: Date; endDate?: Date } = {}): Promise<number> {
    let query = db(this.tableName)
      .where({ payee_id: userId, status: 'completed', type: 'payment' });

    if (options.startDate) {
      query = query.where('created_at', '>=', options.startDate);
    }
    if (options.endDate) {
      query = query.where('created_at', '<=', options.endDate);
    }

    const result = await query.sum('net_amount as total').first();
    return parseFloat(result?.total || '0');
  }
}
