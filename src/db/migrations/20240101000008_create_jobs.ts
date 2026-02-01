import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('jobs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('contractor_id').notNullable().references('id').inTable('contractor_profiles');
    table.string('title', 255).notNullable();
    table.text('description').notNullable();
    table.uuid('category_id').references('id').inTable('categories');
    table.specificType('job_type', 'job_type').notNullable();
    table.specificType('payment_type', 'payment_type').notNullable();
    table.decimal('budget_min', 10, 2);
    table.decimal('budget_max', 10, 2);
    table.decimal('hourly_rate', 10, 2);
    table.integer('estimated_hours');
    table.specificType('location', 'GEOGRAPHY(POINT, 4326)');
    table.boolean('is_remote').defaultTo(false);
    table.integer('required_workers').defaultTo(1);
    table.date('start_date');
    table.date('end_date');
    table.specificType('status', 'job_status').defaultTo('draft');
    table.string('visibility', 50).defaultTo('public');
    table.integer('views_count').defaultTo(0);
    table.integer('applications_count').defaultTo(0);
    table.jsonb('required_skills');
    table.jsonb('attachments');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('published_at', { useTz: true });
    table.timestamp('deleted_at', { useTz: true });
  });

  await knex.raw('CREATE INDEX idx_jobs_contractor_id ON jobs(contractor_id)');
  await knex.raw('CREATE INDEX idx_jobs_status_created ON jobs(status, created_at DESC)');
  await knex.raw('CREATE INDEX idx_jobs_location ON jobs USING GIST(location)');
  await knex.raw('CREATE INDEX idx_jobs_category ON jobs(category_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('jobs');
}
