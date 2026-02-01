import { db } from '../config/database';

export type PaymentMethodType = 'credit_card' | 'debit_card' | 'bank_account' | 'paypal' | 'stripe';

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: PaymentMethodType;
  is_default: boolean;
  provider_customer_id: string | null;
  provider_payment_method_id: string | null;
  last_four: string | null;
  brand: string | null;
  exp_month: number | null;
  exp_year: number | null;
  created_at: Date;
  deleted_at: Date | null;
}

export type CreatePaymentMethodInput = Omit<PaymentMethod, 'id' | 'created_at' | 'deleted_at'>;
export type UpdatePaymentMethodInput = Partial<Omit<PaymentMethod, 'id' | 'user_id' | 'created_at' | 'deleted_at'>>;

export class PaymentMethodModel {
  static tableName = 'payment_methods';

  static async findById(id: string): Promise<PaymentMethod | null> {
    return db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  static async findByUserId(userId: string): Promise<PaymentMethod[]> {
    return db(this.tableName)
      .where({ user_id: userId })
      .whereNull('deleted_at')
      .orderBy('is_default', 'desc')
      .orderBy('created_at', 'desc');
  }

  static async findDefault(userId: string): Promise<PaymentMethod | null> {
    return db(this.tableName)
      .where({ user_id: userId, is_default: true })
      .whereNull('deleted_at')
      .first();
  }

  static async create(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
    // If this is the first payment method or is_default is true, unset other defaults
    if (input.is_default) {
      await db(this.tableName)
        .where({ user_id: input.user_id })
        .update({ is_default: false });
    }

    const [method] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return method;
  }

  static async update(id: string, input: UpdatePaymentMethodInput): Promise<PaymentMethod | null> {
    if (input.is_default) {
      const method = await this.findById(id);
      if (method) {
        await db(this.tableName)
          .where({ user_id: method.user_id })
          .whereNot({ id })
          .update({ is_default: false });
      }
    }

    const [method] = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update(input)
      .returning('*');
    return method || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id })
      .update({ deleted_at: new Date() });
    return count > 0;
  }

  static async setDefault(id: string): Promise<PaymentMethod | null> {
    return this.update(id, { is_default: true });
  }
}
