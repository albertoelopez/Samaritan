import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // Enable PostGIS for geospatial features
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "postgis"');

  // Enable pg_trgm for text search
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pg_trgm"');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP EXTENSION IF EXISTS "pg_trgm"');
  await knex.raw('DROP EXTENSION IF EXISTS "postgis"');
  await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}
