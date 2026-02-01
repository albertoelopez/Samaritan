import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('conversation_id').notNullable().references('id').inTable('conversations').onDelete('CASCADE');
    table.uuid('sender_id').notNullable().references('id').inTable('users');
    table.text('message_text').notNullable();
    table.jsonb('attachments');
    table.boolean('is_system_message').defaultTo(false);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('edited_at', { useTz: true });
    table.timestamp('deleted_at', { useTz: true });
  });

  await knex.raw('CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at DESC)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('messages');
}
