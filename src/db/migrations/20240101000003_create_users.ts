import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('email', 255).unique().notNullable();
    table.string('phone_number', 20).unique();
    table.string('password_hash', 255).notNullable();
    table.specificType('role', 'user_role').notNullable();
    table.specificType('status', 'user_status').defaultTo('pending_verification');
    table.string('first_name', 100).notNullable();
    table.string('last_name', 100).notNullable();
    table.string('profile_picture_url', 500);
    table.boolean('email_verified').defaultTo(false);
    table.boolean('phone_verified').defaultTo(false);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('last_login_at', { useTz: true });
    table.timestamp('deleted_at', { useTz: true });
  });

  // Create index on email for faster lookups
  await knex.raw('CREATE INDEX idx_users_email ON users(email)');
  await knex.raw('CREATE INDEX idx_users_role_status ON users(role, status)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users');
}
