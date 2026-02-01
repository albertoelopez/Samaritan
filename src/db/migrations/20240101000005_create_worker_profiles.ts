import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('worker_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('bio');
    table.decimal('hourly_rate_min', 10, 2);
    table.decimal('hourly_rate_max', 10, 2);
    table.integer('years_of_experience').defaultTo(0);
    table.boolean('available_for_work').defaultTo(true);
    table.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    table.integer('service_radius_km').defaultTo(50);
    table.decimal('rating_average', 3, 2).defaultTo(0.00);
    table.integer('rating_count').defaultTo(0);
    table.integer('completed_jobs_count').defaultTo(0);
    table.integer('response_time_hours');
    table.string('verification_status', 50).defaultTo('pending');
    table.jsonb('verification_documents');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX idx_worker_profiles_user_id ON worker_profiles(user_id)');
  await knex.raw('CREATE INDEX idx_worker_profiles_location ON worker_profiles USING GIST(location)');
  await knex.raw('CREATE INDEX idx_worker_profiles_rating ON worker_profiles(rating_average DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('worker_profiles');
}
