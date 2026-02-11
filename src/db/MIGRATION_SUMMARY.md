# Knex Migrations and Seeds - Complete Summary

This document provides a comprehensive overview of all database migrations and seeds created for the HomeDepot Paisano platform.

## Files Created

### Migrations (23 files)

Located in: `/home/darthvader/AI_Projects/Samaritan/src/db/migrations/`

| Order | File | Description | Tables/Features |
|-------|------|-------------|-----------------|
| 1 | 20240101000001_create_extensions.ts | PostgreSQL Extensions | uuid-ossp, postgis, pg_trgm |
| 2 | 20240101000002_create_enums.ts | Custom ENUM Types | 10 enum types for type safety |
| 3 | 20240101000003_create_users.ts | Users Table | Base authentication and profile |
| 4 | 20240101000004_create_categories.ts | Categories Table | Job categories/skills |
| 5 | 20240101000005_create_worker_profiles.ts | Worker Profiles | PostGIS location, ratings |
| 6 | 20240101000006_create_contractor_profiles.ts | Contractor Profiles | Company info, PostGIS location |
| 7 | 20240101000007_create_worker_skills.ts | Worker Skills | Many-to-many junction table |
| 8 | 20240101000008_create_jobs.ts | Jobs Table | Job postings with PostGIS |
| 9 | 20240101000009_create_job_applications.ts | Applications | Worker bids on jobs |
| 10 | 20240101000010_create_contracts.ts | Contracts | Accepted jobs with terms |
| 11 | 20240101000011_create_time_entries.ts | Time Tracking | Hourly work logging |
| 12 | 20240101000012_create_milestones.ts | Milestones | Fixed-price project phases |
| 13 | 20240101000013_create_reviews.ts | Reviews | Bidirectional ratings |
| 14 | 20240101000014_create_payment_methods.ts | Payment Methods | Stripe payment info |
| 15 | 20240101000015_create_transactions.ts | Transactions | Payment history |
| 16 | 20240101000016_create_notifications.ts | Notifications | User notifications |
| 17 | 20240101000017_create_conversations.ts | Conversations | Message threads |
| 18 | 20240101000018_create_conversation_participants.ts | Participants | Thread membership |
| 19 | 20240101000019_create_messages.ts | Messages | Chat messages |
| 20 | 20240101000020_create_saved_searches.ts | Saved Searches | Job search queries |
| 21 | 20240101000021_create_analytics_events.ts | Analytics | User tracking events |
| 22 | 20240101000022_create_indexes.ts | Search Indexes | Full-text search (GIN) |
| 23 | 20240101000023_create_triggers.ts | Database Triggers | Auto-update timestamps |

### Seeds (3 files)

Located in: `/home/darthvader/AI_Projects/Samaritan/src/db/seeds/`

| Order | File | Description | Records |
|-------|------|-------------|---------|
| 1 | 01_categories.ts | Job Categories | 20 categories |
| 2 | 02_sample_users.ts | Base Sample Data | 5 users, 2 workers, 2 contractors, 2 jobs |
| 3 | 03_additional_sample_data.ts | Extended Data | Jobs, contracts, reviews, messages, etc. |

### Helper Scripts (4 files)

Located in: `/home/darthvader/AI_Projects/Samaritan/src/db/scripts/`

| File | Purpose | npm Command |
|------|---------|-------------|
| reset-db.ts | Full database reset | npm run db:reset |
| db-status.ts | Database status report | npm run db:status |
| validate-migrations.ts | Validate migration syntax | npm run db:validate |
| validate-seeds.ts | Validate seed syntax | npm run db:validate |

### Documentation (2 files)

| File | Purpose |
|------|---------|
| /src/db/README.md | Detailed database documentation |
| /DATABASE_SETUP.md | Complete setup guide |

## Database Schema Features

### ENUM Types (10 total)

1. **user_role**: worker, contractor, admin, moderator
2. **user_status**: active, inactive, suspended, pending_verification
3. **job_status**: draft, published, in_progress, completed, cancelled, disputed
4. **job_type**: one_time, recurring, contract
5. **payment_type**: hourly, fixed, milestone
6. **application_status**: pending, shortlisted, accepted, rejected, withdrawn
7. **contract_status**: draft, active, completed, terminated, disputed
8. **payment_method_type**: credit_card, debit_card, bank_account, paypal, stripe
9. **transaction_type**: payment, refund, withdrawal, fee, adjustment
10. **transaction_status**: pending, processing, completed, failed, cancelled
11. **notification_type**: new_job_match, application_received, application_status_changed, contract_offered, contract_signed, payment_received, review_received, message_received, system_announcement

### PostGIS Geospatial Features

Three tables use PostGIS GEOGRAPHY(POINT, 4326):
- worker_profiles.location
- contractor_profiles.location
- jobs.location

GIST spatial indexes created for efficient geospatial queries:
- Distance-based job matching
- Service radius calculations
- Location-based search

### Full-Text Search

GIN indexes created for:
- jobs: title and description
- worker_profiles: bio

### JSONB Columns (8 columns)

Flexible JSON storage:
- worker_profiles.verification_documents
- contractor_profiles.verification_documents
- jobs.required_skills
- jobs.attachments
- job_applications.attachments
- messages.attachments
- notifications.data
- saved_searches.search_criteria
- analytics_events.event_data

### Automatic Timestamps

Triggers created for auto-updating `updated_at`:
- users
- worker_profiles
- contractor_profiles
- jobs
- job_applications
- contracts
- reviews
- conversations

### Foreign Key Relationships

Proper CASCADE behavior:
- Users deleted → profiles deleted
- Conversations deleted → messages deleted
- Jobs deleted → applications deleted
- etc.

## Seeded Data Summary

### After Running All Seeds

| Table | Record Count | Description |
|-------|--------------|-------------|
| users | 5 | 1 admin, 2 workers, 2 contractors |
| worker_profiles | 2 | Juan Garcia, Maria Rodriguez |
| contractor_profiles | 2 | Smith Construction, Johnson Home Services |
| categories | 20 | All job categories |
| worker_skills | 5 | Skills mapped to workers |
| jobs | 5 | Various job postings |
| job_applications | 5 | Applications in different states |
| contracts | 2 | 1 active, 1 completed |
| time_entries | 3 | Time tracking entries |
| milestones | 2 | Payment milestones |
| reviews | 2 | Bidirectional reviews |
| payment_methods | 2 | Stripe payment methods |
| transactions | 2 | Completed payments |
| conversations | 1 | Message thread |
| conversation_participants | 2 | Participants in thread |
| messages | 5 | Chat messages |
| notifications | 6 | User notifications |
| saved_searches | 2 | Saved job queries |
| analytics_events | 3 | Tracking events |

## Usage Examples

### Initial Setup

```bash
npm install
npm run migrate
npm run seed
npm run db:status
```

### Development Workflow

```bash
npm run db:reset      # Clean slate
npm run migrate       # Apply schema changes
npm run seed          # Populate with sample data
npm run db:status     # Verify setup
```

### Creating New Migrations

```bash
npm run migrate:make create_new_table
```

Edit the file in `src/db/migrations/`, then:

```bash
npm run migrate       # Apply changes
```

### Creating New Seeds

```bash
npm run seed:make 04_more_sample_data
```

Edit the file in `src/db/seeds/`, then:

```bash
npm run seed          # Run seeds
```

### Validation

```bash
npm run db:validate   # Check migrations and seeds syntax
```

### Rollback

```bash
npm run migrate:rollback     # Rollback last batch
npm run migrate:rollback --all   # Rollback everything
```

## Test Data Credentials

All test users use password: `password123`

### Admin Access
```
Email: admin@homedepotpaisano.com
Password: password123
```

### Worker Accounts
```
Email: worker1@example.com (Juan Garcia - Construction)
Password: password123

Email: worker2@example.com (Maria Rodriguez - Painting)
Password: password123
```

### Contractor Accounts
```
Email: contractor1@example.com (Smith Construction LLC)
Password: password123

Email: contractor2@example.com (Johnson Home Services)
Password: password123
```

## Configuration

### Knex Configuration (knexfile.ts)

Three environments configured:
- development (local PostgreSQL)
- test (separate test database)
- production (with SSL)

All read from environment variables in `.env`

### Environment Variables Required

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

## Migration Strategy

### Naming Convention
`YYYYMMDDHHMMSS_description.ts`

Example: `20240101000001_create_extensions.ts`

### Execution Order
Migrations run in timestamp order, ensuring proper dependency management.

### Best Practices Implemented
- Extensions first
- ENUMs before tables
- Parent tables before child tables
- Indexes after table creation
- Triggers last
- Proper down() methods for rollback

## Performance Optimizations

### Indexes Created
- B-tree indexes on foreign keys
- GIST indexes for geospatial queries
- GIN indexes for full-text search
- Composite indexes for common queries

### Examples:
```sql
CREATE INDEX idx_jobs_location ON jobs USING GIST(location);
CREATE INDEX idx_jobs_search ON jobs USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_users_role_status ON users(role, status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

## Next Steps

1. Test migrations on clean database
2. Verify seed data integrity
3. Implement Knex models/queries
4. Create API routes
5. Add authentication middleware
6. Write unit tests
7. Write E2E tests
8. Deploy to staging environment

## Troubleshooting

### Common Issues

1. **PostGIS not found**
   ```bash
   sudo apt install postgresql-14-postgis-3
   psql -c "CREATE EXTENSION postgis;"
   ```

2. **Migration already exists**
   ```bash
   npm run migrate:status
   npm run migrate:rollback
   ```

3. **Permission denied**
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE homedepot_paisano TO your_user;
   ```

4. **Seed data conflicts**
   ```bash
   npm run db:reset
   ```

## Resources

- Knex.js: http://knexjs.org/
- PostGIS: https://postgis.net/
- PostgreSQL ENUM: https://www.postgresql.org/docs/current/datatype-enum.html
- Project Documentation: /src/db/README.md
- Setup Guide: /DATABASE_SETUP.md
