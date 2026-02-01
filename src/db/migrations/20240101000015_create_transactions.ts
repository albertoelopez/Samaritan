import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('contract_id').references('id').inTable('contracts');
    table.uuid('milestone_id').references('id').inTable('milestones');
    table.uuid('time_entry_id').references('id').inTable('time_entries');
    table.uuid('payer_id').references('id').inTable('users');
    table.uuid('payee_id').references('id').inTable('users');
    table.uuid('payment_method_id').references('id').inTable('payment_methods');
    table.specificType('type', 'transaction_type').notNullable();
    table.specificType('status', 'transaction_status').defaultTo('pending');
    table.decimal('amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.decimal('platform_fee', 10, 2).defaultTo(0);
    table.decimal('net_amount', 10, 2);
    table.string('provider_transaction_id', 255);
    table.jsonb('provider_response');
    table.text('description');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('processed_at', { useTz: true });
    table.timestamp('failed_at', { useTz: true });
    table.text('failure_reason');
  });

  await knex.raw('CREATE INDEX idx_transactions_contract_id ON transactions(contract_id)');
  await knex.raw('CREATE INDEX idx_transactions_status_created ON transactions(status, created_at DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
}
