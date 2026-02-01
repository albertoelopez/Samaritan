import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('payment_methods', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('type', 'payment_method_type').notNullable();
    table.boolean('is_default').defaultTo(false);
    table.string('provider_customer_id', 255);
    table.string('provider_payment_method_id', 255);
    table.string('last_four', 4);
    table.string('brand', 50);
    table.integer('exp_month');
    table.integer('exp_year');
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('deleted_at', { useTz: true });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_methods');
}
