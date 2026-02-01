import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('contract_id').notNullable().references('id').inTable('contracts');
    table.uuid('reviewer_id').notNullable().references('id').inTable('users');
    table.uuid('reviewee_id').notNullable().references('id').inTable('users');
    table.integer('rating').notNullable().checkBetween([1, 5]);
    table.text('review_text');
    table.boolean('is_recommendation').defaultTo(true);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.unique(['contract_id', 'reviewer_id', 'reviewee_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('reviews');
}
