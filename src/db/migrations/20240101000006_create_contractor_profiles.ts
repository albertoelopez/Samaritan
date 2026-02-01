import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contractor_profiles', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').unique().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('company_name', 255);
    table.text('company_description');
    table.string('company_size', 50);
    table.string('industry', 100);
    table.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    table.string('website_url', 500);
    table.string('tax_id', 100);
    table.decimal('rating_average', 3, 2).defaultTo(0.00);
    table.integer('rating_count').defaultTo(0);
    table.integer('posted_jobs_count').defaultTo(0);
    table.integer('hired_workers_count').defaultTo(0);
    table.string('verification_status', 50).defaultTo('pending');
    table.jsonb('verification_documents');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX idx_contractor_profiles_user_id ON contractor_profiles(user_id)');
  await knex.raw('CREATE INDEX idx_contractor_profiles_location ON contractor_profiles USING GIST(location)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contractor_profiles');
}
