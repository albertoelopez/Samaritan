# Docker Infrastructure Setup Summary

## Created Files

### Core Docker Files
1. **docker-compose.yml** - Main orchestration file with 3 services
2. **Dockerfile** - Multi-stage build (development & production)
3. **.dockerignore** - Optimizes build context

### Database Initialization
4. **docker/postgres/init/01-init-postgis.sql** - Enables PostGIS extensions

### Helper Scripts
5. **docker-start.sh** - Automated startup script with validation
6. **docker-validate.sh** - Validates Docker setup before running
7. **Makefile** - Convenient shortcuts for common commands

### Documentation
8. **DOCKER.md** - Comprehensive Docker usage guide
9. **docker-compose.override.yml.example** - Example local overrides

## Services Configuration

### PostgreSQL (postgis/postgis:15-3.4-alpine)
- **Port**: 5432
- **Database**: homedepot_paisano (configurable via .env)
- **Extensions Enabled**:
  - PostGIS (spatial and geographic objects)
  - PostGIS Topology
  - Fuzzystrmatch (fuzzy string matching)
  - PostGIS Tiger Geocoder
- **Health Check**: pg_isready every 10s
- **Persistence**: Named volume `homedepot_paisano_postgres_data`
- **Network**: paisano_network

### Redis (redis:7-alpine)
- **Port**: 6379
- **Password Protected**: Via REDIS_PASSWORD env var
- **Persistence**: AOF (Append Only File) enabled
- **Health Check**: redis-cli ping every 10s
- **Persistence**: Named volume `homedepot_paisano_redis_data`
- **Network**: paisano_network

### Application (Node.js 20 Alpine)
- **Port**: 3000 (configurable via .env)
- **Build Targets**:
  - `development`: Hot-reload with nodemon, source mounted
  - `production`: Compiled TypeScript, optimized image, non-root user
- **Health Check**: HTTP GET /health every 30s
- **Volumes**:
  - Development: Source code mounted for hot-reload
  - Production: Only necessary files copied
  - Logs: Named volume `homedepot_paisano_app_logs`
- **Dependencies**: Waits for PostgreSQL and Redis health checks
- **Network**: paisano_network

## Environment Variables

The docker-compose.yml file sources all variables from .env file, matching .env.example structure:

### Database Configuration
- DB_HOST=postgres (internal Docker hostname)
- DB_PORT=5432
- DB_NAME, DB_USER, DB_PASSWORD

### Redis Configuration
- REDIS_HOST=redis (internal Docker hostname)
- REDIS_PORT=6379
- REDIS_PASSWORD

### Application Configuration
All environment variables from .env.example are passed through, including:
- Authentication (JWT, OAuth2)
- Security settings
- External services (Stripe, Twilio, SendGrid, AWS)
- Rate limiting
- Logging configuration

## Quick Start Instructions

### 1. Validate Setup
```bash
./docker-validate.sh
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env and update at minimum:
#   - DB_PASSWORD
#   - REDIS_PASSWORD
#   - JWT_ACCESS_SECRET
#   - JWT_REFRESH_SECRET
#   - ENCRYPTION_KEY (32 chars)
#   - ENCRYPTION_IV (16 chars)
#   - SESSION_SECRET
```

### 3. Start Services
Option A - Using helper script:
```bash
./docker-start.sh
```

Option B - Using Makefile:
```bash
make up
```

Option C - Using Docker Compose directly:
```bash
docker compose up -d
```

### 4. Verify Services
```bash
docker compose ps
```

All services should show status as "Up (healthy)"

### 5. Run Migrations
```bash
docker compose exec app npm run migrate
```

### 6. Seed Database
```bash
docker compose exec app npm run seed
```

## Common Commands

### Via Makefile (Recommended)
```bash
make help          # Show all available commands
make up            # Start services
make down          # Stop services
make logs          # View application logs
make shell         # Access application shell
make db-shell      # Access PostgreSQL shell
make redis-shell   # Access Redis CLI
make migrate       # Run database migrations
make test          # Run tests
make clean         # Remove all containers and volumes
```

### Direct Docker Compose
```bash
docker compose up -d              # Start in background
docker compose down               # Stop services
docker compose logs -f app        # Follow app logs
docker compose ps                 # Service status
docker compose exec app sh        # App shell
docker compose restart app        # Restart app
```

## Networking

All services communicate on an isolated bridge network `paisano_network`.

Internal hostnames:
- postgres (PostgreSQL server)
- redis (Redis server)
- app (Application server)

External access:
- Application: localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Volumes

Three named volumes provide data persistence:

1. **homedepot_paisano_postgres_data**
   - PostgreSQL database files
   - Persists across container restarts

2. **homedepot_paisano_redis_data**
   - Redis AOF and RDB files
   - Persists cache and session data

3. **homedepot_paisano_app_logs**
   - Application logs directory
   - Mounted at /var/log/homedepot-paisano

## Security Features

1. **Non-root user**: App runs as nodejs (UID 1001)
2. **Password protected Redis**: Requires REDIS_PASSWORD
3. **Network isolation**: Services on private bridge network
4. **Health checks**: Automatic restart on failures
5. **Restart policy**: unless-stopped for all services
6. **Secret management**: All secrets via environment variables
7. **Multi-stage builds**: Minimal production image surface area

## Health Checks

### PostgreSQL
- Command: `pg_isready -U postgres -d homedepot_paisano`
- Interval: 10s
- Timeout: 5s
- Retries: 5
- Start period: 10s

### Redis
- Command: `redis-cli --raw incr ping`
- Interval: 10s
- Timeout: 3s
- Retries: 5
- Start period: 5s

### Application
- Command: HTTP GET to /health endpoint
- Interval: 30s
- Timeout: 10s
- Retries: 3
- Start period: 40s

## Production Deployment

To run in production mode:

```bash
export NODE_ENV=production
docker compose up -d --build
```

Production build differences:
- TypeScript compiled to JavaScript
- Only production dependencies installed
- Optimized Docker layers
- Non-root user enforced
- Health checks included in image

## Troubleshooting

### Services won't start
```bash
docker compose logs postgres
docker compose logs redis
docker compose logs app
```

### PostGIS not working
```bash
docker compose exec postgres psql -U postgres -d homedepot_paisano -c "SELECT PostGIS_version();"
```

### Port conflicts
Edit .env and change:
```
PORT=3001
DB_PORT=5433
REDIS_PORT=6380
```

### Clean slate restart
```bash
make clean  # or: docker compose down -v
docker compose up -d --build
```

## Development Workflow

1. Source code changes automatically reload (nodemon)
2. Install new packages:
   ```bash
   docker compose exec app npm install package-name
   ```
3. Run tests:
   ```bash
   docker compose exec app npm test
   ```
4. Access logs:
   ```bash
   docker compose logs -f app
   ```

## Files Reference

| File | Purpose |
|------|---------|
| docker-compose.yml | Service orchestration configuration |
| Dockerfile | Multi-stage app image build |
| .dockerignore | Optimize build context |
| docker/postgres/init/01-init-postgis.sql | Enable PostGIS extensions |
| docker-start.sh | Automated startup with validation |
| docker-validate.sh | Pre-flight checks |
| Makefile | Convenient command shortcuts |
| DOCKER.md | Comprehensive documentation |

## Next Steps

1. Review and customize .env file
2. Run ./docker-validate.sh
3. Start services with ./docker-start.sh or make up
4. Implement /health endpoint in application
5. Run database migrations
6. Seed initial data
7. Begin development

## Support Resources

- Docker Documentation: https://docs.docker.com/
- PostGIS Documentation: https://postgis.net/docs/
- Redis Documentation: https://redis.io/docs/
- Docker Compose Documentation: https://docs.docker.com/compose/
