import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('contracts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('job_id').notNullable().references('id').inTable('jobs');
    table.uuid('contractor_id').notNullable().references('id').inTable('contractor_profiles');
    table.uuid('worker_id').notNullable().references('id').inTable('worker_profiles');
    table.uuid('application_id').references('id').inTable('job_applications');
    table.specificType('status', 'contract_status').defaultTo('draft');
    table.decimal('agreed_rate', 10, 2);
    table.specificType('payment_type', 'payment_type').notNullable();
    table.decimal('total_amount', 10, 2);
    table.decimal('paid_amount', 10, 2).defaultTo(0);
    table.date('start_date').notNullable();
    table.date('end_date');
    table.text('terms_and_conditions');
    table.boolean('signed_by_contractor').defaultTo(false);
    table.boolean('signed_by_worker').defaultTo(false);
    table.timestamp('contractor_signed_at', { useTz: true });
    table.timestamp('worker_signed_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('completed_at', { useTz: true });
  });

  await knex.raw('CREATE INDEX idx_contracts_status ON contracts(status)');
  await knex.raw('CREATE INDEX idx_contracts_dates ON contracts(start_date, end_date)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('contracts');
}
