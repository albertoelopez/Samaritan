import { db } from '../config/database';
import bcrypt from 'bcrypt';

export type UserRole = 'worker' | 'contractor' | 'admin' | 'moderator';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending_verification';

export interface User {
  id: string;
  email: string;
  phone_number: string | null;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
  deleted_at: Date | null;
}

export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login_at' | 'deleted_at'>;
export type UpdateUserInput = Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;

export class UserModel {
  static tableName = 'users';

  static async findById(id: string): Promise<User | null> {
    return db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .first();
  }

  static async findByEmail(email: string): Promise<User | null> {
    return db(this.tableName)
      .where({ email: email.toLowerCase() })
      .whereNull('deleted_at')
      .first();
  }

  static async findByPhone(phone: string): Promise<User | null> {
    return db(this.tableName)
      .where({ phone_number: phone })
      .whereNull('deleted_at')
      .first();
  }

  static async create(input: CreateUserInput): Promise<User> {
    const [user] = await db(this.tableName)
      .insert({
        ...input,
        email: input.email.toLowerCase(),
      })
      .returning('*');
    return user;
  }

  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const [user] = await db(this.tableName)
      .where({ id })
      .whereNull('deleted_at')
      .update(input)
      .returning('*');
    return user || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName)
      .where({ id })
      .update({ deleted_at: new Date() });
    return count > 0;
  }

  static async hardDelete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async updateLastLogin(id: string): Promise<void> {
    await db(this.tableName)
      .where({ id })
      .update({ last_login_at: new Date() });
  }

  static async findAll(options: {
    role?: UserRole;
    status?: UserStatus;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: User[]; total: number }> {
    const { role, status, page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).whereNull('deleted_at');

    if (role) {
      query = query.where({ role });
    }
    if (status) {
      query = query.where({ status });
    }

    const countResult = await query.clone().count('* as count').first();
    const count = countResult?.count ?? 0;
    const users = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { users, total: parseInt(String(count), 10) };
  }

  static sanitize(user: User): Omit<User, 'password_hash'> {
    const { password_hash: _, ...sanitized } = user;
    return sanitized;
  }
}
