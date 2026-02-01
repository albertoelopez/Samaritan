import { db } from '../config/database';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  search_criteria: Record<string, unknown>;
  notification_enabled: boolean;
  created_at: Date;
}

export type CreateSavedSearchInput = Omit<SavedSearch, 'id' | 'created_at'>;
export type UpdateSavedSearchInput = Partial<Omit<SavedSearch, 'id' | 'user_id' | 'created_at'>>;

export class SavedSearchModel {
  static tableName = 'saved_searches';

  static async findById(id: string): Promise<SavedSearch | null> {
    return db(this.tableName).where({ id }).first();
  }

  static async findByUserId(userId: string): Promise<SavedSearch[]> {
    return db(this.tableName)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  }

  static async create(input: CreateSavedSearchInput): Promise<SavedSearch> {
    const [search] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return search;
  }

  static async update(id: string, input: UpdateSavedSearchInput): Promise<SavedSearch | null> {
    const [search] = await db(this.tableName)
      .where({ id })
      .update(input)
      .returning('*');
    return search || null;
  }

  static async delete(id: string): Promise<boolean> {
    const count = await db(this.tableName).where({ id }).del();
    return count > 0;
  }

  static async getWithNotifications(): Promise<SavedSearch[]> {
    return db(this.tableName)
      .where({ notification_enabled: true })
      .orderBy('created_at', 'asc');
  }

  static async toggleNotifications(id: string): Promise<SavedSearch | null> {
    const search = await this.findById(id);
    if (!search) return null;

    return this.update(id, { notification_enabled: !search.notification_enabled });
  }
}
