import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.specificType('type', 'notification_type').notNullable();
    table.string('title', 255).notNullable();
    table.text('message');
    table.jsonb('data');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('read_at', { useTz: true });
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });

  await knex.raw('CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notifications');
}
