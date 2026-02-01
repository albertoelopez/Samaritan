import { db } from '../config/database';

export interface AnalyticsEvent {
  id: string;
  user_id: string | null;
  event_name: string;
  event_category: string | null;
  event_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export type CreateAnalyticsEventInput = Omit<AnalyticsEvent, 'id' | 'created_at'>;

export class AnalyticsEventModel {
  static tableName = 'analytics_events';

  static async create(input: CreateAnalyticsEventInput): Promise<AnalyticsEvent> {
    const [event] = await db(this.tableName)
      .insert(input)
      .returning('*');
    return event;
  }

  static async createMany(inputs: CreateAnalyticsEventInput[]): Promise<AnalyticsEvent[]> {
    return db(this.tableName)
      .insert(inputs)
      .returning('*');
  }

  static async findByUserId(userId: string, options: { page?: number; limit?: number; eventName?: string; startDate?: Date; endDate?: Date } = {}): Promise<{ events: AnalyticsEvent[]; total: number }> {
    const { page = 1, limit = 50, eventName, startDate, endDate } = options;
    const offset = (page - 1) * limit;

    let query = db(this.tableName).where({ user_id: userId });

    if (eventName) {
      query = query.where({ event_name: eventName });
    }
    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const countResult = await query.clone().count("* as count").first();
    const count = countResult?.count ?? 0;
    const events = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { events, total: parseInt(String(count), 10) };
  }

  static async getEventCounts(options: { eventName?: string; eventCategory?: string; startDate?: Date; endDate?: Date } = {}): Promise<{ event_name: string; count: number }[]> {
    const { eventName, eventCategory, startDate, endDate } = options;

    let query = db(this.tableName)
      .select('event_name')
      .count('* as count')
      .groupBy('event_name');

    if (eventName) {
      query = query.where({ event_name: eventName });
    }
    if (eventCategory) {
      query = query.where({ event_category: eventCategory });
    }
    if (startDate) {
      query = query.where('created_at', '>=', startDate);
    }
    if (endDate) {
      query = query.where('created_at', '<=', endDate);
    }

    const results = await query.orderBy('count', 'desc');
    return results.map((r) => ({
      event_name: r.event_name as string,
      count: parseInt(r.count as string, 10),
    }));
  }

  static async deleteOld(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return db(this.tableName)
      .where('created_at', '<', cutoffDate)
      .del();
  }

  static async getDailyActiveUsers(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    const results = await db(this.tableName)
      .select(db.raw("DATE(created_at) as date"))
      .countDistinct('user_id as count')
      .whereNotNull('user_id')
      .whereBetween('created_at', [startDate, endDate])
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc');

    return results.map((r) => ({
      date: r.date as string,
      count: parseInt(r.count as string, 10),
    }));
  }
}
