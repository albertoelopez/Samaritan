import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('worker_skills', (table) => {
    table.uuid('worker_id').notNullable().references('id').inTable('worker_profiles').onDelete('CASCADE');
    table.uuid('category_id').notNullable().references('id').inTable('categories').onDelete('CASCADE');
    table.integer('years_of_experience').defaultTo(0);
    table.string('certification_name', 255);
    table.string('certification_url', 500);
    table.primary(['worker_id', 'category_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('worker_skills');
}
