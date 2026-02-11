# Docker Infrastructure Guide

This document provides instructions for running HomeDepot Paisano using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM available for Docker
- Ports 3000, 5432, and 6379 available

## Services

The Docker setup includes three services:

1. **PostgreSQL 15 with PostGIS** - Database with geospatial extensions
2. **Redis 7** - In-memory cache and session store
3. **App** - Node.js application (development or production mode)

## Quick Start

### 1. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update at minimum:
- `DB_PASSWORD` - Strong PostgreSQL password
- `REDIS_PASSWORD` - Strong Redis password
- `JWT_ACCESS_SECRET` - 32+ character secret
- `JWT_REFRESH_SECRET` - 32+ character secret
- `ENCRYPTION_KEY` - 32 character encryption key
- `ENCRYPTION_IV` - 16 character initialization vector
- `SESSION_SECRET` - Strong session secret

### 2. Start Services (Development Mode)

```bash
docker-compose up -d
```

This starts all services in development mode with hot-reload enabled.

### 3. View Logs

```bash
docker-compose logs -f app
```

### 4. Run Database Migrations

```bash
docker-compose exec app npm run migrate
```

### 5. Seed Database

```bash
docker-compose exec app npm run seed
```

### 6. Access Services

- Application: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Production Mode

To run in production mode:

```bash
NODE_ENV=production docker-compose up -d --build
```

The multi-stage Dockerfile will:
1. Install production dependencies only
2. Compile TypeScript to JavaScript
3. Create an optimized production image
4. Run as non-root user (nodejs)
5. Include health checks

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### Stop and Remove Volumes (WARNING: Deletes all data)
```bash
docker-compose down -v
```

### Rebuild Images
```bash
docker-compose build --no-cache
```

### View Service Status
```bash
docker-compose ps
```

### Access PostgreSQL Shell
```bash
docker-compose exec postgres psql -U postgres -d homedepot_paisano
```

### Access Redis CLI
```bash
docker-compose exec redis redis-cli -a your_redis_password
```

### Execute Commands in App Container
```bash
docker-compose exec app npm test
docker-compose exec app npm run lint
```

### Restart a Service
```bash
docker-compose restart app
```

### Scale Services (Not recommended for stateful services)
```bash
docker-compose up -d --scale app=3
```

## Health Checks

All services include health checks:

- **PostgreSQL**: Checks if database accepts connections
- **Redis**: Pings Redis server
- **App**: HTTP request to /health endpoint

View health status:
```bash
docker-compose ps
```

## Volume Management

Three named volumes persist data:

1. `homedepot_paisano_postgres_data` - PostgreSQL database
2. `homedepot_paisano_redis_data` - Redis data
3. `homedepot_paisano_app_logs` - Application logs

### Backup Database

```bash
docker-compose exec postgres pg_dump -U postgres homedepot_paisano > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker-compose exec -T postgres psql -U postgres homedepot_paisano
```

### List Volumes

```bash
docker volume ls | grep homedepot_paisano
```

### Inspect Volume

```bash
docker volume inspect homedepot_paisano_postgres_data
```

## Networking

Services communicate via the `paisano_network` bridge network.

Service hostnames from within containers:
- PostgreSQL: `postgres`
- Redis: `redis`
- App: `app`

## PostGIS Verification

Verify PostGIS extension is installed:

```bash
docker-compose exec postgres psql -U postgres -d homedepot_paisano -c "SELECT PostGIS_version();"
```

## Troubleshooting

### Services Won't Start

Check logs:
```bash
docker-compose logs postgres
docker-compose logs redis
docker-compose logs app
```

### Permission Errors

The app runs as user `nodejs` (UID 1001). If you encounter permission issues:
```bash
docker-compose exec -u root app chown -R nodejs:nodejs /app
```

### Port Already in Use

Change ports in `.env`:
```
PORT=3001
DB_PORT=5433
REDIS_PORT=6380
```

### PostgreSQL Won't Start

Remove volume and recreate (WARNING: Data loss):
```bash
docker-compose down -v
docker volume rm homedepot_paisano_postgres_data
docker-compose up -d
```

### Redis Authentication Failed

Ensure `REDIS_PASSWORD` in `.env` matches the password in Redis command.

### Build Failures

Clear Docker build cache:
```bash
docker builder prune -a
docker-compose build --no-cache
```

### Out of Disk Space

Remove unused Docker resources:
```bash
docker system prune -a --volumes
```

## Development Workflow

### Hot Reload

The development container mounts source code as a volume. Changes to files in `src/` trigger automatic restart via nodemon.

### Install New Dependencies

```bash
docker-compose exec app npm install package-name
```

Or rebuild container:
```bash
docker-compose down
docker-compose up -d --build
```

### Run Tests

```bash
docker-compose exec app npm test
docker-compose exec app npm run test:coverage
```

### Access Container Shell

```bash
docker-compose exec app sh
```

## Security Notes

1. **Never commit .env** - Contains sensitive credentials
2. **Change default passwords** - Update all passwords in .env
3. **Use secrets in production** - Consider Docker secrets or external secret management
4. **Regular updates** - Keep base images updated
5. **Non-root user** - App runs as `nodejs` user (UID 1001)
6. **Network isolation** - Services on isolated bridge network
7. **Health checks** - Automatic restart on failures

## Performance Tuning

### PostgreSQL

Edit `docker-compose.yml` to add PostgreSQL configuration:

```yaml
postgres:
  command:
    - "postgres"
    - "-c"
    - "shared_buffers=256MB"
    - "-c"
    - "max_connections=200"
```

### Redis

For persistence tuning, modify Redis command in `docker-compose.yml`:

```yaml
redis:
  command: redis-server --requirepass password --maxmemory 256mb --maxmemory-policy allkeys-lru
```

## Monitoring

### Container Stats

```bash
docker stats
```

### Resource Usage

```bash
docker-compose top
```

### Logs with Timestamps

```bash
docker-compose logs -f -t app
```

## Cleanup

### Remove Stopped Containers

```bash
docker-compose rm
```

### Remove All Project Resources

```bash
docker-compose down -v --rmi all
```

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Build Docker image
  run: docker-compose build

- name: Run tests
  run: |
    docker-compose up -d postgres redis
    docker-compose run app npm test
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Redis Documentation](https://redis.io/documentation)
