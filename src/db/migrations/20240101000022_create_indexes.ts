import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Full text search indexes
  await knex.raw(`
    CREATE INDEX idx_jobs_search ON jobs
    USING GIN(to_tsvector('english', title || ' ' || description))
  `);

  await knex.raw(`
    CREATE INDEX idx_worker_profiles_search ON worker_profiles
    USING GIN(to_tsvector('english', COALESCE(bio, '')))
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_worker_profiles_search');
  await knex.raw('DROP INDEX IF EXISTS idx_jobs_search');
}
