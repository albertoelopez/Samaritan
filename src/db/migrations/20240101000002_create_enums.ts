import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // User related enums
  await knex.raw(`
    CREATE TYPE user_role AS ENUM ('worker', 'contractor', 'admin', 'moderator')
  `);

  await knex.raw(`
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending_verification')
  `);

  // Job related enums
  await knex.raw(`
    CREATE TYPE job_status AS ENUM ('draft', 'published', 'in_progress', 'completed', 'cancelled', 'disputed')
  `);

  await knex.raw(`
    CREATE TYPE job_type AS ENUM ('one_time', 'recurring', 'contract')
  `);

  await knex.raw(`
    CREATE TYPE payment_type AS ENUM ('hourly', 'fixed', 'milestone')
  `);

  // Application related enums
  await knex.raw(`
    CREATE TYPE application_status AS ENUM ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
  `);

  // Contract related enums
  await knex.raw(`
    CREATE TYPE contract_status AS ENUM ('draft', 'active', 'completed', 'terminated', 'disputed')
  `);

  // Payment related enums
  await knex.raw(`
    CREATE TYPE payment_method_type AS ENUM ('credit_card', 'debit_card', 'bank_account', 'paypal', 'stripe')
  `);

  await knex.raw(`
    CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'withdrawal', 'fee', 'adjustment')
  `);

  await knex.raw(`
    CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled')
  `);

  // Notification related enums
  await knex.raw(`
    CREATE TYPE notification_type AS ENUM (
      'new_job_match',
      'application_received',
      'application_status_changed',
      'contract_offered',
      'contract_signed',
      'payment_received',
      'review_received',
      'message_received',
      'system_announcement'
    )
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TYPE IF EXISTS notification_type');
  await knex.raw('DROP TYPE IF EXISTS transaction_status');
  await knex.raw('DROP TYPE IF EXISTS transaction_type');
  await knex.raw('DROP TYPE IF EXISTS payment_method_type');
  await knex.raw('DROP TYPE IF EXISTS contract_status');
  await knex.raw('DROP TYPE IF EXISTS application_status');
  await knex.raw('DROP TYPE IF EXISTS payment_type');
  await knex.raw('DROP TYPE IF EXISTS job_type');
  await knex.raw('DROP TYPE IF EXISTS job_status');
  await knex.raw('DROP TYPE IF EXISTS user_status');
  await knex.raw('DROP TYPE IF EXISTS user_role');
}
