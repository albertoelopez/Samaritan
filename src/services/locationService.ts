import { db } from '../config/database';
import { cache } from '../config/redis';

export interface GeoLocation {
  latitude: number;
  longitude: number;
}

export interface NearbyEntity {
  id: string;
  distance_km: number;
  latitude: number;
  longitude: number;
}

export class LocationService {
  static async findNearbyWorkers(
    location: GeoLocation,
    radiusKm: number,
    options: { limit?: number; offset?: number; categoryId?: string; available?: boolean } = {}
  ): Promise<NearbyEntity[]> {
    const { limit = 20, offset = 0, categoryId, available = true } = options;

    let query = db('worker_profiles')
      .select('worker_profiles.id')
      .select(db.raw(`
        ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000 as distance_km,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude
      `, [location.longitude, location.latitude]))
      .whereRaw('ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)', [
        location.longitude,
        location.latitude,
        radiusKm * 1000,
      ])
      .where({ available_for_work: available })
      .orderByRaw('distance_km ASC')
      .limit(limit)
      .offset(offset);

    if (categoryId) {
      query = query
        .join('worker_skills', 'worker_profiles.id', 'worker_skills.worker_id')
        .where('worker_skills.category_id', categoryId);
    }

    return query;
  }

  static async findNearbyJobs(
    location: GeoLocation,
    radiusKm: number,
    options: { limit?: number; offset?: number; categoryId?: string } = {}
  ): Promise<NearbyEntity[]> {
    const { limit = 20, offset = 0, categoryId } = options;

    let query = db('jobs')
      .select('jobs.id')
      .select(db.raw(`
        ST_Distance(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography) / 1000 as distance_km,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude
      `, [location.longitude, location.latitude]))
      .whereRaw('ST_DWithin(location, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?)', [
        location.longitude,
        location.latitude,
        radiusKm * 1000,
      ])
      .where({ status: 'published' })
      .whereNull('deleted_at')
      .orderByRaw('distance_km ASC')
      .limit(limit)
      .offset(offset);

    if (categoryId) {
      query = query.where({ category_id: categoryId });
    }

    return query;
  }

  static async calculateDistance(from: GeoLocation, to: GeoLocation): Promise<number> {
    const result = await db.raw(`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography,
        ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography
      ) / 1000 as distance_km
    `, [from.longitude, from.latitude, to.longitude, to.latitude]);

    return parseFloat(result.rows[0]?.distance_km || '0');
  }

  static async updateUserLocation(
    userId: string,
    userType: 'worker' | 'contractor',
    location: GeoLocation
  ): Promise<void> {
    const tableName = userType === 'worker' ? 'worker_profiles' : 'contractor_profiles';

    await db(tableName)
      .where({ user_id: userId })
      .update({
        location: db.raw('ST_SetSRID(ST_MakePoint(?, ?), 4326)', [
          location.longitude,
          location.latitude,
        ]),
      });

    // Cache current location for real-time features
    await cache.set(`user_location:${userId}`, location, 3600); // 1 hour cache
  }

  static async getCachedLocation(userId: string): Promise<GeoLocation | null> {
    return cache.get<GeoLocation>(`user_location:${userId}`);
  }

  static async geocodeAddress(address: string): Promise<GeoLocation | null> {
    // Check cache first
    const cacheKey = `geocode:${address.toLowerCase().replace(/\s+/g, '_')}`;
    const cached = await cache.get<GeoLocation>(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO: Integrate with geocoding API (Google Maps, Mapbox, etc.)
    // For now, return null and implement when API is available
    return null;
  }

  static async reverseGeocode(location: GeoLocation): Promise<string | null> {
    // Check cache first
    const cacheKey = `reverse_geocode:${location.latitude}_${location.longitude}`;
    const cached = await cache.get<string>(cacheKey);
    if (cached) {
      return cached;
    }

    // TODO: Integrate with geocoding API
    return null;
  }

  static async getWorkersInBoundingBox(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
    options: { limit?: number; available?: boolean } = {}
  ): Promise<NearbyEntity[]> {
    const { limit = 100, available = true } = options;

    return db('worker_profiles')
      .select('id')
      .select(db.raw(`
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        0 as distance_km
      `))
      .whereRaw(`
        ST_Within(
          location::geometry,
          ST_MakeEnvelope(?, ?, ?, ?, 4326)
        )
      `, [minLng, minLat, maxLng, maxLat])
      .where({ available_for_work: available })
      .limit(limit);
  }
}
