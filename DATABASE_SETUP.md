# Database Setup - Complete Guide

This guide provides everything you need to set up and use the PostgreSQL database for the HomeDepot Paisano platform.

## Quick Start

```bash
npm run migrate
npm run seed
npm run db:status
```

## Database Structure Summary

### 23 Migration Files Created

All migrations are located in `/home/darthvader/AI_Projects/Samaritan/src/db/migrations/`

1. **Extensions** (20240101000001) - uuid-ossp, postgis, pg_trgm
2. **ENUMs** (20240101000002) - All custom enum types
3. **Users** (20240101000003) - Base user authentication table
4. **Categories** (20240101000004) - Job categories/skills
5. **Worker Profiles** (20240101000005) - Worker data with PostGIS
6. **Contractor Profiles** (20240101000006) - Contractor/company data
7. **Worker Skills** (20240101000007) - Junction table for skills
8. **Jobs** (20240101000008) - Job postings
9. **Job Applications** (20240101000009) - Worker bids
10. **Contracts** (20240101000010) - Accepted jobs
11. **Time Entries** (20240101000011) - Hourly time tracking
12. **Milestones** (20240101000012) - Payment milestones
13. **Reviews** (20240101000013) - Ratings and feedback
14. **Payment Methods** (20240101000014) - Stored payment info
15. **Transactions** (20240101000015) - Payment history
16. **Notifications** (20240101000016) - User notifications
17. **Conversations** (20240101000017) - Message threads
18. **Conversation Participants** (20240101000018) - Thread members
19. **Messages** (20240101000019) - Chat messages
20. **Saved Searches** (20240101000020) - Saved job queries
21. **Analytics Events** (20240101000021) - User tracking
22. **Search Indexes** (20240101000022) - Full-text search
23. **Triggers** (20240101000023) - Auto-update timestamps

### 3 Seed Files Created

All seeds are located in `/home/darthvader/AI_Projects/Samaritan/src/db/seeds/`

1. **01_categories.ts** - 20 job categories
2. **02_sample_users.ts** - Sample users, profiles, and basic jobs
3. **03_additional_sample_data.ts** - Extended realistic data

## Seed Data Overview

### Users (Login Credentials)

All users have password: `password123`

**Admin:**
- Email: admin@homedepotpaisano.com
- Role: admin

**Workers:**
1. Juan Garcia
   - Email: worker1@example.com
   - Role: worker
   - Skills: Construction, General Labor, Demolition
   - Experience: 10 years
   - Location: Los Angeles (34.0522, -118.2437)

2. Maria Rodriguez
   - Email: worker2@example.com
   - Role: worker
   - Skills: Painting, Drywall
   - Experience: 5 years
   - Location: Pasadena (34.1522, -118.1937)

**Contractors:**
1. John Smith - Smith Construction LLC
   - Email: contractor1@example.com
   - Role: contractor
   - Location: West Hollywood (34.0925, -118.3287)

2. Sarah Johnson - Johnson Home Services
   - Email: contractor2@example.com
   - Role: contractor
   - Location: Torrance (33.9425, -118.3987)

### Categories (20 Total)

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

### Sample Jobs (5 Total)

1. Kitchen Renovation Helper Needed (Published, Active Contract)
2. House Painting - Interior (Published, Pending Application)
3. Drywall Installation - New Construction (In Progress)
4. Landscaping - Backyard Renovation (Published)
5. Electrical Work - Office Rewiring (Published)

### Additional Data Seeded

- **Job Applications**: 5 applications with various statuses
- **Contracts**: 2 contracts (1 active, 1 completed)
- **Time Entries**: 3 time entries (2 approved, 1 pending)
- **Milestones**: 2 milestones (both completed and paid)
- **Reviews**: 2 bidirectional reviews (5 stars each)
- **Payment Methods**: 2 payment methods
- **Transactions**: 2 completed payments ($1,710 each)
- **Conversations**: 1 conversation with 5 messages
- **Notifications**: 6 notifications (4 read, 2 unread)
- **Saved Searches**: 2 saved job searches
- **Analytics Events**: 3 tracking events

## Available npm Scripts

### Database Operations

```bash
npm run migrate              # Run all pending migrations
npm run migrate:rollback     # Rollback last batch of migrations
npm run migrate:status       # Check migration status
npm run migrate:make <name>  # Create new migration

npm run seed                 # Run all seed files
npm run seed:make <name>     # Create new seed file

npm run db:reset             # Full database reset (rollback + migrate + seed)
npm run db:status            # Comprehensive database status check
```

### Helper Scripts Created

Two TypeScript helper scripts in `/home/darthvader/AI_Projects/Samaritan/src/db/scripts/`:

1. **reset-db.ts** - Complete database reset
2. **db-status.ts** - Detailed database status report

## Database Features

### PostGIS Geospatial Queries

The database uses PostGIS for location-based features:

```sql
-- Find jobs within 30km of a worker's location
SELECT j.*
FROM jobs j
JOIN worker_profiles wp ON wp.user_id = $1
WHERE ST_DWithin(
  j.location,
  wp.location,
  wp.service_radius_km * 1000
)
AND j.status = 'published';
```

### Full-Text Search

Full-text search is enabled on:
- Job titles and descriptions
- Worker profile bios

```sql
-- Search jobs by keywords
SELECT *
FROM jobs
WHERE to_tsvector('english', title || ' ' || description)
      @@ to_tsquery('english', 'kitchen & renovation');
```

### Automatic Timestamps

The following tables have automatic `updated_at` triggers:
- users
- worker_profiles
- contractor_profiles
- jobs
- job_applications
- contracts
- reviews
- conversations

### JSONB Columns

Several tables use JSONB for flexible data storage:
- `worker_profiles.verification_documents`
- `jobs.required_skills`
- `jobs.attachments`
- `job_applications.attachments`
- `messages.attachments`
- `notifications.data`
- `saved_searches.search_criteria`
- `analytics_events.event_data`

## Environment Variables

Required in `.env` file (see `.env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homedepot_paisano
DB_USER=postgres
DB_PASSWORD=your_secure_password

TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=homedepot_paisano_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_secure_password
```

## Prerequisites

### 1. Install PostgreSQL 12+

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Install PostGIS Extension

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-14-postgis-3
```

**macOS:**
```bash
brew install postgis
```

### 3. Create Database

```bash
sudo -u postgres psql

postgres=# CREATE DATABASE homedepot_paisano;
postgres=# CREATE USER your_user WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE homedepot_paisano TO your_user;
postgres=# \q
```

### 4. Enable Extensions

```bash
psql -U your_user -d homedepot_paisano

homedepot_paisano=# CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
homedepot_paisano=# CREATE EXTENSION IF NOT EXISTS "postgis";
homedepot_paisano=# CREATE EXTENSION IF NOT EXISTS "pg_trgm";
homedepot_paisano=# \q
```

## First-Time Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure
4. Run migrations: `npm run migrate`
5. Seed the database: `npm run seed`
6. Check status: `npm run db:status`

## Verifying Setup

After running migrations and seeds, you should see:

```
Table counts:
  users: 5 records
  worker_profiles: 2 records
  contractor_profiles: 2 records
  categories: 20 records
  jobs: 5 records
  job_applications: 5 records
  contracts: 2 records
  time_entries: 3 records
  milestones: 2 records
  reviews: 2 records
  payment_methods: 2 records
  transactions: 2 records
  notifications: 6 records
  conversations: 1 records
  messages: 5 records
  saved_searches: 2 records
  analytics_events: 3 records
```

## Testing

For testing, use separate test database:

```bash
NODE_ENV=test npm run migrate
NODE_ENV=test npm run seed
```

## Troubleshooting

### PostgreSQL Connection Refused

```bash
sudo service postgresql start
```

### Permission Denied

```sql
ALTER USER your_user WITH SUPERUSER;
```

Or grant specific permissions:
```sql
GRANT ALL PRIVILEGES ON DATABASE homedepot_paisano TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### PostGIS Not Found

Make sure PostGIS is installed and enabled:
```bash
sudo apt install postgresql-14-postgis-3
psql -U postgres -d homedepot_paisano -c "CREATE EXTENSION postgis;"
```

### Migration Already Executed

Check migration status:
```bash
npm run migrate:status
```

If needed, rollback and re-run:
```bash
npm run migrate:rollback
npm run migrate
```

## Production Deployment

1. Backup existing database
2. Set `NODE_ENV=production`
3. Run migrations: `NODE_ENV=production npm run migrate`
4. DO NOT run seeds in production (only for development)
5. Monitor logs for errors
6. Have rollback plan ready

## Database Diagram

```
users
├── worker_profiles (PostGIS location)
│   ├── worker_skills → categories
│   ├── job_applications → jobs
│   ├── contracts
│   └── time_entries
│
├── contractor_profiles (PostGIS location)
│   ├── jobs (PostGIS location)
│   │   ├── job_applications
│   │   └── conversations
│   └── contracts
│
├── conversations
│   ├── conversation_participants
│   └── messages
│
├── payment_methods
├── notifications
├── saved_searches
└── analytics_events

contracts
├── time_entries
├── milestones
├── transactions
└── reviews

transactions
└── payment_methods
```

## Key Relationships

- Users have one profile (worker OR contractor)
- Workers apply to jobs → job_applications
- Accepted applications become contracts
- Contracts can have time_entries (hourly) OR milestones (fixed)
- Both parties can leave reviews on completed contracts
- Transactions track all payments (linked to contracts/milestones)
- Conversations can be job-specific or contract-specific
- PostGIS enables geospatial job matching

## Next Steps

After database setup is complete:

1. Implement backend models using Knex query builder
2. Create API routes for CRUD operations
3. Add authentication middleware
4. Implement WebSocket handlers for real-time features
5. Write unit tests for database queries
6. Write E2E tests for complete workflows

## Support

For more details, see:
- `/home/darthvader/AI_Projects/Samaritan/src/db/README.md` - Detailed database documentation
- `/home/darthvader/AI_Projects/Samaritan/database-schema.sql` - Original SQL schema
- `/home/darthvader/AI_Projects/Samaritan/knexfile.ts` - Knex configuration
