import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('job_applications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('job_id').notNullable().references('id').inTable('jobs').onDelete('CASCADE');
    table.uuid('worker_id').notNullable().references('id').inTable('worker_profiles');
    table.specificType('status', 'application_status').defaultTo('pending');
    table.decimal('proposed_rate', 10, 2);
    table.text('cover_letter');
    table.integer('estimated_completion_time');
    table.jsonb('attachments');
    table.text('contractor_notes');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('responded_at', { useTz: true });
    table.unique(['job_id', 'worker_id']);
  });

  await knex.raw('CREATE INDEX idx_job_applications_job_id ON job_applications(job_id)');
  await knex.raw('CREATE INDEX idx_job_applications_worker_id ON job_applications(worker_id)');
  await knex.raw('CREATE INDEX idx_job_applications_status ON job_applications(status)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('job_applications');
}
