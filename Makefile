.PHONY: help build up down restart logs ps shell db-shell redis-shell migrate seed test clean

help:
	@echo "HomeDepot Paisano - Docker Management"
	@echo ""
	@echo "Available commands:"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start all services"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - View application logs"
	@echo "  make ps          - View service status"
	@echo "  make shell       - Access application shell"
	@echo "  make db-shell    - Access PostgreSQL shell"
	@echo "  make redis-shell - Access Redis CLI"
	@echo "  make migrate     - Run database migrations"
	@echo "  make seed        - Seed database"
	@echo "  make test        - Run tests"
	@echo "  make clean       - Remove containers and volumes"
	@echo ""

build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started. Waiting for health checks..."
	@sleep 5
	@docker-compose ps

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f app

ps:
	docker-compose ps

shell:
	docker-compose exec app sh

db-shell:
	docker-compose exec postgres psql -U postgres -d homedepot_paisano

redis-shell:
	docker-compose exec redis redis-cli

migrate:
	docker-compose exec app npm run migrate

seed:
	docker-compose exec app npm run seed

test:
	docker-compose exec app npm test

clean:
	docker-compose down -v
	@echo "All containers and volumes removed"
