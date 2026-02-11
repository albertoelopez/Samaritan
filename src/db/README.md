# Database Migrations and Seeds

This directory contains Knex migrations and seed files for the HomeDepot Paisano application.

## Prerequisites

1. PostgreSQL 12+ with PostGIS extension
2. Node.js and npm installed
3. Environment variables configured in `.env` file

## Environment Setup

Ensure your `.env` file contains the following database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homedepot_paisano
DB_USER=postgres
DB_PASSWORD=your_password

TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=homedepot_paisano_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_password
```

## Database Commands

### Run Migrations

Apply all pending migrations:

```bash
npm run migrate
```

Or using npx:

```bash
npx knex migrate:latest
```

### Rollback Migrations

Rollback the last batch of migrations:

```bash
npx knex migrate:rollback
```

Rollback all migrations:

```bash
npx knex migrate:rollback --all
```

### Run Seeds

Populate the database with seed data:

```bash
npm run seed
```

Or using npx:

```bash
npx knex seed:run
```

### Create New Migration

```bash
npx knex migrate:make migration_name
```

### Create New Seed

```bash
npx knex seed:make seed_name
```

## Migration Files

Migrations are executed in order based on their timestamp prefix. Here's the complete list:

1. **20240101000001_create_extensions.ts** - PostgreSQL extensions (uuid-ossp, postgis, pg_trgm)
2. **20240101000002_create_enums.ts** - All ENUM types
3. **20240101000003_create_users.ts** - Users table
4. **20240101000004_create_categories.ts** - Job categories
5. **20240101000005_create_worker_profiles.ts** - Worker profiles with PostGIS location
6. **20240101000006_create_contractor_profiles.ts** - Contractor profiles
7. **20240101000007_create_worker_skills.ts** - Worker-category junction table
8. **20240101000008_create_jobs.ts** - Jobs table
9. **20240101000009_create_job_applications.ts** - Job applications
10. **20240101000010_create_contracts.ts** - Contracts between workers and contractors
11. **20240101000011_create_time_entries.ts** - Time tracking for hourly contracts
12. **20240101000012_create_milestones.ts** - Milestones for fixed/milestone projects
13. **20240101000013_create_reviews.ts** - Reviews and ratings
14. **20240101000014_create_payment_methods.ts** - Payment methods
15. **20240101000015_create_transactions.ts** - Financial transactions
16. **20240101000016_create_notifications.ts** - User notifications
17. **20240101000017_create_conversations.ts** - Message conversations
18. **20240101000018_create_conversation_participants.ts** - Conversation participants
19. **20240101000019_create_messages.ts** - Messages
20. **20240101000020_create_saved_searches.ts** - Saved job searches
21. **20240101000021_create_analytics_events.ts** - Analytics and tracking
22. **20240101000022_create_indexes.ts** - Full-text search indexes
23. **20240101000023_create_triggers.ts** - Database triggers (updated_at)

## Seed Files

Seeds are executed in alphabetical order:

1. **01_categories.ts** - 20 job categories (construction, plumbing, electrical, etc.)
2. **02_sample_users.ts** - Sample users, workers, contractors, and basic jobs
3. **03_additional_sample_data.ts** - Extended sample data (contracts, reviews, messages, etc.)

### Seed Data Contents

#### Categories (01_categories.ts)
- General Labor
- Construction
- Plumbing
- Electrical
- Carpentry
- Painting
- Landscaping
- Roofing
- HVAC
- Flooring
- Masonry
- Welding
- Demolition
- Drywall
- Tiling
- Moving
- Cleaning
- Handyman
- Assembly
- Other

#### Sample Users (02_sample_users.ts)
- **Admin**: admin@homedepotpaisano.com (password: password123)
- **Workers**:
  - Juan Garcia (worker1@example.com) - Construction, 10 years experience
  - Maria Rodriguez (worker2@example.com) - Painting/Drywall, 5 years experience
- **Contractors**:
  - John Smith (contractor1@example.com) - Smith Construction LLC
  - Sarah Johnson (contractor2@example.com) - Johnson Home Services
- **Jobs**: 2 sample jobs with applications

#### Additional Data (03_additional_sample_data.ts)
- 3 more diverse jobs (drywall, landscaping, electrical)
- Multiple job applications with different statuses
- Active and completed contracts
- Time entries (approved and pending)
- Milestones with payment status
- Reviews and ratings
- Payment methods for users
- Transaction history
- Conversations and messages
- Notifications (read and unread)
- Saved searches
- Analytics events

## Database Schema Overview

### Core Tables

**Users & Profiles**
- `users` - Base user table with authentication
- `worker_profiles` - Worker-specific data with geospatial location
- `contractor_profiles` - Contractor/company data
- `categories` - Job categories (hierarchical)
- `worker_skills` - Worker skills and certifications

**Jobs & Applications**
- `jobs` - Job postings with geospatial location
- `job_applications` - Worker applications/bids
- `contracts` - Accepted jobs become contracts
- `time_entries` - Time tracking for hourly work
- `milestones` - Payment milestones for fixed-price jobs

**Reviews & Ratings**
- `reviews` - Bidirectional reviews between workers and contractors

**Payments**
- `payment_methods` - Stored payment methods (Stripe)
- `transactions` - Payment transaction history

**Messaging**
- `conversations` - Message threads
- `conversation_participants` - Users in conversations
- `messages` - Individual messages

**Other**
- `notifications` - User notifications
- `saved_searches` - Saved job search queries
- `analytics_events` - User behavior tracking

### ENUM Types

- `user_role`: worker, contractor, admin, moderator
- `user_status`: active, inactive, suspended, pending_verification
- `job_status`: draft, published, in_progress, completed, cancelled, disputed
- `job_type`: one_time, recurring, contract
- `payment_type`: hourly, fixed, milestone
- `application_status`: pending, shortlisted, accepted, rejected, withdrawn
- `contract_status`: draft, active, completed, terminated, disputed
- `payment_method_type`: credit_card, debit_card, bank_account, paypal, stripe
- `transaction_type`: payment, refund, withdrawal, fee, adjustment
- `transaction_status`: pending, processing, completed, failed, cancelled
- `notification_type`: new_job_match, application_received, application_status_changed, contract_offered, contract_signed, payment_received, review_received, message_received, system_announcement

### PostGIS Features

The following tables use PostGIS GEOGRAPHY(POINT, 4326) for location data:
- `worker_profiles.location`
- `contractor_profiles.location`
- `jobs.location`

This enables geospatial queries like:
- Finding jobs within X km of a worker's location
- Matching workers to jobs based on service radius
- Distance-based search and filtering

### Indexes

**Performance Indexes**:
- B-tree indexes on foreign keys and frequently queried columns
- GIST indexes on PostGIS location columns
- GIN indexes for full-text search on job titles/descriptions
- Composite indexes for common query patterns

**Full-Text Search**:
- Jobs: title and description
- Worker profiles: bio

## Testing

For testing, use the test database:

```bash
NODE_ENV=test npx knex migrate:latest
NODE_ENV=test npx knex seed:run
```

## Troubleshooting

### PostGIS Extension Not Found

If you get an error about PostGIS not being installed:

```bash
sudo apt-get install postgresql-12-postgis-3
```

Or for macOS:

```bash
brew install postgis
```

Then connect to your database and enable it:

```sql
CREATE EXTENSION postgis;
```

### Permission Errors

Ensure your database user has sufficient privileges:

```sql
GRANT ALL PRIVILEGES ON DATABASE homedepot_paisano TO your_user;
```

### Migration Already Exists

If migrations were partially run, check the current state:

```bash
npx knex migrate:status
```

Then rollback if needed:

```bash
npx knex migrate:rollback
```

## Best Practices

1. **Never modify existing migrations** - Create a new migration to alter the schema
2. **Always test migrations** - Run on development/test database first
3. **Use transactions** - Knex automatically wraps migrations in transactions
4. **Backup production** - Always backup before running migrations in production
5. **Version control** - Commit migrations to git before running them
6. **Down migrations** - Always implement proper rollback logic

## Production Deployment

For production deployments:

1. Backup the database
2. Run migrations in a transaction
3. Test the application
4. Monitor for errors
5. Have a rollback plan ready

```bash
NODE_ENV=production npx knex migrate:latest
```

## Additional Resources

- [Knex.js Documentation](http://knexjs.org/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [PostgreSQL ENUM Types](https://www.postgresql.org/docs/current/datatype-enum.html)
