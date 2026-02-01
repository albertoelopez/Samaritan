import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('milestones', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('contract_id').notNullable().references('id').inTable('contracts');
    table.string('title', 255).notNullable();
    table.text('description');
    table.decimal('amount', 10, 2).notNullable();
    table.date('due_date');
    table.boolean('is_completed').defaultTo(false);
    table.timestamp('completed_at', { useTz: true });
    table.boolean('is_paid').defaultTo(false);
    table.timestamp('paid_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('milestones');
}
