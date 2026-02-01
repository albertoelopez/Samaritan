import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create the updated_at trigger function
  await knex.raw(`
    CREATE OR REPLACE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // Create triggers for all tables with updated_at
  const tablesWithUpdatedAt = [
    'users',
    'worker_profiles',
    'contractor_profiles',
    'jobs',
    'job_applications',
    'contracts',
    'reviews',
    'conversations'
  ];

  for (const table of tablesWithUpdatedAt) {
    await knex.raw(`
      CREATE TRIGGER update_${table}_updated_at
      BEFORE UPDATE ON ${table}
      FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);
  }
}

export async function down(knex: Knex): Promise<void> {
  const tablesWithUpdatedAt = [
    'users',
    'worker_profiles',
    'contractor_profiles',
    'jobs',
    'job_applications',
    'contracts',
    'reviews',
    'conversations'
  ];

  for (const table of tablesWithUpdatedAt) {
    await knex.raw(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table}`);
  }

  await knex.raw('DROP FUNCTION IF EXISTS update_updated_at()');
}
