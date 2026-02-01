import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('time_entries', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('contract_id').notNullable().references('id').inTable('contracts');
    table.uuid('worker_id').notNullable().references('id').inTable('worker_profiles');
    table.timestamp('start_time', { useTz: true }).notNullable();
    table.timestamp('end_time', { useTz: true });
    table.integer('break_minutes').defaultTo(0);
    table.text('description');
    table.boolean('is_approved').defaultTo(false);
    table.uuid('approved_by').references('id').inTable('users');
    table.timestamp('approved_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('time_entries');
}
